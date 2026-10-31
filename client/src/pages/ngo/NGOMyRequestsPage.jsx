import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Clock, MapPin, XCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const NGOMyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/my');
      if (res.data?.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await api.patch(`/requests/${id}/cancel`, {
        reason: 'Cancelled by NGO coordination team'
      });
      if (res.data?.success) {
        toast.success('Request cancelled. Inventory released.');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const filteredRequests =
    statusFilter === 'ALL'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            My Food Donation Requests
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track status of requested food quantities, pickup codes, and collection history.
          </p>
        </div>

        <Link
          to="/explore"
          className="px-4 py-2.5 rounded-2xl bg-[#16845B] hover:bg-[#105C42] text-white font-bold text-xs shadow-xs transition"
        >
          Explore More Food
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {['ALL', 'PENDING', 'ACCEPTED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-[#16845B] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto space-y-3">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-800">
            No Requests Found
          </h3>
          <p className="text-xs text-gray-500">
            You don't have any requests in this status category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const pickupTimeStr = new Date(req.pickupTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={req._id}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#16845B]/10 text-[#16845B]">
                      Request #{req._id?.slice(-6)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-gray-900">
                    {req.donationId?.foodName}
                  </h3>

                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Donor: <b className="text-gray-900">{req.donorId?.name}</b>
                    </span>
                    <span>
                      Reserved: <b className="text-[#105C42]">{req.requestedQuantity} {req.unit}</b>
                    </span>
                    <span>
                      Target Pickup: <b>{pickupTimeStr}</b>
                    </span>
                  </div>

                  {req.pickupCode && (
                    <div className="text-xs font-mono font-bold text-[#105C42] pt-1">
                      Pickup Code: {req.pickupCode}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {['ACCEPTED', 'READY_FOR_PICKUP'].includes(req.status) && (
                    <Link
                      to="/ngo/pickup-tracking"
                      className="px-4 py-2.5 rounded-xl bg-[#16845B] hover:bg-[#105C42] text-xs font-bold text-white shadow-xs transition"
                    >
                      Go to Pickup Tracking
                    </Link>
                  )}

                  {['PENDING', 'ACCEPTED'].includes(req.status) && (
                    <button
                      onClick={() => handleCancelRequest(req._id)}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
