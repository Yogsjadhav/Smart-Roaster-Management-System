const dotenv = require('dotenv');
const connectDB = require('../config/database');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const Process = require('../models/Process');
const Pod = require('../models/Pod');
const Assignment = require('../models/Assignment');
const Leave = require('../models/Leave');
const PublicHoliday = require('../models/PublicHoliday');

dotenv.config();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Employee.deleteMany();
    await Brand.deleteMany();
    await Process.deleteMany();
    await Pod.deleteMany();
    await Assignment.deleteMany();
    await Leave.deleteMany();
    await PublicHoliday.deleteMany();

    console.log('Existing data cleared');
    await User.createIndexes();

    // Create default user
    const user = await User.create({
      username: 'admin',
      email: 'admin@smartroster.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'employee'
    });

    console.log('User created');

    // Create Pods
    const pods = await Pod.create([
      { podName: 'Operations Pod A', description: 'Primary operations team', isActive: true },
      { podName: 'Operations Pod B', description: 'Secondary operations team', isActive: true },
      { podName: 'Support Pod', description: 'Customer support team', isActive: true }
    ]);

    console.log('Pods created');

    // Create Employees
    const employees = await Employee.create([
      // Pod A employees
      { employeeId: 'EMP001', fullName: 'Rajesh Kumar', email: 'rajesh.kumar@company.com', phone: '+91-9876543210', designation: 'Team Lead', department: 'Operations', operationalPod: pods[0]._id, isPodLead: true, joiningDate: new Date('2022-01-15'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP002', fullName: 'Priya Sharma', email: 'priya.sharma@company.com', phone: '+91-9876543211', designation: 'Senior Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2022-03-20'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP003', fullName: 'Amit Patel', email: 'amit.patel@company.com', phone: '+91-9876543212', designation: 'Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2022-06-10'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP004', fullName: 'Sneha Desai', email: 'sneha.desai@company.com', phone: '+91-9876543213', designation: 'Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2022-08-05'), employmentStatus: 'active', weeklyOffPreferences: ['Saturday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP005', fullName: 'Vikram Singh', email: 'vikram.singh@company.com', phone: '+91-9876543214', designation: 'Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2023-01-12'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP006', fullName: 'Neha Gupta', email: 'neha.gupta@company.com', phone: '+91-9876543215', designation: 'Senior Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2023-02-20'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP007', fullName: 'Arjun Reddy', email: 'arjun.reddy@company.com', phone: '+91-9876543216', designation: 'Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2023-04-15'), employmentStatus: 'active', weeklyOffPreferences: ['Saturday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP008', fullName: 'Kavya Nair', email: 'kavya.nair@company.com', phone: '+91-9876543217', designation: 'Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2023-06-01'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP009', fullName: 'Rohit Verma', email: 'rohit.verma@company.com', phone: '+91-9876543218', designation: 'Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2023-07-10'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP010', fullName: 'Ananya Iyer', email: 'ananya.iyer@company.com', phone: '+91-9876543219', designation: 'Executive', department: 'Operations', operationalPod: pods[0]._id, joiningDate: new Date('2023-09-05'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      
      // Pod B employees
      { employeeId: 'EMP011', fullName: 'Sanjay Mehta', email: 'sanjay.mehta@company.com', phone: '+91-9876543220', designation: 'Team Lead', department: 'Operations', operationalPod: pods[1]._id, isPodLead: true, joiningDate: new Date('2022-02-01'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP012', fullName: 'Divya Krishnan', email: 'divya.krishnan@company.com', phone: '+91-9876543221', designation: 'Senior Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2022-04-15'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP013', fullName: 'Karthik Menon', email: 'karthik.menon@company.com', phone: '+91-9876543222', designation: 'Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2022-07-20'), employmentStatus: 'active', weeklyOffPreferences: ['Saturday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP014', fullName: 'Pooja Rao', email: 'pooja.rao@company.com', phone: '+91-9876543223', designation: 'Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2022-09-10'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP015', fullName: 'Aditya Kapoor', email: 'aditya.kapoor@company.com', phone: '+91-9876543224', designation: 'Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2023-01-05'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP016', fullName: 'Ritika Saxena', email: 'ritika.saxena@company.com', phone: '+91-9876543225', designation: 'Senior Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2023-03-12'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP017', fullName: 'Nikhil Joshi', email: 'nikhil.joshi@company.com', phone: '+91-9876543226', designation: 'Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2023-05-18'), employmentStatus: 'active', weeklyOffPreferences: ['Saturday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP018', fullName: 'Shreya Malhotra', email: 'shreya.malhotra@company.com', phone: '+91-9876543227', designation: 'Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2023-07-22'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP019', fullName: 'Varun Chopra', email: 'varun.chopra@company.com', phone: '+91-9876543228', designation: 'Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2023-09-14'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP020', fullName: 'Meera Shetty', email: 'meera.shetty@company.com', phone: '+91-9876543229', designation: 'Executive', department: 'Operations', operationalPod: pods[1]._id, joiningDate: new Date('2023-10-20'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      
      // Support Pod employees
      { employeeId: 'EMP021', fullName: 'Rahul Bhatt', email: 'rahul.bhatt@company.com', phone: '+91-9876543230', designation: 'Team Lead', department: 'Support', operationalPod: pods[2]._id, isPodLead: true, joiningDate: new Date('2022-03-10'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP022', fullName: 'Simran Kaur', email: 'simran.kaur@company.com', phone: '+91-9876543231', designation: 'Senior Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2022-05-15'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP023', fullName: 'Manish Dubey', email: 'manish.dubey@company.com', phone: '+91-9876543232', designation: 'Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2022-08-20'), employmentStatus: 'active', weeklyOffPreferences: ['Saturday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP024', fullName: 'Tanya Mittal', email: 'tanya.mittal@company.com', phone: '+91-9876543233', designation: 'Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2022-11-10'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP025', fullName: 'Akash Tiwari', email: 'akash.tiwari@company.com', phone: '+91-9876543234', designation: 'Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2023-02-14'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP026', fullName: 'Isha Bansal', email: 'isha.bansal@company.com', phone: '+91-9876543235', designation: 'Senior Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2023-04-20'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP027', fullName: 'Gaurav Pandey', email: 'gaurav.pandey@company.com', phone: '+91-9876543236', designation: 'Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2023-06-25'), employmentStatus: 'active', weeklyOffPreferences: ['Saturday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP028', fullName: 'Nidhi Agarwal', email: 'nidhi.agarwal@company.com', phone: '+91-9876543237', designation: 'Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2023-08-30'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP029', fullName: 'Siddharth Rane', email: 'siddharth.rane@company.com', phone: '+91-9876543238', designation: 'Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2023-10-15'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 },
      { employeeId: 'EMP030', fullName: 'Riya Shah', email: 'riya.shah@company.com', phone: '+91-9876543239', designation: 'Executive', department: 'Support', operationalPod: pods[2]._id, joiningDate: new Date('2023-11-20'), employmentStatus: 'active', weeklyOffPreferences: ['Sunday'], maxWorkingDaysPerMonth: 26 }
    ]);

    console.log('Employees created');

    // Update pod leads
    await Pod.findByIdAndUpdate(pods[0]._id, { podLead: employees[0]._id });
    await Pod.findByIdAndUpdate(pods[1]._id, { podLead: employees[10]._id });
    await Pod.findByIdAndUpdate(pods[2]._id, { podLead: employees[20]._id });

    // Create Brands
    const brands = await Brand.create([
      // Single-resource brands (80%)
      { brandName: 'FashionHub India', brandCode: 'FHI', description: 'Fashion e-commerce', status: 'active', assignedPod: pods[0]._id, operatingCalendar: 'except-sundays-holidays', publicHolidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1 },
      { brandName: 'TechGear Store', brandCode: 'TGS', description: 'Electronics retail', status: 'active', assignedPod: pods[0]._id, operatingCalendar: '365-days', publicHolidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1 },
      { brandName: 'HealthPlus Pharmacy', brandCode: 'HPP', description: 'Online pharmacy', status: 'active', assignedPod: pods[0]._id, operatingCalendar: '365-days', publicHolidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1 },
      { brandName: 'HomeDecor Bazaar', brandCode: 'HDB', description: 'Home furnishing', status: 'active', assignedPod: pods[1]._id, operatingCalendar: 'except-sundays-holidays', publicHolidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1 },
      { brandName: 'BookMart Online', brandCode: 'BMO', description: 'Online bookstore', status: 'active', assignedPod: pods[1]._id, operatingCalendar: 'except-holidays', publicHolidayPolicy: 'closed', sundayPolicy: 'open', minimumStaffingRequirement: 1 },
      { brandName: 'FitGear Sports', brandCode: 'FGS', description: 'Sports equipment', status: 'active', assignedPod: pods[1]._id, operatingCalendar: 'except-sundays-holidays', publicHolidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1 },
      { brandName: 'PetCare Express', brandCode: 'PCE', description: 'Pet supplies', status: 'active', assignedPod: pods[2]._id, operatingCalendar: '365-days', publicHolidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1 },
      { brandName: 'GourmetFood Hub', brandCode: 'GFH', description: 'Food delivery', status: 'active', assignedPod: pods[2]._id, operatingCalendar: '365-days', publicHolidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1 },
      
      // Multi-employee brands (20%)
      { brandName: 'MegaMart Express', brandCode: 'MME', description: 'Large e-commerce platform', status: 'active', assignedPod: pods[0]._id, operatingCalendar: '365-days', publicHolidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 2 },
      { brandName: 'LuxuryLifestyle', brandCode: 'LLS', description: 'Premium lifestyle brand', status: 'active', assignedPod: pods[1]._id, operatingCalendar: 'except-sundays-holidays', publicHolidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 2 }
    ]);

    console.log('Brands created');

    for (const pod of pods) {
      await Pod.findByIdAndUpdate(pod._id, {
        $set: {
          employees: employees
            .filter(employee => employee.operationalPod.toString() === pod._id.toString())
            .map(employee => employee._id),
          assignedBrands: brands
            .filter(brand => brand.assignedPod?.toString() === pod._id.toString())
            .map(brand => brand._id)
        }
      });
    }

    // Create Processes
    const processes = await Process.create([
      // Single-resource brand processes
      { processName: 'Customer Support', processCode: 'CS', brand: brands[0]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], holidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Customer Support', processCode: 'CS', brand: brands[1]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Customer Support', processCode: 'CS', brand: brands[2]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Customer Support', processCode: 'CS', brand: brands[3]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], holidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Customer Support', processCode: 'CS', brand: brands[4]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'closed', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Customer Support', processCode: 'CS', brand: brands[5]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], holidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Customer Support', processCode: 'CS', brand: brands[6]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Customer Support', processCode: 'CS', brand: brands[7]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      
      // Multi-employee brand processes
      { processName: 'Customer Support', processCode: 'CS', brand: brands[8]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Abandoned Cart Conversion', processCode: 'ACC', brand: brands[8]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'NDR Management', processCode: 'NDR', brand: brands[8]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], holidayPolicy: 'open', sundayPolicy: 'open', minimumStaffingRequirement: 1, isActive: true },
      
      { processName: 'Customer Support', processCode: 'CS', brand: brands[9]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], holidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1, isActive: true },
      { processName: 'Retention', processCode: 'RET', brand: brands[9]._id, operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], holidayPolicy: 'closed', sundayPolicy: 'closed', minimumStaffingRequirement: 1, isActive: true }
    ]);

    console.log('Processes created');

    // Create Assignments
    const assignments = [];
    
    // Single-resource brand assignments (one employee handles all processes)
    assignments.push({ employee: employees[1]._id, brand: brands[0]._id, process: processes[0]._id, isActive: true });
    assignments.push({ employee: employees[2]._id, brand: brands[1]._id, process: processes[1]._id, isActive: true });
    assignments.push({ employee: employees[3]._id, brand: brands[2]._id, process: processes[2]._id, isActive: true });
    assignments.push({ employee: employees[11]._id, brand: brands[3]._id, process: processes[3]._id, isActive: true });
    assignments.push({ employee: employees[12]._id, brand: brands[4]._id, process: processes[4]._id, isActive: true });
    assignments.push({ employee: employees[13]._id, brand: brands[5]._id, process: processes[5]._id, isActive: true });
    assignments.push({ employee: employees[21]._id, brand: brands[6]._id, process: processes[6]._id, isActive: true });
    assignments.push({ employee: employees[22]._id, brand: brands[7]._id, process: processes[7]._id, isActive: true });
    
    // Multi-employee brand assignments (multiple employees share processes)
    // MegaMart Express - 3 employees for different processes
    assignments.push({ employee: employees[4]._id, brand: brands[8]._id, process: processes[8]._id, isActive: true }); // CS
    assignments.push({ employee: employees[5]._id, brand: brands[8]._id, process: processes[9]._id, isActive: true }); // ACC
    assignments.push({ employee: employees[6]._id, brand: brands[8]._id, process: processes[10]._id, isActive: true }); // NDR
    // Backup for CS - shared process
    assignments.push({ employee: employees[7]._id, brand: brands[8]._id, process: processes[8]._id, isActive: true }); // CS backup
    
    // LuxuryLifestyle - 2 employees for different processes
    assignments.push({ employee: employees[14]._id, brand: brands[9]._id, process: processes[11]._id, isActive: true }); // CS
    assignments.push({ employee: employees[15]._id, brand: brands[9]._id, process: processes[12]._id, isActive: true }); // Retention

    await Assignment.insertMany(assignments);

    // Update employee assigned brands and processes
    for (const assignment of assignments) {
      await Employee.findByIdAndUpdate(assignment.employee, {
        $addToSet: { 
          assignedBrands: assignment.brand,
          assignedProcesses: assignment.process
        }
      });
      await Brand.findByIdAndUpdate(assignment.brand, {
        $addToSet: { assignedEmployees: assignment.employee }
      });
      await Process.findByIdAndUpdate(assignment.process, {
        $addToSet: { assignedEmployees: assignment.employee }
      });
    }

    console.log('Assignments created');

    // Create Public Holidays for 2024-2025
    const holidays = await PublicHoliday.create([
      { name: 'Republic Day', date: new Date('2024-01-26'), year: 2024, description: 'National holiday', isActive: true },
      { name: 'Holi', date: new Date('2024-03-25'), year: 2024, description: 'Festival of colors', isActive: true },
      { name: 'Good Friday', date: new Date('2024-03-29'), year: 2024, description: 'Christian holiday', isActive: true },
      { name: 'Independence Day', date: new Date('2024-08-15'), year: 2024, description: 'National holiday', isActive: true },
      { name: 'Gandhi Jayanti', date: new Date('2024-10-02'), year: 2024, description: 'National holiday', isActive: true },
      { name: 'Diwali', date: new Date('2024-10-31'), year: 2024, description: 'Festival of lights', isActive: true },
      { name: 'Christmas', date: new Date('2024-12-25'), year: 2024, description: 'Christian holiday', isActive: true },
      { name: 'Republic Day', date: new Date('2025-01-26'), year: 2025, description: 'National holiday', isActive: true },
      { name: 'Holi', date: new Date('2025-03-14'), year: 2025, description: 'Festival of colors', isActive: true },
      { name: 'Independence Day', date: new Date('2025-08-15'), year: 2025, description: 'National holiday', isActive: true }
    ]);

    console.log('Public holidays created');

    // Create sample approved leave (creates coverage challenge scenario)
    const sampleLeave = await Leave.create({
      employee: employees[2]._id, // Employee managing TechGear Store - 365-day brand
      leaveType: 'planned-leave',
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-20'),
      reason: 'Personal travel',
      status: 'approved',
      approvedBy: user._id,
      approvalDate: new Date()
    });

    console.log('Sample leave created');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123\n');
    console.log('Sample scenario configured:');
    console.log('- Employee "Amit Patel" (EMP003) manages TechGear Store (365-day operation)');
    console.log('- Has approved leave from Dec 15-20, 2024');
    console.log('- This will create coverage gaps when generating roster for December 2024');
    console.log('- TechGear Store operates 365 days, including Sundays and holidays\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

connectDB()
  .then(seedData)
  .catch(error => {
    console.error('Seed connection error:', error.message);
    process.exitCode = 1;
  });
