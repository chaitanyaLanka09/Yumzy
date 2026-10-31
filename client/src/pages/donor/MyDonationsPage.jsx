import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, PlusCircle, XCircle, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const MyDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDonations = async () => {
    try {
      const res = await api.get('/donations/my');
      if (res.data?.success) {
        setDonations(res.data.donations);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleCloseDonation = async (id) => {
    if (!window.confirm('Are you sure you want to close this food listing?')) return;
    try {
      const res = await api.patch(`/donations/${id}/close`);
      if (res.data?.success) {
        toast.success('Food listing closed successfully');
        fetchMyDonations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close listing');
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this listing?')) return;
    try {
      const res = await api.delete(`/donations/${id}`);
      if (res.data?.success) {
        toast.success('Listing cancelled');
        fetchMyDonations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete listing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            My Food Donation Listings
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage your published surplus meals, view inventory reservations, and manage listings.
          </p>
        </div>

        <Link
          to="/donor/add-donation"
          className="px-4 py-2.5 rounded-2xl bg-[#16845B] hover:bg-[#105C42] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Donation</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto space-y-3">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-800">
            No Donations Published Yet
          </h3>
          <p className="text-xs text-gray-500">
            Click the button above to publish your first surplus food donation.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF7] text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-5">Food Item</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Available / Total</th>
                  <th className="py-4 px-4">Pickup Deadline</th>
                  <th className="py-4 px-4">Requests</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={d.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80'}
                          alt={d.foodName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">{d.foodName}</span>
                          <span className="text-[10px] text-gray-400">ID: #{d._id?.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">{d.category}</td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#105C42]">
                        {d.availableQuantity} {d.unit}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        of {d.quantity} {d.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(d.pickupDeadline).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {d.stats?.pendingRequests || 0} Pending
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {d.stats?.acceptedRequests || 0} Active
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
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
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-2">
                      {d.status !== 'EXPIRED' && d.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCloseDonation(d._id)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Close Listing"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDonation(d._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Cancel Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
