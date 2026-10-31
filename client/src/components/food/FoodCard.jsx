import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  AlertCircle,
  Eye,
  Flag,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ReportModal } from '../common/ReportModal';

export const FoodCard = ({ donation, onRequestClick, matchScore, distanceKm }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isExpired = new Date(donation.pickupDeadline) < new Date();
  const isAvailable = donation.availableQuantity > 0 && !isExpired;

  // Format pickup deadline
  const deadlineDate = new Date(donation.pickupDeadline);
  const deadlineStr = deadlineDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm card-hover flex flex-col h-full relative group">
        {/* Match Score Badge (if present from smart matching engine) */}
        {matchScore && matchScore > 0 && (
          <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-[#16845B] to-[#105C42] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current" />
            <span>{matchScore}% Match</span>
          </div>
        )}

        {/* Report Button */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-[#DC5151] flex items-center justify-center shadow-md transition"
          title="Report Listing / Safety Issue"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>

        {/* Food Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={
              donation.image ||
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
            }
            alt={donation.foodName}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />

          {/* Dietary Pill */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1.5 text-gray-800">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                donation.dietaryType === 'veg' || donation.category === 'Vegetarian'
                  ? 'bg-[#218B59]'
                  : donation.dietaryType === 'vegan'
                  ? 'bg-emerald-500'
                  : 'bg-[#DC5151]'
              }`}
            />
            <span className="capitalize">{donation.category}</span>
          </div>

          {/* Available Quantity Overlay Badge */}
          <div className="absolute bottom-3 right-3 bg-[#105C42]/90 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
            {donation.availableQuantity} {donation.unit} Left
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Donor Name & Location */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-semibold text-[#16845B] truncate max-w-[180px]">
                {donation.organizationId?.organizationName || donation.donorId?.name || 'Verified Donor'}
              </span>
              <span className="flex items-center gap-1 text-gray-500 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{donation.pickupLocation?.locality || 'Hyderabad'}</span>
                {distanceKm !== null && distanceKm !== undefined && (
                  <span className="text-[#16845B] font-bold">({distanceKm} km)</span>
                )}
              </span>
            </div>

            {/* Food Name */}
            <h3 className="font-heading font-bold text-base text-gray-900 group-hover:text-[#16845B] transition line-clamp-1 mb-2">
              {donation.foodName}
            </h3>

            {/* Description Snippet */}
            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
              {donation.description || 'Nutritious surplus meal packaged hygienically for redistribution.'}
            </p>

            {/* Quick Safety Disclosures */}
            <div className="bg-[#F8FAF7] rounded-xl p-2.5 space-y-1.5 border border-gray-100 text-[11px] text-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-[#FF8A45]" />
                  <span>{t('pickup_deadline')}:</span>
                </span>
                <span className="font-bold text-gray-900">{deadlineStr}</span>
              </div>
              {donation.allergenInformation && (
                <div className="text-[10px] text-gray-500 truncate">
                  <span className="font-semibold text-gray-700">Allergens:</span> {donation.allergenInformation}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setDetailsOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition flex items-center justify-center gap-1 shrink-0"
              title="Full safety disclosures"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('view_details')}</span>
            </button>

            {/* Request Food Button */}
            {isAvailable ? (
              <button
                onClick={() => onRequestClick(donation)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#16845B] hover:bg-[#105C42] shadow-sm hover:shadow transition text-center flex items-center justify-center gap-1.5"
              >
                <span>{t('btn_request_food')}</span>
              </button>
            ) : (
              <button
                disabled
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 cursor-not-allowed text-center"
              >
                {isExpired ? 'Expired' : 'Fully Reserved'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details & Food Safety Disclosure Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[11px] font-bold text-[#16845B] uppercase tracking-wider">
                  {donation.category}
                </span>
                <h3 className="font-heading font-extrabold text-lg text-gray-900">
                  {donation.foodName}
                </h3>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="rounded-2xl overflow-hidden h-44 w-full">
                <img
                  src={donation.image}
                  alt={donation.foodName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Description</h4>
                <p className="text-gray-600 leading-relaxed">{donation.description}</p>
              </div>

              {/* Safety Disclosures Grid */}
              <div className="bg-[#F8FAF7] border border-gray-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs text-[#105C42] flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                  <span>Mandatory Food Safety Disclosures</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Preparation Time:</span>
                    <span className="font-semibold text-gray-900">
                      {donation.preparationDateTime
                        ? new Date(donation.preparationDateTime).toLocaleString()
                        : 'Freshly prepared'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Pickup Deadline:</span>
                    <span className="font-semibold text-[#DC5151]">{deadlineStr}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Consume By:</span>
                    <span className="font-semibold text-gray-900">
                      {donation.useByDateTime
                        ? new Date(donation.useByDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Within 4-6 hours of pickup'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Packaging:</span>
                    <span className="font-semibold text-gray-900">{donation.packagingInformation || 'Food-grade containers'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block mb-0.5">Storage & Handling Instructions:</span>
                  <p className="font-medium text-gray-800">{donation.storageInstructions}</p>
                </div>

                <div>
                  <span className="text-gray-500 block mb-0.5">Known Allergen Disclosures:</span>
                  <p className="font-medium text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    {donation.allergenInformation || 'None declared'}
                  </p>
                </div>
              </div>

              {/* Donor Pickup Address */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <h5 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#16845B]" />
                  <span>Pickup Location</span>
                </h5>
                <p className="text-gray-600">
                  {donation.pickupLocation?.address}, {donation.pickupLocation?.locality},{' '}
                  {donation.pickupLocation?.city}
                </p>
              </div>

              {/* Food Safety Disclaimer */}
              <p className="text-[10px] text-gray-500 italic leading-normal">
                {t('safety_disclaimer_text')}
              </p>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Close
                </button>
                {isAvailable && (
                  <button
                    onClick={() => {
                      setDetailsOpen(false);
                      onRequestClick(donation);
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#16845B] hover:bg-[#105C42] rounded-xl shadow-xs"
                  >
                    Request this Food
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="donation"
        targetId={donation._id}
        targetName={donation.foodName}
      />
    </>
  );
};
