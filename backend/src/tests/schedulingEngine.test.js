const SchedulingEngine = require('../services/schedulingEngine');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const Process = require('../models/Process');
const Pod = require('../models/Pod');
const Assignment = require('../models/Assignment');
const Leave = require('../models/Leave');
const PublicHoliday = require('../models/PublicHoliday');

describe('SchedulingEngine', () => {
  let testPod, testBrand, testProcess, testEmployee1, testEmployee2;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-roster-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await Employee.deleteMany({});
    await Brand.deleteMany({});
    await Process.deleteMany({});
    await Pod.deleteMany({});
    await Assignment.deleteMany({});
    await Leave.deleteMany({});
    await PublicHoliday.deleteMany({});

    // Create test data
    testPod = await Pod.create({
      podName: 'Test Pod',
      description: 'Test pod for scheduling',
      isActive: true
    });

    testEmployee1 = await Employee.create({
      employeeId: 'TEST001',
      fullName: 'Test Employee 1',
      email: 'test1@example.com',
      phone: '+91-1234567890',
      designation: 'Executive',
      department: 'Operations',
      operationalPod: testPod._id,
      joiningDate: new Date('2023-01-01'),
      employmentStatus: 'active',
      weeklyOffPreferences: ['Sunday'],
      maxWorkingDaysPerMonth: 26
    });

    testEmployee2 = await Employee.create({
      employeeId: 'TEST002',
      fullName: 'Test Employee 2',
      email: 'test2@example.com',
      phone: '+91-1234567891',
      designation: 'Executive',
      department: 'Operations',
      operationalPod: testPod._id,
      joiningDate: new Date('2023-01-01'),
      employmentStatus: 'active',
      weeklyOffPreferences: ['Sunday'],
      maxWorkingDaysPerMonth: 26
    });

    testBrand = await Brand.create({
      brandName: 'Test Brand',
      brandCode: 'TB1',
      status: 'active',
      assignedPod: testPod._id,
      operatingCalendar: 'except-sundays-holidays',
      publicHolidayPolicy: 'closed',
      sundayPolicy: 'closed',
      minimumStaffingRequirement: 1
    });

    testProcess = await Process.create({
      processName: 'Customer Support',
      processCode: 'CS',
      brand: testBrand._id,
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      holidayPolicy: 'closed',
      sundayPolicy: 'closed',
      minimumStaffingRequirement: 1,
      isActive: true
    });

    await Assignment.create({
      employee: testEmployee1._id,
      brand: testBrand._id,
      process: testProcess._id,
      isActive: true
    });
  });

  test('Should schedule employee for single-resource brand on working day', async () => {
    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    expect(result.schedule.length).toBeGreaterThan(0);
    
    // Find a Monday entry (working day)
    const mondayEntry = result.schedule.find(entry => {
      const date = new Date(entry.date);
      return date.getDay() === 1 && entry.status === 'working';
    });

    expect(mondayEntry).toBeDefined();
    expect(mondayEntry.employee.toString()).toBe(testEmployee1._id.toString());
  });

  test('Should match populated brand and process references to active assignments', async () => {
    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    await scheduler.loadData();

    const brand = scheduler.activeBrands[0];
    const process = scheduler.activeProcesses[0];
    const eligible = scheduler.getEligibleEmployees(
      brand,
      process,
      new Date(2024, 11, 2),
      'Monday',
      false
    );

    expect(scheduler.lastEligibilityDiagnostics.activeAssignments).toBe(1);
    expect(eligible.map(({ employee }) => employee._id.toString()))
      .toContain(testEmployee1._id.toString());
  });

  test('Should mark Sundays as weekly-off', async () => {
    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    // Find Sunday entries
    const sundayEntries = result.schedule.filter(entry => {
      const date = new Date(entry.date);
      return date.getDay() === 0;
    });

    sundayEntries.forEach(entry => {
      expect(['weekly-off', 'not-required']).toContain(entry.status);
    });
  });

  test('Should detect conflict when employee is on leave', async () => {
    // Create approved leave
    await Leave.create({
      employee: testEmployee1._id,
      leaveType: 'planned-leave',
      startDate: new Date('2024-12-10'),
      endDate: new Date('2024-12-15'),
      reason: 'Test leave',
      status: 'approved'
    });

    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    // Should have conflicts for the leave period
    const leaveConflicts = result.conflicts.filter(c => 
      c.conflictType === 'insufficient-staffing'
    );

    expect(leaveConflicts.length).toBeGreaterThan(0);
  });

  test('Should schedule backup employee when available', async () => {
    // Add second employee to same process
    await Assignment.create({
      employee: testEmployee2._id,
      brand: testBrand._id,
      process: testProcess._id,
      isActive: true
    });

    // First employee on leave
    await Leave.create({
      employee: testEmployee1._id,
      leaveType: 'planned-leave',
      startDate: new Date('2024-12-10'),
      endDate: new Date('2024-12-15'),
      reason: 'Test leave',
      status: 'approved'
    });

    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    // Should schedule employee 2 during employee 1's leave
    const leaveDate = new Date('2024-12-10');
    const scheduleOnLeaveDate = result.schedule.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === leaveDate.toDateString() &&
             entry.status === 'working';
    });

    expect(scheduleOnLeaveDate).toBeDefined();
    expect(scheduleOnLeaveDate.employee.toString()).toBe(testEmployee2._id.toString());
  });

  test('Should respect public holidays', async () => {
    await PublicHoliday.create({
      name: 'Test Holiday',
      date: new Date('2024-12-25'),
      year: 2024,
      isActive: true
    });

    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    // Check Dec 25 status
    const holidayEntry = result.schedule.find(entry => {
      const date = new Date(entry.date);
      return date.getDate() === 25 && date.getMonth() === 11;
    });

    if (holidayEntry) {
      expect(['public-holiday', 'not-required']).toContain(holidayEntry.status);
    }
  });

  test('Should handle 365-day operation brand', async () => {
    testBrand.operatingCalendar = '365-days';
    testBrand.publicHolidayPolicy = 'open';
    testBrand.sundayPolicy = 'open';
    await testBrand.save();

    testProcess.holidayPolicy = 'open';
    testProcess.sundayPolicy = 'open';
    testProcess.operatingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    await testProcess.save();

    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    // Should schedule all days including Sundays
    const workingDays = result.schedule.filter(entry => entry.status === 'working');
    expect(workingDays.length).toBeGreaterThan(25); // At least most days of the month
  });

  test('Should detect insufficient staffing for multi-employee requirement', async () => {
    // Increase minimum staffing to 2
    testProcess.minimumStaffingRequirement = 2;
    await testProcess.save();

    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    // Should have conflicts because only 1 employee assigned but 2 required
    const insufficientStaffingConflicts = result.conflicts.filter(c => 
      c.conflictType === 'insufficient-staffing' &&
      c.requiredEmployees === 2 &&
      c.availableEmployees === 1
    );

    expect(insufficientStaffingConflicts.length).toBeGreaterThan(0);
  });

  test('Should explain when a process has no active employee assignments', async () => {
    await Assignment.updateMany(
      { brand: testBrand._id, process: testProcess._id },
      { isActive: false }
    );

    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();
    const conflict = result.conflicts.find(item =>
      item.conflictType === 'insufficient-staffing' &&
      item.availableEmployees === 0
    );

    expect(conflict).toBeDefined();
    expect(conflict.explanation).toContain('active assignments: 0');
    expect(conflict.possibleResolution).toContain('Create active assignments');
  });

  test('Should distribute workload fairly among multiple employees', async () => {
    // Add second employee
    await Assignment.create({
      employee: testEmployee2._id,
      brand: testBrand._id,
      process: testProcess._id,
      isActive: true
    });

    const scheduler = new SchedulingEngine(12, 2024, [testPod._id], [testBrand._id]);
    const result = await scheduler.generateSchedule();

    // Count working days for each employee
    const emp1WorkingDays = result.schedule.filter(entry => 
      entry.employee.toString() === testEmployee1._id.toString() && 
      entry.status === 'working'
    ).length;

    const emp2WorkingDays = result.schedule.filter(entry => 
      entry.employee.toString() === testEmployee2._id.toString() && 
      entry.status === 'working'
    ).length;

    // Both should have some working days (fair distribution)
    expect(emp1WorkingDays).toBeGreaterThan(0);
    expect(emp2WorkingDays).toBeGreaterThan(0);
  });
});

// Run tests
if (require.main === module) {
  console.log('Run tests with: npm test');
}
