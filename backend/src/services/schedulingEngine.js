const { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } = require('date-fns');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const Process = require('../models/Process');
const Leave = require('../models/Leave');
const PublicHoliday = require('../models/PublicHoliday');
const Assignment = require('../models/Assignment');

const getIdString = value => {
  if (!value) return null;
  return (value._id || value).toString();
};

class SchedulingEngine {
  constructor(month, year, pods = [], brands = []) {
    this.month = month;
    this.year = year;
    this.pods = pods;
    this.brands = brands;
    this.conflicts = [];
    this.schedule = [];
    this.employeeWorkload = new Map();
  }

  /**
   * Main scheduling function
   */
  async generateSchedule() {
    try {
      // Get date range
      const startDate = new Date(this.year, this.month - 1, 1);
      const endDate = endOfMonth(startDate);
      const dates = eachDayOfInterval({ start: startDate, end: endDate });

      // Load necessary data
      await this.loadData();

      // Generate schedule for each date
      for (const date of dates) {
        await this.scheduleDate(date);
      }

      return {
        schedule: this.schedule,
        conflicts: this.conflicts,
        isValid: this.conflicts.filter(c => c.severity === 'critical').length === 0
      };
    } catch (error) {
      console.error('Scheduling error:', error);
      throw error;
    }
  }

  /**
   * Load all necessary data for scheduling
   */
  async loadData() {
    // Load public holidays for this month
    const startDate = new Date(this.year, this.month - 1, 1);
    const endDate = endOfMonth(startDate);
    
    this.publicHolidays = await PublicHoliday.find({
      date: { $gte: startDate, $lte: endDate },
      isActive: true
    });

    // Load approved leaves for this month
    this.approvedLeaves = await Leave.find({
      status: 'approved',
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    }).populate('employee');

    // Load active brands (filtered if specified)
    const brandQuery = { status: 'active' };
    if (this.brands.length > 0) {
      brandQuery._id = { $in: this.brands };
    }
    this.activeBrands = await Brand.find(brandQuery)
      .populate('assignedEmployees')
      .populate('assignedPod');

    // Load active processes for these brands
    this.activeProcesses = await Process.find({
      brand: { $in: this.activeBrands.map(b => b._id) },
      isActive: true
    }).populate('assignedEmployees');

    // Load assignments
    this.assignments = await Assignment.find({
      brand: { $in: this.activeBrands.map(b => b._id) },
      isActive: true
    }).populate('employee').populate('brand').populate('process');

    // Load employees (filtered if pods specified)
    const employeeQuery = { employmentStatus: 'active' };
    if (this.pods.length > 0) {
      employeeQuery.operationalPod = { $in: this.pods };
    }
    this.employees = await Employee.find(employeeQuery);

    // Initialize workload tracking
    this.employees.forEach(emp => {
      this.employeeWorkload.set(emp._id.toString(), 0);
    });
  }

  /**
   * Schedule a single date
   */
  async scheduleDate(date) {
    const dayName = format(date, 'EEEE');
    const isPublicHoliday = this.isPublicHoliday(date);

    // Process each brand and its processes
    for (const brand of this.activeBrands) {
      const processes = this.activeProcesses.filter(
        p => p.brand.toString() === brand._id.toString()
      );

      for (const process of processes) {
        // Check if process should operate on this date
        if (!this.shouldProcessOperate(process, brand, date, dayName, isPublicHoliday)) {
          // Add non-required entries
          this.addNonRequiredEntries(brand, process, date);
          continue;
        }

        // Get eligible employees for this process
        const eligibleEmployees = this.getEligibleEmployees(
          brand,
          process,
          date,
          dayName,
          isPublicHoliday
        );
        const alreadyWorking = new Set(
          this.schedule
            .filter(entry =>
              entry.status === 'working' &&
              format(entry.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            )
            .map(entry => entry.employee.toString())
        );
        const alreadyScheduledCount = eligibleEmployees.filter(({ employee }) =>
          alreadyWorking.has(employee._id.toString())
        ).length;

        // Try to schedule employees
        const scheduled = this.scheduleEmployees(
          eligibleEmployees,
          brand,
          process,
          date,
          dayName,
          isPublicHoliday
        );

        // Check if minimum staffing requirement is met
        if (scheduled < process.minimumStaffingRequirement) {
          const diagnostics = this.lastEligibilityDiagnostics;
          const exclusionSummary = [
            `active assignments: ${diagnostics.activeAssignments}`,
            `inactive or missing employees: ${diagnostics.inactiveEmployees}`,
            `on approved leave: ${diagnostics.onApprovedLeave}`,
            `unavailable on this date: ${diagnostics.unavailable}`,
            `monthly work limit reached: ${diagnostics.monthlyLimit}`,
            `already working on another process: ${alreadyScheduledCount}`
          ].join('; ');
          const resolutionSteps = [];

          if (diagnostics.activeAssignments === 0) {
            resolutionSteps.push('Create active assignments for this brand and process.');
          }
          if (diagnostics.inactiveEmployees > 0) {
            resolutionSteps.push('Activate or replace inactive/missing employees.');
          }
          if (diagnostics.onApprovedLeave > 0) {
            resolutionSteps.push('Assign additional staff to cover approved leave.');
          }
          if (diagnostics.unavailable > 0) {
            resolutionSteps.push('Update date availability or assign other available staff.');
          }
          if (diagnostics.monthlyLimit > 0) {
            resolutionSteps.push('Add staff with remaining monthly capacity.');
          }
          if (alreadyScheduledCount > 0) {
            resolutionSteps.push('Add staff or rebalance assignments to avoid same-day double-booking.');
          }
          if (resolutionSteps.length === 0) {
            resolutionSteps.push('Add active assignments until the required staffing level can be met.');
          }

          this.addConflict({
            conflictType: 'insufficient-staffing',
            severity: 'critical',
            date,
            brand: brand._id,
            process: process._id,
            requiredEmployees: process.minimumStaffingRequirement,
            availableEmployees: scheduled,
            explanation: `Insufficient staffing for ${brand.brandName} - ${process.processName} on ${format(date, 'yyyy-MM-dd')}. Required: ${process.minimumStaffingRequirement}, Available: ${scheduled}. Eligibility check: ${exclusionSummary}.`,
            possibleResolution: resolutionSteps.join(' '),
            backupEmployees: this.findBackupEmployees(brand, process, date, dayName)
          });
        }
      }
    }
  }

  /**
   * Check if it's a public holiday
   */
  isPublicHoliday(date) {
    return this.publicHolidays.some(
      h => format(h.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  }

  /**
   * Check if process should operate on this date
   */
  shouldProcessOperate(process, brand, date, dayName, isPublicHoliday) {
    if (dayName === 'Sunday' &&
        (process.sundayPolicy === 'closed' || brand.sundayPolicy === 'closed')) return false;

    if (isPublicHoliday &&
        (process.holidayPolicy === 'closed' || brand.publicHolidayPolicy === 'closed')) return false;

    // Check operating calendar
    if (brand.operatingCalendar === 'except-holidays' && isPublicHoliday) return false;
    if (brand.operatingCalendar === 'except-sundays-holidays' &&
        (dayName === 'Sunday' || isPublicHoliday)) return false;
    if (brand.operatingCalendar === 'custom' &&
        !brand.customOperatingDays?.includes(dayName)) return false;

    // Process calendars can restrict operations even when the brand is open.
    if (process.operatingDays && process.operatingDays.length > 0) {
      return process.operatingDays.includes(dayName);
    }

    return true;
  }

  /**
   * Get eligible employees for a specific process on a specific date
   */
  getEligibleEmployees(brand, process, date, dayName, isPublicHoliday) {
    const eligible = [];
    this.lastEligibilityDiagnostics = {
      activeAssignments: 0,
      inactiveEmployees: 0,
      onApprovedLeave: 0,
      unavailable: 0,
      monthlyLimit: 0
    };

    // Get employees assigned to this process
    const assignedEmployees = this.assignments.filter(
      a => getIdString(a.process) === getIdString(process) &&
           getIdString(a.brand) === getIdString(brand) &&
           a.isActive
    );
    this.lastEligibilityDiagnostics.activeAssignments = assignedEmployees.length;

    for (const assignment of assignedEmployees) {
      const employee = assignment.employee;
      
      if (!employee || employee.employmentStatus !== 'active') {
        this.lastEligibilityDiagnostics.inactiveEmployees++;
        continue;
      }

      // Check if employee is on approved leave
      if (this.isEmployeeOnLeave(employee._id, date)) {
        this.lastEligibilityDiagnostics.onApprovedLeave++;
        continue;
      }

      // Check employee availability
      const dateKey = format(date, 'yyyy-MM-dd');
      if (employee.availability && employee.availability.get(dateKey) === false) {
        this.lastEligibilityDiagnostics.unavailable++;
        continue;
      }

      // Check workload
      const workload = this.employeeWorkload.get(employee._id.toString()) || 0;
      if (workload >= employee.maxWorkingDaysPerMonth) {
        this.lastEligibilityDiagnostics.monthlyLimit++;
        continue;
      }

      // Check weekly off preferences
      if (this.isPreferredWeeklyOff(employee, dayName) && !isPublicHoliday) {
        // Can still schedule but with lower priority
        eligible.push({ employee, assignment, priority: 2 });
      } else {
        eligible.push({ employee, assignment, priority: 1 });
      }
    }

    // Sort by priority (lower number = higher priority) and current workload
    return eligible.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      const workloadA = this.employeeWorkload.get(a.employee._id.toString()) || 0;
      const workloadB = this.employeeWorkload.get(b.employee._id.toString()) || 0;
      return workloadA - workloadB;
    });
  }

  /**
   * Check if employee is on approved leave
   */
  isEmployeeOnLeave(employeeId, date) {
    return this.approvedLeaves.some(leave => {
      return leave.employee._id.toString() === employeeId.toString() &&
             date >= leave.startDate &&
             date <= leave.endDate;
    });
  }

  /**
   * Check if it's employee's preferred weekly off
   */
  isPreferredWeeklyOff(employee, dayName) {
    return employee.weeklyOffPreferences && 
           employee.weeklyOffPreferences.includes(dayName);
  }

  /**
   * Schedule employees for a process
   */
  scheduleEmployees(eligibleEmployees, brand, process, date, dayName, isPublicHoliday) {
    let scheduled = 0;
    const required = process.minimumStaffingRequirement;

    for (const { employee, assignment } of eligibleEmployees) {
      if (scheduled >= required) {
        break;
      }

      // Check if already scheduled for another process on this date
      const alreadyScheduled = this.schedule.some(
        entry => entry.employee.toString() === employee._id.toString() &&
                 entry.status === 'working' &&
                 format(entry.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      if (alreadyScheduled) {
        continue;
      }

      // Schedule this employee
      this.schedule.push({
        employee: employee._id,
        brand: brand._id,
        process: process._id,
        date,
        status: 'working',
        shift: process.shiftRequirements || 'flexible'
      });

      // Update workload
      const currentWorkload = this.employeeWorkload.get(employee._id.toString()) || 0;
      this.employeeWorkload.set(employee._id.toString(), currentWorkload + 1);

      scheduled++;
    }

    return scheduled;
  }

  /**
   * Add non-required entries for days when process doesn't operate
   */
  addNonRequiredEntries(brand, process, date) {
    const dayName = format(date, 'EEEE');
    const isPublicHoliday = this.isPublicHoliday(date);

    // Get all assigned employees
    const assignedEmployees = this.assignments.filter(
      a => getIdString(a.process) === getIdString(process) &&
           getIdString(a.brand) === getIdString(brand) &&
           a.isActive
    );

    for (const assignment of assignedEmployees) {
      const employee = assignment.employee;
      
      if (!employee) continue;

      let status = 'not-required';
      
      if (isPublicHoliday) {
        status = 'public-holiday';
      } else if (dayName === 'Sunday' || this.isPreferredWeeklyOff(employee, dayName)) {
        status = 'weekly-off';
      } else if (this.isEmployeeOnLeave(employee._id, date)) {
        status = 'approved-leave';
      }

      this.schedule.push({
        employee: employee._id,
        brand: brand._id,
        process: process._id,
        date,
        status
      });
    }
  }

  /**
   * Find backup employees who could potentially cover
   */
  findBackupEmployees(brand, process, date, dayName) {
    const backups = [];

    // Look for employees in the same pod
    for (const employee of this.employees) {
      if (employee.operationalPod && 
          brand.assignedPod &&
          employee.operationalPod.toString() === brand.assignedPod.toString()) {
        
        // Check if not already assigned to this process
        const hasAssignment = this.assignments.some(
          a => getIdString(a.employee) === getIdString(employee) &&
               getIdString(a.process) === getIdString(process)
        );

        if (!hasAssignment && 
            !this.isEmployeeOnLeave(employee._id, date) &&
            employee.employmentStatus === 'active') {
          backups.push(employee._id);
        }
      }
    }

    return backups;
  }

  /**
   * Add conflict to the list
   */
  addConflict(conflict) {
    this.conflicts.push(conflict);
  }
}

module.exports = SchedulingEngine;
