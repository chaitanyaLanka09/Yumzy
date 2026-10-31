import React, { useEffect, useState } from 'react';
import {
  Inbox,
  Check,
  X,
  Clock,
  ShieldCheck,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const IncomingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/incoming');
      if (res.data?.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load incoming requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await api.patch(`/requests/${id}/accept`);
      if (res.data?.success) {
        toast.success(`Request accepted! Pickup Code: ${res.data.pickupCode}`, {
          icon: '✅',
          duration: 5000
        });
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/requests/${selectedRequestId}/reject`, {
        reason: rejectReason
      });
      if (res.data?.success) {
        toast.success('Request rejected.');
        setRejectModalOpen(false);
        setRejectReason('');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="font-heading font-extrabold text-2xl text-gray-900">
          Incoming Food Requests from NGOs
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Review requests, reserve quantity atomically upon acceptance, and issue pickup codes.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto space-y-3">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-800">
            No Incoming Requests
          </h3>
          <p className="text-xs text-gray-500">
            When charitable NGOs request portions of your surplus food, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === 'PENDING';
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
                {/* Left Info */}
                <div className="space-y-2 max-w-3xl flex-1">
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
                    {req.donationId?.foodName || 'Food Item'}
                  </h3>

                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      NGO: <b className="text-gray-900">{req.ngoOrganization?.organizationName || req.ngoId?.name}</b>
                    </span>
                    <span>
                      Requested: <b className="text-[#105C42]">{req.requestedQuantity} {req.unit}</b>
                    </span>
                    <span>
                      Estimated Pickup: <b className="text-gray-800">{pickupTimeStr}</b>
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-xs text-gray-500 italic bg-[#F8FAF7] p-2.5 rounded-xl border border-gray-100">
                      "{req.message}"
                    </p>
                  )}

                  {req.pickupCode && (
                    <div className="text-xs font-mono font-bold text-[#105C42] pt-1">
                      Pickup Code: {req.pickupCode}
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRequestId(req._id);
                          setRejectModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="px-5 py-2.5 rounded-xl bg-[#16845B] hover:bg-[#105C42] text-xs font-bold text-white shadow-xs transition"
                      >
                        Accept & Reserve Food
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      Status: {req.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-heading font-extrabold text-base text-gray-900 mb-2">
              Decline Request
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Please optionally provide a reason for declining this request.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Quantity already reserved for another pickup..."
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
