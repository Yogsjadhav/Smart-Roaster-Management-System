import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Package, Layers, GitBranch, UserCheck, Umbrella, CalendarOff, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Employees', value: stats?.overview?.totalEmployees || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Brands', value: stats?.overview?.activeBrands || 0, icon: Package, color: 'bg-green-500' },
    { title: 'Active Processes', value: stats?.overview?.activeProcesses || 0, icon: Layers, color: 'bg-purple-500' },
    { title: 'Operational Pods', value: stats?.overview?.totalPods || 0, icon: GitBranch, color: 'bg-indigo-500' },
    { title: 'Working Today', value: stats?.overview?.employeesWorkingToday || 0, icon: UserCheck, color: 'bg-teal-500' },
    { title: 'On Leave Today', value: stats?.overview?.employeesOnLeaveToday || 0, icon: Umbrella, color: 'bg-orange-500' },
    { title: 'Pending Leaves', value: stats?.overview?.pendingLeaves || 0, icon: CalendarOff, color: 'bg-yellow-500' },
    { title: 'Today Conflicts', value: stats?.overview?.todayConflicts || 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pod Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pod-wise Employee Distribution</h3>
          <div className="space-y-3">
            {stats?.podDistribution?.map((pod) => (
              <div key={pod._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{pod.podName}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(pod.employeeCount / stats.overview.totalEmployees) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{pod.employeeCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Holidays</h3>
          <div className="space-y-3">
            {stats?.upcomingHolidays?.length > 0 ? (
              stats.upcomingHolidays.map((holiday) => (
                <div key={holiday._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                    <p className="text-xs text-gray-600">{holiday.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    {format(new Date(holiday.date), 'MMM dd')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming holidays</p>
            )}
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Leaves (Next 7 Days)</h3>
          <div className="space-y-3">
            {stats?.upcomingLeaves?.length > 0 ? (
              stats.upcomingLeaves.map((leave) => (
                <div key={leave._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{leave.employee?.fullName}</p>
                    <p className="text-xs text-gray-600">{leave.leaveType.replace('-', ' ')}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming leaves</p>
            )}
          </div>
        </div>

        {/* Brand Coverage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Coverage</h3>
          <div className="space-y-3">
            {stats?.brandCoverage?.slice(0, 5).map((brand) => (
              <div key={brand._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{brand.brandName}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        brand.coveragePercentage >= 100 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(brand.coveragePercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {brand.assignedStaff}/{brand.requiredStaff}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {stats?.recentActivities?.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div key={activity._id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 mt-1.5 bg-primary-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user?.firstName} {activity.user?.lastName} • {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
