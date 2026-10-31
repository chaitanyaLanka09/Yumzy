import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const PickupTracker = ({ request, onUpdate }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const isDonor = user?.role === 'donor' || request.donorId?._id === user?._id;
  const isNgo = user?.role === 'ngo' || request.ngoId?._id === user?._id;

  const handleCopyCode = () => {
    if (request.pickupCode) {
      navigator.clipboard.writeText(request.pickupCode);
      setCopied(true);
      toast.success('Pickup code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDonorMarkReady = async () => {
    try {
      const res = await api.patch(`/requests/${request._id}/ready`, {
        instructions: 'Food packed in temperature controlled containers at dispatch desk.'
      });
      if (res.data.success) {
        toast.success('Marked Ready for Pickup! Recipient NGO notified.');
        onUpdate && onUpdate(res.data.request);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleConfirmPickup = async () => {
    setConfirming(true);
    try {
      const payload = isNgo ? { confirmationCode: inputCode || request.pickupCode } : {};
      const res = await api.patch(`/requests/${request._id}/confirm-pickup`, payload);
      if (res.data.success) {
        toast.success(res.data.message, { icon: '🎉', duration: 4000 });
        onUpdate && onUpdate(res.data.request);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pickup confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  // Steps definition for visual progress timeline
  const steps = [
    { label: 'Submitted', status: 'PENDING' },
    { label: 'Accepted', status: 'ACCEPTED' },
    { label: 'Ready', status: 'READY_FOR_PICKUP' },
    { label: 'Completed', status: 'COMPLETED' }
  ];

  const getStepIndex = (status) => {
    if (status === 'PENDING') return 0;
    if (status === 'ACCEPTED') return 1;
    if (status === 'READY_FOR_PICKUP') return 2;
    if (status === 'COMPLETED') return 3;
    return -1;
  };

  const currentIdx = getStepIndex(request.status);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#16845B]">
            Coordination ID: #{request._id?.slice(-6)}
          </span>
          <h3 className="font-heading font-extrabold text-lg text-gray-900">
            {request.donationId?.foodName || 'Food Item'}
          </h3>
          <span className="text-xs text-gray-500">
            Quantity: <b className="text-[#105C42]">{request.requestedQuantity} {request.unit}</b>
          </span>
        </div>

        {/* Pickup Code Box */}
        {request.pickupCode && (
          <div className="bg-[#16845B]/10 border border-[#16845B]/30 rounded-2xl px-4 py-2.5 flex items-center justify-between sm:justify-start gap-3">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase block">
                {t('pickup_code_label')}
              </span>
              <span className="font-mono font-extrabold text-base text-[#105C42] tracking-wider">
                {request.pickupCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1.5 text-[#16845B] hover:bg-[#16845B]/15 rounded-lg transition"
              title="Copy Pickup Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="py-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#16845B] z-0 transition-all duration-500"
            style={{ width: `${Math.max(0, currentIdx) * 33.3}%` }}
          />

          {steps.map((st, i) => {
            const isCompleted = i <= currentIdx;
            const isCurrent = i === currentIdx;

            return (
              <div key={st.label} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    isCompleted
                      ? 'bg-[#16845B] text-white shadow-md shadow-[#16845B]/30'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 ${
                    isCurrent ? 'text-[#16845B]' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Confirmation Status Box */}
      <div className="bg-[#F8FAF7] border border-gray-200 rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-xs text-[#105C42] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span>Dual Confirmation Status (Required for Completion)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Donor confirmation status */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              request.donorPickupConfirmed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                request.donorPickupConfirmed ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold block">1. Donor Handover</span>
              <span className="text-[11px]">
                {request.donorPickupConfirmed ? 'Handover Confirmed' : 'Awaiting Donor Confirmation'}
              </span>
            </div>
          </div>

          {/* NGO confirmation status */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              request.ngoPickupConfirmed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                request.ngoPickupConfirmed ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold block">2. NGO Receipt</span>
              <span className="text-[11px]">
                {request.ngoPickupConfirmed ? 'Collection Confirmed' : 'Awaiting NGO Confirmation'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action triggers depending on role and current status */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {/* Donor can mark Ready if in ACCEPTED status */}
        {isDonor && request.status === 'ACCEPTED' && (
          <button
            onClick={handleDonorMarkReady}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#16845B] hover:bg-[#105C42] rounded-xl shadow-sm transition"
          >
            {t('btn_mark_ready')}
          </button>
        )}

        {/* Donor Handover Confirmation */}
        {isDonor &&
          (request.status === 'READY_FOR_PICKUP' || request.status === 'ACCEPTED') &&
          !request.donorPickupConfirmed && (
            <button
              onClick={handleConfirmPickup}
              disabled={confirming}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#16845B] hover:bg-[#105C42] rounded-xl shadow-sm transition"
            >
              {confirming ? 'Confirming...' : t('btn_confirm_handover')}
            </button>
          )}

        {/* NGO Collection Confirmation */}
        {isNgo &&
          (request.status === 'READY_FOR_PICKUP' || request.status === 'ACCEPTED') &&
          !request.ngoPickupConfirmed && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter Pickup Code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-gray-300 uppercase tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
              <button
                onClick={handleConfirmPickup}
                disabled={confirming}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#16845B] hover:bg-[#105C42] rounded-xl shadow-sm transition shrink-0"
              >
                {confirming ? 'Confirming...' : t('btn_confirm_collection')}
              </button>
            </div>
          )}

        {request.status === 'COMPLETED' && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-4 py-2 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            <span>Donation Successfully Completed & Impact Recorded</span>
          </div>
        )}
      </div>
    </div>
  );
};
