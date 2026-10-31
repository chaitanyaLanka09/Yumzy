import React, { useEffect, useState } from 'react';
import {
  Users,
  Utensils,
  Heart,
  Package,
  Inbox,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#16845B', '#FF8A45', '#105C42', '#3B82F6', '#8B5CF6'];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [dashRes, analyticsRes, reportsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/analytics/admin'),
        api.get('/reports?status=pending'),
        api.get('/users?limit=6'),
        api.get('/admin/activity-logs?limit=8')
      ]);

      if (dashRes.data?.success) setStats(dashRes.data.stats);
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data);
      if (reportsRes.data?.success) setReports(reportsRes.data.reports || []);
      if (usersRes.data?.success) setUsersList(usersRes.data.users || []);
      if (logsRes.data?.success) setActivityLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveReport = async (id, status, takeAction = null) => {
    try {
      const res = await api.patch(`/reports/${id}/resolve`, {
        status,
        resolution: `Resolved by administrator with action: ${takeAction || 'none'}`,
        takeAction
      });
      if (res.data?.success) {
        toast.success(`Report marked as ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      if (res.data?.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'suspended'}`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Yumzy Platform Moderation & Analytics
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl mt-1">
            Platform Master Administration
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Monitor registered commercial donors, charitable recipient NGOs, active surplus listings, audit trails, and safety reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/20">
            Admin Console
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Total Users
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 mt-1">
            {stats?.totalUsers || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            {stats?.activeDonors || 0} Donors • {stats?.registeredNGOs || 0} NGOs
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Food Listings
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#16845B] mt-1">
            {stats?.totalListings || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            {stats?.activeListings || 0} Active Marketplace
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Pending Reports
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#DC5151] mt-1">
            {stats?.pendingReports || 0}
          </div>
          <span className="text-[10px] text-red-500 font-bold mt-1 block">
            Requires moderation review
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Meals Redistributed
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#105C42] mt-1">
            {analytics?.stats?.totalRedistributedMeals || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            ~{analytics?.stats?.totalRedistributedKg || 0} kg edible food
          </span>
        </div>
      </div>

      {/* Analytics Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Donation Trends */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
          <h3 className="font-heading font-extrabold text-base text-gray-900">
            Monthly Food Redistribution Trends
          </h3>
          <p className="text-xs text-gray-500">
            Estimated meals redistributed over the past 5 operating periods.
          </p>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthlyTrends || []}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="meals" fill="#16845B" radius={[8, 8, 0, 0]} name="Meals Rescued" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Food Categories Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
          <h3 className="font-heading font-extrabold text-base text-gray-900">
            Surplus Categories Distribution
          </h3>
          <p className="text-xs text-gray-500">
            Redistribution proportions across vegetarian, bakery, cooked meals, and produce.
          </p>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Safety Reports & Moderation Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[#DC5151]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-heading font-extrabold text-base text-gray-900">
              Safety & Content Reports ({reports.length} pending)
            </h3>
          </div>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No pending safety or moderation reports. All listings adhere to food disclosure standards.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep._id}
                className="p-4 rounded-2xl border border-red-100 bg-red-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      {rep.reason}
                    </span>
                    <span className="text-gray-500">
                      Reported By: <b>{rep.reportedBy?.name || 'User'}</b>
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 mt-1">"{rep.description}"</p>
                  {rep.targetDetails && (
                    <span className="text-[11px] text-gray-500 block">
                      Target: {rep.targetDetails.foodName || rep.targetDetails.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResolveReport(rep._id, 'dismissed')}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep._id, 'resolved', 'close_listing')}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-2xs"
                  >
                    Close Reported Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management & Audit Trail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-heading font-extrabold text-base text-gray-900">
              Registered Platform Users
            </h3>
            <span className="text-xs font-bold text-[#16845B]">
              {usersList.length} Accounts
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {usersList.map((u) => (
              <div key={u._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{u.name}</span>
                  <span className="text-gray-400 text-[11px]">
                    {u.email} • <b className="uppercase text-gray-600">{u.role}</b>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                      u.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                        : 'bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Suspended'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Activity Logs */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-heading font-extrabold text-base text-gray-900">
              Audit Activity Logs
            </h3>
            <span className="text-xs font-bold text-gray-400">Live Stream</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {activityLogs.map((log) => (
              <div
                key={log._id}
                className="p-2.5 rounded-xl bg-[#F8FAF7] border border-gray-100 text-xs flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-gray-900 font-mono text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-gray-500 text-[11px] block">
                    By: {log.actorId?.name || 'System'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
