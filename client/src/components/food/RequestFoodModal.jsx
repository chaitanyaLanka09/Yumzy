import React, { useState } from 'react';
import { X, Clock, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

export const RequestFoodModal = ({ isOpen, onClose, donation, onSuccess }) => {
  const { t } = useLanguage();
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !donation) return null;

  // Deadline formatting
  const deadline = new Date(donation.pickupDeadline);
  const deadlineStr = deadline.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const qty = Number(requestedQuantity);
    if (!qty || qty <= 0) {
      toast.error('Requested quantity must be at least 1');
      return;
    }

    if (qty > donation.availableQuantity) {
      toast.error(`Cannot request more than available ${donation.availableQuantity} ${donation.unit}`);
      return;
    }

    if (!pickupTime) {
      toast.error('Please specify your expected pickup time');
      return;
    }

    const selectedPickup = new Date(pickupTime);
    if (selectedPickup > deadline) {
      toast.error('Expected pickup time must be before the donor deadline: ' + deadlineStr);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/requests', {
        donationId: donation._id,
        requestedQuantity: qty,
        pickupTime: selectedPickup.toISOString(),
        message
      });

      if (res.data.success) {
        toast.success('Food request submitted to donor! They will review shortly.', {
          icon: '🎉',
          duration: 5000
        });
        onSuccess && onSuccess(res.data.request);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-[#16845B] uppercase tracking-wider">
              Submit Redistribution Request
            </span>
            <h3 className="font-heading font-extrabold text-base text-gray-900 line-clamp-1">
              {donation.foodName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Available Info Card */}
        <div className="bg-[#F8FAF7] border border-gray-200 rounded-2xl p-4 mb-4 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Available to Request:</span>
            <span className="font-extrabold text-sm text-[#105C42]">
              {donation.availableQuantity} {donation.unit}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Donor Business:</span>
            <span className="font-semibold text-gray-800">
              {donation.organizationId?.organizationName || 'Verified Donor'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Pickup Deadline:</span>
            <span className="font-bold text-[#DC5151]">{deadlineStr}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t('form_requested_qty')} ({donation.unit})
            </label>
            <input
              type="number"
              min="1"
              max={donation.availableQuantity}
              required
              value={requestedQuantity}
              onChange={(e) => setRequestedQuantity(e.target.value)}
              className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
            />
            <span className="text-[11px] text-gray-500 mt-1 block">
              You can request any quantity up to {donation.availableQuantity} {donation.unit}.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t('form_pickup_time')}
            </label>
            <input
              type="datetime-local"
              required
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t('form_message')} (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., Our volunteer van will arrive at 3:30 PM with clean thermal canisters..."
              className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#16845B] hover:bg-[#105C42] rounded-xl shadow-md transition"
            >
              {loading ? 'Submitting...' : t('form_btn_request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
