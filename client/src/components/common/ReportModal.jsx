import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const [reason, setReason] = useState('inaccurate_info');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/reports', {
        targetType,
        targetId,
        reason,
        description
      });
      if (res.data.success) {
        toast.success('Report submitted. Platform moderators will review this shortly.');
        onClose();
        setDescription('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#DC5151]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-heading font-bold text-base text-gray-900">
              Report Safety or Content Issue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {targetName && (
          <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            Reporting: <span className="font-semibold text-gray-800">{targetName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reason for Reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
            >
              <option value="inaccurate_info">Inaccurate or misleading food details</option>
              <option value="unsafe_handling">Unsafe food storage or handling concern</option>
              <option value="fake_listing">Fake or unavailable listing</option>
              <option value="inappropriate_content">Inappropriate content or communication</option>
              <option value="suspicious_activity">Suspicious account behavior</option>
              <option value="other">Other issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Detailed Explanation
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain the safety concern or discrepancy observed..."
              className="w-full text-sm rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#DC5151] hover:bg-[#C24141] rounded-xl transition"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
