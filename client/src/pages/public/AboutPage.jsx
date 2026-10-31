import React from 'react';
import { ShieldCheck, Heart, Utensils, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyNotice';

export const AboutPage = () => {
  return (
    <div className="app-container py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#16845B] uppercase tracking-wider">
          Digital Food Redistribution Marketplace
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
          About Yumzy Food Redistribution
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Transforming commercial food surplus into community nutrition through intelligent digital coordination.
        </p>
      </div>

      {/* Mandatory Safety Disclosure */}
      <FoodSafetyBanner />

      {/* The Problem & The Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-gray-900">
            The Food Wastage Crisis
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            In urban hubs like Hyderabad, tons of edible food prepared by banquet halls, hotel buffets, catering businesses, and bakeries are discarded daily simply because of unpredictable daily attendance and lack of immediate logistics coordination.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-gray-900">
            Yumzy's Redistribution Solution
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Yumzy bridges this critical gap. Donors publish real-time quantities with strict safety disclosures. Verified NGOs reserve exact portions without double booking, verify collection using tamper-proof pickup codes, and log verified social impact.
          </p>
        </div>
      </div>

      {/* Food Safety Commitment */}
      <div className="bg-[#F8FAF7] rounded-3xl p-8 border border-gray-200 space-y-4">
        <h3 className="font-heading font-extrabold text-lg text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#16845B]" />
          <span>Our Commitment to Responsible Food Safety</span>
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Yumzy enforces mandatory disclosures for every listing: preparation timestamp, storage temperature guidance, allergen warnings, and strict pickup deadlines. All expired items are automatically closed from public discovery to protect recipient communities.
        </p>
      </div>
    </div>
  );
};
