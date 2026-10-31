import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Inbox,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyNotice';
import api from '../../services/api';

export const NGOOverviewPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [analyticsRes, requestsRes, matchRes] = await Promise.all([
          api.get('/analytics/ngo'),
          api.get('/requests/my'),
          api.get('/matching/recommended-donations')
        ]);

        if (analyticsRes.data?.success) setStats(analyticsRes.data.stats);
        if (requestsRes.data?.success) setActiveRequests(requestsRes.data.requests.slice(0, 4));
        if (matchRes.data?.success) setRecommendations(matchRes.data.recommendations.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-[#16845B] to-[#105C42] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
            NGO Recipient Portal
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl mt-1">
            {user?.organization?.organizationName || user?.name}
          </h2>
          <p className="text-xs text-emerald-100 mt-1.5 max-w-xl">
            Explore safe, hygienic surplus food from restaurants across Hyderabad, request quantities tailored to your capacity, and track pickups.
          </p>
        </div>

        <Link
          to="/explore"
          className="px-5 py-3 rounded-2xl bg-white text-[#16845B] font-bold text-xs shadow-md hover:bg-emerald-50 transition flex items-center gap-2 shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Donations</span>
        </Link>
      </div>

      {/* Mandatory Food Safety Banner */}
      <FoodSafetyBanner compact={true} />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Total Requests
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 mt-1">
            {stats?.totalRequests || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Lifetime submissions</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Pending Approval
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#FF8A45] mt-1">
            {stats?.pendingRequests || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Awaiting donor action</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Ready / Pickups
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-blue-600 mt-1">
            {stats?.acceptedPickups || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Accepted & ready</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            People Served
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#16845B] mt-1">
            ~{stats?.estimatedPeopleServed || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            {stats?.mealsCollected || 0} meals collected
          </span>
        </div>
      </div>

      {/* Smart Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF8A45]" />
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                Rule-Matched Surplus Food for Your NGO
              </h3>
            </div>
            <Link to="/explore" className="text-xs font-bold text-[#16845B] hover:underline">
              Explore All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.donation._id}
                className="p-4 rounded-2xl border border-gray-100 bg-[#F8FAF7] space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#16845B] bg-[#16845B]/10 px-2 py-0.5 rounded-full text-[10px]">
                      {rec.matchScore}% Compatibility
                    </span>
                    <span className="text-gray-400 text-[10px]">
                      {rec.distanceKm ? `${rec.distanceKm} km` : 'Near you'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                    {rec.donation.foodName}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Available: <b>{rec.donation.availableQuantity} {rec.donation.unit}</b> • {rec.donation.category}
                  </p>
                </div>

                <Link
                  to="/explore"
                  className="w-full py-2 bg-white border border-gray-200 rounded-xl text-center text-xs font-bold text-[#16845B] hover:bg-[#16845B] hover:text-white transition shadow-2xs block"
                >
                  View & Request
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Requests List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#16845B]" />
            <h3 className="font-heading font-extrabold text-base text-gray-900">
              Recent Redistribution Requests
            </h3>
          </div>
          <Link to="/ngo/my-requests" className="text-xs font-bold text-[#16845B] hover:underline">
            View All Requests
          </Link>
        </div>

        <div className="space-y-3">
          {activeRequests.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              You haven't requested any food donations yet.
            </p>
          ) : (
            activeRequests.map((req) => (
              <div
                key={req._id}
                className="p-3.5 rounded-2xl border border-gray-100 bg-[#F8FAF7] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900 block">
                    {req.donationId?.foodName}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Quantity: <b className="text-[#105C42]">{req.requestedQuantity} {req.unit}</b> • Donor: {req.donorId?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      req.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'ACCEPTED'
                        ? 'bg-blue-100 text-blue-800'
                        : req.status === 'READY_FOR_PICKUP'
                        ? 'bg-purple-100 text-purple-800'
                        : req.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {req.status}
                  </span>
                  <Link
                    to="/ngo/pickup-tracking"
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#16845B]"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
