import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Inbox,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyNotice';
import api from '../../services/api';

export const DonorOverviewPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [activeDonations, setActiveDonations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [analyticsRes, donationsRes, requestsRes] = await Promise.all([
          api.get('/analytics/donor'),
          api.get('/donations/my'),
          api.get('/requests/incoming')
        ]);

        if (analyticsRes.data?.success) setStats(analyticsRes.data.stats);
        if (donationsRes.data?.success) setActiveDonations(donationsRes.data.donations.slice(0, 4));
        if (requestsRes.data?.success) setIncomingRequests(requestsRes.data.requests.slice(0, 5));
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#16845B] to-[#105C42] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
            Donor Dashboard
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl mt-1">
            {user?.organization?.organizationName || user?.name}
          </h2>
          <p className="text-xs text-emerald-100 mt-1.5 max-w-xl">
            Redistribute surplus commercial culinary meals, reduce biological waste, and feed verified Hyderabad community shelters.
          </p>
        </div>

        <Link
          to="/donor/add-donation"
          className="px-5 py-3 rounded-2xl bg-white text-[#16845B] font-bold text-xs shadow-md hover:bg-emerald-50 transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Food</span>
        </Link>
      </div>

      {/* Mandatory Food Safety Notice */}
      <FoodSafetyBanner compact={true} />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Total Listings
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 mt-1">
            {stats?.totalListed || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Active: {stats?.activeListings || 0}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Pending Requests
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#FF8A45] mt-1">
            {stats?.pendingRequests || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Need approval</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Completed Pickups
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#16845B] mt-1">
            {stats?.completedDonations || 0}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Fully redistributed</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Meals Donated
          </span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#105C42] mt-1">
            {stats?.estimatedMealsRedistributed || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            ~{stats?.co2SavedKg || 0} kg CO₂ avoided
          </span>
        </div>
      </div>

      {/* Two Column Grid: Incoming Requests & Active Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming NGO Requests */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#16845B]" />
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                Incoming NGO Requests
              </h3>
            </div>
            <Link
              to="/donor/incoming-requests"
              className="text-xs font-bold text-[#16845B] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {incomingRequests.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No pending food requests currently.
              </p>
            ) : (
              incomingRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-3.5 rounded-2xl border border-gray-100 bg-[#F8FAF7] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">
                      {req.ngoOrganization?.organizationName || req.ngoId?.name || 'NGO Recipient'}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Requested: <b className="text-[#105C42]">{req.requestedQuantity} {req.unit}</b> • {req.donationId?.foodName}
                    </span>
                  </div>

                  <Link
                    to="/donor/incoming-requests"
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#16845B] font-bold text-[11px] hover:border-[#16845B] shadow-2xs shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Current Food Listings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#16845B]" />
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                Recent Food Listings
              </h3>
            </div>
            <Link
              to="/donor/my-donations"
              className="text-xs font-bold text-[#16845B] hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {activeDonations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No active food listings. Click "Publish New Food" above to add one.
              </p>
            ) : (
              activeDonations.map((d) => (
                <div
                  key={d._id}
                  className="p-3.5 rounded-2xl border border-gray-100 bg-[#F8FAF7] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={d.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'}
                      alt={d.foodName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block truncate max-w-[200px]">
                        {d.foodName}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {d.availableQuantity} of {d.quantity} {d.unit} available
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      d.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.status === 'PARTIALLY_RESERVED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
