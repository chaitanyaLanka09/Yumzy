import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { PickupTracker } from '../../components/pickup/PickupTracker';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const NGOPickupTrackingPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    try {
      const res = await api.get('/requests/my');
      if (res.data?.success) {
        const activePickups = res.data.requests.filter((r) =>
          ['ACCEPTED', 'READY_FOR_PICKUP', 'COMPLETED'].includes(r.status)
        );
        setRequests(activePickups);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="font-heading font-extrabold text-2xl text-gray-900">
          NGO Food Pickup Tracking & Verification
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Provide your unique pickup reference code to donor kitchens and confirm receipt to complete donations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-800">
            No Active Pickups
          </h3>
          <p className="text-xs text-gray-500">
            Once a food donor accepts your request, your pickup progress timeline and verification code will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <PickupTracker key={req._id} request={req} onUpdate={fetchPickups} />
          ))}
        </div>
      )}
    </div>
  );
};
