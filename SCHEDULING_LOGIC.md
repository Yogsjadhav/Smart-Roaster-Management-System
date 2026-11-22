# Scheduling Logic - Smart Roster Management System

## Overview

The scheduling engine is the core of the roster management system. It implements a deterministic algorithm that considers multiple constraints to generate monthly rosters while detecting and reporting conflicts.

## Understanding the "Required: 3, Available: 0" Conflict

Example:

```text
Insufficient staffing for Coffee - Task on 2026-07-01.
Required: 3, Available: 0
```

This means the `Task` process on the `Coffee` brand was open on July 1, and its `minimumStaffingRequirement` was `3`. The scheduler successfully placed **zero** employees into that process for that date. `Available` is the number actually scheduled, not a count of all employees in the database.

The scheduler can place only employees with an active `Assignment` record for that exact brand and process. For this example, check the following:

1. In **Assignments**, confirm that at least three active employees are assigned to `Coffee` → `Task`. Filling in an employee's `assignedBrands` or `assignedProcesses` fields alone is not enough; roster eligibility is read from the `Assignment` collection.
2. Confirm those employees are active and are not on approved leave on `2026-07-01`.
3. Check each employee's availability for `2026-07-01`; a date entry set to `false` makes that employee unavailable.
4. Check whether each employee has already reached `maxWorkingDaysPerMonth`.
5. Check whether they were already scheduled to work another process on July 1. An employee can be scheduled for only one `working` entry per date in the current engine.
6. Confirm the process's operating days and the brand/process Sunday and holiday rules. Conflicts are created only when the process is considered open.

If fewer than three eligible employees remain after these checks, the conflict is correct. Add or activate enough assignments, or correct the underlying availability, leave, workload, or operating-calendar data. Then revalidate the draft roster. Do not mark the roster valid or publish it while a critical coverage requirement remains unmet.

### What the current algorithm reports

- `requiredEmployees` is the process's configured `minimumStaffingRequirement`.
- `availableEmployees` is the number that `scheduleEmployees` actually placed after enforcing same-day conflicts. It is not the number of employee documents or even the count of assignment records.
- Coverage conflict explanations include counts for active assignments, inactive/missing employees, approved leave, date unavailability, monthly limits, and employees already working another process. Use these counts to identify the relevant data to correct.
- `isValid` is false when the generated schedule contains any critical conflict.
- Revalidation runs the scheduler again using current database data and replaces the draft's generated entries and conflicts.
- Publishing also reruns the scheduler; it is blocked if the latest schedule still has critical conflicts.

The backup list is advisory only. The current backup helper looks for active employees in the brand's pod who are not already assigned to that process and are not on approved leave. It does not automatically create assignments or schedule them, and it does not apply every eligibility check used by the scheduler. A suggested employee must be explicitly assigned and the roster revalidated before they can cover the process.

## Algorithm Design

### High-Level Flow

```
INPUT: Month, Year, Pods[], Brands[]
OUTPUT: { schedule[], conflicts[], isValid }

PROCESS:
1. Load all necessary data
2. For each date in the month:
   a. For each brand:
      i. For each process in brand:
         - Check if process should operate
         - Get eligible employees
         - Assign employees
         - Track workload
         - Detect conflicts
3. Return schedule and conflicts
```

## Constraint System

### Hard Constraints (Must Satisfy)

These constraints **CANNOT** be violated. If violated, the roster is invalid and cannot be published.

#### 1. Employee Availability
```javascript
// Employee marked as unavailable cannot be scheduled
if (employee.availability.get(dateKey) === false) {
  // Skip this employee
  continue;
}
```

#### 2. Approved Leaves
```javascript
// Employee on approved leave cannot work
if (isEmployeeOnLeave(employeeId, date)) {
  // Skip this employee
  continue;
}
```

#### 3. Assignment Requirements
```javascript
// Only assigned employees can be scheduled for a process
const assignments = getAssignments(brand, process);
const eligibleEmployees = assignments.map(a => a.employee);
```

#### 4. No Overlapping Assignments
```javascript
// Employee cannot work on multiple processes same day
if (alreadyScheduledToday(employee, date)) {
  // Skip this employee
  continue;
}
```

#### 5. Workload Limits
```javascript
// Employee cannot exceed max working days
if (employeeWorkload >= employee.maxWorkingDaysPerMonth) {
  // Skip this employee
  continue;
}
```

### Soft Constraints (Optimize Where Possible)

These constraints should be satisfied when possible, but can be violated if necessary.

#### 1. Weekly Off Preferences
```javascript
// Prefer not to schedule on preferred weekly off
if (isPreferredWeeklyOff(employee, dayName)) {
  // Lower priority, but can still schedule if needed
  priority = 2;
} else {
  priority = 1;
}
```

#### 2. Fair Workload Distribution
```javascript
// Distribute work evenly among eligible employees
employees.sort((a, b) => {
  const workloadA = getWorkload(a);
  const workloadB = getWorkload(b);
  return workloadA - workloadB; // Assign to least loaded first
});
```

#### 3. Minimize Consecutive Days
```javascript
// Try to give breaks between working days
// (Future enhancement)
```

## Scheduling Process Detail

### Phase 1: Data Loading

```javascript
async loadData() {
  // 1. Load public holidays
  this.publicHolidays = await PublicHoliday.find({
    date: { $gte: startDate, $lte: endDate },
    isActive: true
  });

  // 2. Load approved leaves
  this.approvedLeaves = await Leave.find({
    status: 'approved',
    $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }]
  }).populate('employee');

  // 3. Load brands (filtered if specified)
  this.activeBrands = await Brand.find({
    status: 'active',
    ...(brands.length && { _id: { $in: brands } })
  }).populate('assignedEmployees').populate('assignedPod');

  // 4. Load processes for these brands
  this.activeProcesses = await Process.find({
    brand: { $in: this.activeBrands.map(b => b._id) },
    isActive: true
  }).populate('assignedEmployees');

  // 5. Load assignments
  this.assignments = await Assignment.find({
    brand: { $in: this.activeBrands.map(b => b._id) },
    isActive: true
  }).populate('employee').populate('brand').populate('process');

  // 6. Load employees (filtered by pods if specified)
  this.employees = await Employee.find({
    employmentStatus: 'active',
    ...(pods.length && { operationalPod: { $in: pods } })
  });

  // 7. Initialize workload tracking
  this.employeeWorkload = new Map();
  this.employees.forEach(emp => {
    this.employeeWorkload.set(emp._id.toString(), 0);
  });
}
```

### Phase 2: Daily Scheduling

For each date in the month:

```javascript
async scheduleDate(date) {
  const dayName = format(date, 'EEEE'); // Monday, Tuesday, etc.
  const isPublicHoliday = this.isPublicHoliday(date);

  // Process each brand-process combination
  for (const brand of this.activeBrands) {
    const processes = this.activeProcesses.filter(
      p => p.brand.toString() === brand._id.toString()
    );

    for (const process of processes) {
      // Step 1: Check if process should operate
      if (!this.shouldProcessOperate(process, brand, date, dayName, isPublicHoliday)) {
        this.addNonRequiredEntries(brand, process, date);
        continue;
      }

      // Step 2: Get eligible employees
      const eligibleEmployees = this.getEligibleEmployees(
        brand, process, date, dayName, isPublicHoliday
      );

      // Step 3: Schedule employees
      const scheduled = this.scheduleEmployees(
        eligibleEmployees, brand, process, date, dayName, isPublicHoliday
      );

      // Step 4: Check minimum staffing
      if (scheduled < process.minimumStaffingRequirement) {
        this.addConflict({
          conflictType: 'insufficient-staffing',
          severity: 'critical',
          date,
          brand: brand._id,
          process: process._id,
          requiredEmployees: process.minimumStaffingRequirement,
          availableEmployees: scheduled,
          explanation: `Insufficient staffing...`,
          backupEmployees: this.findBackupEmployees(brand, process, date, dayName)
        });
      }
    }
  }
}
```

### Phase 3: Operating Calendar Check

The current implementation applies the brand's operating calendar and the process's own rules together:

1. If either the brand or process is closed on Sunday, the process is not scheduled that Sunday.
2. If either is closed on a public holiday, the process is not scheduled that holiday.
3. `except-holidays` and `except-sundays-holidays` restrict the brand calendar.
4. For a `custom` brand calendar, the weekday must be present in `customOperatingDays`.
5. If `process.operatingDays` is configured, the weekday must also be present there. Thus, a year-round brand can still have a process that operates only on selected days.

See `shouldProcessOperate` in `backend/src/services/schedulingEngine.js` for the source of truth.

### Phase 4: Employee Eligibility Check

```javascript
getEligibleEmployees(brand, process, date, dayName, isPublicHoliday) {
  const eligible = [];

  // Get employees assigned to this process
  const assignedEmployees = this.assignments.filter(
    a => a.process.toString() === process._id.toString() &&
         a.brand.toString() === brand._id.toString() &&
         a.isActive
  );

  for (const assignment of assignedEmployees) {
    const employee = assignment.employee;
    
    // Check 1: Employee status
    if (!employee || employee.employmentStatus !== 'active') {
      continue; // Skip inactive
    }

    // Check 2: Approved leave
    if (this.isEmployeeOnLeave(employee._id, date)) {
      continue; // Skip - on leave
    }

    // Check 3: Availability
    const dateKey = format(date, 'yyyy-MM-dd');
    if (employee.availability && employee.availability.get(dateKey) === false) {
      continue; // Skip - marked unavailable
    }

    // Check 4: Workload limit
    const workload = this.employeeWorkload.get(employee._id.toString()) || 0;
    if (workload >= employee.maxWorkingDaysPerMonth) {
      continue; // Skip - exceeded limit
    }

    // Assign priority
    let priority = 1; // High priority
    if (this.isPreferredWeeklyOff(employee, dayName) && !isPublicHoliday) {
      priority = 2; // Lower priority on weekly off
    }

    eligible.push({ employee, assignment, priority });
  }

  // Sort by priority and workload
  return eligible.sort((a, b) => {
    // First by priority
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Then by workload (fair distribution)
    const workloadA = this.employeeWorkload.get(a.employee._id.toString()) || 0;
    const workloadB = this.employeeWorkload.get(b.employee._id.toString()) || 0;
    return workloadA - workloadB;
  });
}
```

### Phase 5: Employee Assignment

```javascript
scheduleEmployees(eligibleEmployees, brand, process, date, dayName, isPublicHoliday) {
  let scheduled = 0;
  const required = process.minimumStaffingRequirement;

  for (const { employee, assignment } of eligibleEmployees) {
    if (scheduled >= required) {
      break; // Enough employees scheduled
    }

    // Check if already scheduled for another process today
    const alreadyScheduled = this.schedule.some(
      entry => entry.employee.toString() === employee._id.toString() &&
               entry.status === 'working' &&
               format(entry.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (alreadyScheduled) {
      continue; // Skip - already working on another process
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

  return scheduled; // Number of employees actually scheduled
}
```

## Conflict Detection

### Conflict Types

#### 1. Insufficient Staffing (Critical)
```javascript
{
  conflictType: 'insufficient-staffing',
  severity: 'critical',
  date: '2024-12-15',
  requiredEmployees: 2,
  availableEmployees: 1,
  explanation: 'Insufficient staffing for Brand X - Process Y on 2024-12-15. Required: 2, Available: 1',
  possibleResolution: 'Consider reassigning employees from other processes or approving overtime.',
  backupEmployees: [ObjectId1, ObjectId2]
}
```

The current scheduler records a zero-staff case as the same `insufficient-staffing` conflict type, with `availableEmployees: 0`. It does not emit separate `no-employee-available` or `leave-coverage-gap` conflict types.

### Backup Employee Suggestion

The current `findBackupEmployees` implementation returns active same-pod employees who are not already assigned to the process and are not on approved leave. This is only a shortlist for a manager to review. It does not create an assignment, and it does not currently filter the shortlist by date-specific availability, monthly workload, or whether the employee is already scheduled for another process.

## Handling Different Scenarios

### Scenario 1: Single-Resource Brand

**Setup:**
- Brand: FashionHub India
- Process: Customer Support
- Assigned Employee: 1 (Priya Sharma)
- Operating: Monday-Saturday
- Minimum Staffing: 1

**Scheduling:**
```
Mon-Sat: Schedule Priya Sharma (Working)
Sunday:  Mark as Weekly-Off
Holidays: Mark as Public Holiday
```

**If Priya takes leave Dec 15-20:**
```
Dec 15-20: Conflict - No employee available
           Suggest backups from same pod
```

### Scenario 2: Multi-Employee Brand

**Setup:**
- Brand: MegaMart Express
- Processes:
  - Customer Support (CS) - Min: 1
  - Abandoned Cart (ACC) - Min: 1
  - NDR Management (NDR) - Min: 1
- Assigned Employees:
  - EMP001 → CS
  - EMP002 → ACC
  - EMP003 → NDR
  - EMP004 → CS (Backup)

**Scheduling:**
```
Each Day:
- Assign EMP001 to CS
- Assign EMP002 to ACC
- Assign EMP003 to NDR

If EMP001 on leave:
- Assign EMP004 to CS (backup takes over)
- No conflict

If both EMP001 and EMP004 on leave:
- Conflict - CS has insufficient staffing
```

### Scenario 3: 365-Day Operation

**Setup:**
- Brand: TechGear Store
- Operating: 365 days including Sundays and holidays
- Assigned Employee: 1 (Amit Patel)

**Scheduling:**
```
Every Day (including Sun/Holidays):
- Attempt to schedule Amit Patel
- If workload limit reached (26 days):
  - Conflict - Need more employees

If Amit on leave:
- Conflict - No coverage for 365-day brand
```

### Scenario 4: Shared Process

**Setup:**
- Brand: LuxuryLifestyle
- Process: Customer Support
- Assigned Employees: 2 (both can handle CS)
- Minimum Staffing: 1

**Scheduling:**
```
Each Day:
- Sort by current workload
- Assign employee with lower workload
- Result: Work distributed fairly

If one employee on leave:
- Other employee covers
- No conflict (requirement met)

If both on leave:
- Conflict - Insufficient staffing
```

## Optimization Strategies

### 1. Fair Distribution

```javascript
// Track each employee's working days
const employeeWorkload = new Map();

// When selecting, choose employee with least workload
employees.sort((a, b) => {
  const workloadA = employeeWorkload.get(a._id) || 0;
  const workloadB = employeeWorkload.get(b._id) || 0;
  return workloadA - workloadB;
});
```

### 2. Priority-Based Assignment

```javascript
// Higher priority = scheduled first
priority = {
  1: Non-weekly-off day + low workload
  2: Weekly-off day + low workload
  3: Non-weekly-off day + high workload
  4: Weekly-off day + high workload
}
```

### 3. Early Conflict Detection

```javascript
// Check conflicts as soon as detected
if (scheduled < required) {
  // Immediately record conflict
  // Don't wait until end of scheduling
  recordConflict(details);
}
```

## Revalidation After Changes

When data changes (for example, adding a process assignment or approving leave), revalidate the roster:

```javascript
const scheduler = new SchedulingEngine(
  roster.month,
  roster.year,
  roster.pods,
  roster.brands
);
const result = await scheduler.generateSchedule();

// Replaces generated entries/conflicts and saves roster validity and totals.
const updatedSchedule = await saveScheduleResult(roster, result);
return {
  roster,
  entries: updatedSchedule.entries,
  conflicts: updatedSchedule.conflicts
};
```

Revalidation regenerates the draft schedule; it does not simply mark old conflicts as resolved. Publishing runs the scheduler again so new leaves, availability changes, or assignments cannot be bypassed by relying on stale validation.

## Performance Considerations

### Time Complexity

```
O(D × B × P × E)

Where:
D = Days in month (≈30)
B = Brands (10-50)
P = Processes per brand (1-5)
E = Employees per process (1-10)

Worst case: 30 × 50 × 5 × 10 = 75,000 operations
Typical: 30 × 10 × 2 × 2 = 1,200 operations
```

### Space Complexity

```
O(E + S + C)

Where:
E = Total employees (30-100)
S = Schedule entries (≈1000)
C = Conflicts (0-100)

Memory usage: ~1-5 MB
```

### Optimization Techniques

1. **Early Termination**
   ```javascript
   if (scheduled >= required) break;
   ```

2. **Caching**
   ```javascript
   // Cache frequently accessed data
   const eligibleCache = new Map();
   ```

3. **Batch Processing**
   ```javascript
   // Process multiple days in parallel (future)
   await Promise.all(dates.map(scheduleDate));
   ```

## Testing Scenarios

### Essential Test Cases

1. ✅ Schedule single employee on working day
2. ✅ Mark Sundays as weekly-off
3. ✅ Detect conflict when employee on leave
4. ✅ Schedule backup employee when available
5. ✅ Respect public holidays
6. ✅ Handle 365-day operation
7. ✅ Detect insufficient staffing
8. ✅ Distribute workload fairly
9. ✅ Handle overlapping assignments
10. ✅ Validate operating calendar rules

## Conclusion

The scheduling algorithm balances:
- ✅ Correctness: Hard constraints never violated
- ✅ Determinism: The same data and ordering produce the same greedy schedule
- ✅ Performance: Fast enough for real-time use
- ✅ Maintainability: Clear, understandable logic
- ✅ Extensibility: Easy to add new constraints

The current scheduler is greedy and does not backtrack or optimize a complete month globally. Employee eligibility and conflict counts should therefore be inspected when the greedy order cannot satisfy all coverage, even if an alternative allocation might exist.

The deterministic nature ensures consistent results and makes debugging straightforward.
