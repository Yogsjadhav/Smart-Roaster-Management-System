const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const Process = require('../models/Process');
const Pod = require('../models/Pod');
const Leave = require('../models/Leave');
const PublicHoliday = require('../models/PublicHoliday');
const RosterEntry = require('../models/RosterEntry');
const Conflict = require('../models/Conflict');
const ActivityLog = require('../models/ActivityLog');
const { startOfDay, endOfDay, addDays, format } = require('date-fns');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Basic counts
    const [
      totalEmployees,
      activeEmployees,
      activeBrands,
      activeProcesses,
      totalPods
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ employmentStatus: 'active' }),
      Brand.countDocuments({ status: 'active' }),
      Process.countDocuments({ isActive: true }),
      Pod.countDocuments({ isActive: true })
    ]);

    // Employees working today
    const employeesWorkingToday = await RosterEntry.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'working'
    });

    // Employees on leave today
    const employeesOnLeaveToday = await Leave.countDocuments({
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    // Pending leave requests
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Get today's conflicts
    const todayConflicts = await Conflict.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'open'
    });

    // Pod-wise employee distribution
    const podDistribution = await Pod.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'operationalPod',
          as: 'employees'
        }
      },
      {
        $project: {
          podName: 1,
          employeeCount: { $size: '$employees' }
        }
      }
    ]);

    // Upcoming holidays (next 30 days)
    const upcomingHolidays = await PublicHoliday.find({
      date: { $gte: today, $lte: addDays(today, 30) },
      isActive: true
    }).sort('date').limit(5);

    // Upcoming leaves (next 7 days)
    const upcomingLeaves = await Leave.find({
      status: 'approved',
      startDate: { $gte: today, $lte: addDays(today, 7) }
    }).populate('employee').sort('startDate').limit(5);

    // Recent activities
    const recentActivities = await ActivityLog.find()
      .populate('user')
      .sort('-createdAt')
      .limit(10);

    // Brand and process coverage
    const brandCoverage = await Brand.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'assignedBrands',
          as: 'employees'
        }
      },
      {
        $project: {
          brandName: 1,
          requiredStaff: '$minimumStaffingRequirement',
          assignedStaff: { $size: '$employees' },
          coveragePercentage: {
            $cond: [
              { $eq: ['$minimumStaffingRequirement', 0] },
              100,
              {
                $multiply: [
                  { $divide: [{ $size: '$employees' }, '$minimumStaffingRequirement'] },
                  100
                ]
              }
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          activeEmployees,
          activeBrands,
          activeProcesses,
          totalPods,
          employeesWorkingToday,
          employeesOnLeaveToday,
          pendingLeaves,
          todayConflicts
        },
        podDistribution,
        upcomingHolidays,
        upcomingLeaves,
        recentActivities,
        brandCoverage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
