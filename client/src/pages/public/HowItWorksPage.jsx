import React from 'react';
import { Utensils, Heart, CheckCircle2, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyNotice';

export const HowItWorksPage = () => {
  return (
    <div className="app-container py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#16845B] uppercase tracking-wider">
          Platform Architecture & Workflow
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
          How Yumzy Works
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          A seamless, transparent coordination lifecycle engineered for high speed, zero double-booking, and verified impact.
        </p>
      </div>

      <FoodSafetyBanner compact={true} />

      {/* Donor Workflow Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16845B]/10 text-[#16845B] flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-gray-900">
              Donor Workflow (Restaurants, Hotels & Caterers)
            </h3>
            <p className="text-xs text-gray-500">From surplus preparation to verified handover</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 space-y-2">
            <span className="font-bold text-[#16845B] block">Step 1: Publish Surplus</span>
            <p className="text-gray-600">
              Donor enters available food, quantity, allergen warnings, prep time, and pickup deadline.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 space-y-2">
            <span className="font-bold text-[#16845B] block">Step 2: Review & Accept</span>
            <p className="text-gray-600">
              When an NGO requests portions, donor reviews their profile and accepts. Inventory is reserved atomically.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 space-y-2">
            <span className="font-bold text-[#16845B] block">Step 3: Confirm Handover</span>
            <p className="text-gray-600">
              Donor packs food, generates pickup code, and confirms physical handover when NGO arrives.
            </p>
          </div>
        </div>
      </div>

      {/* Recipient NGO Workflow Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF8A45]/10 text-[#FF8A45] flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-gray-900">
              Recipient Workflow (NGOs, Food Banks & Shelters)
            </h3>
            <p className="text-xs text-gray-500">Discovery, smart matching, and collection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 space-y-2">
            <span className="font-bold text-[#FF8A45] block">Step 1: Explore & Match</span>
            <p className="text-gray-600">
              Browse listings with rule-based compatibility scoring based on proximity, capacity, and dietary needs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 space-y-2">
            <span className="font-bold text-[#FF8A45] block">Step 2: Request Quantity</span>
            <p className="text-gray-600">
              Specify exact number of meals needed and coordinate expected arrival time with donor kitchen.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 space-y-2">
            <span className="font-bold text-[#FF8A45] block">Step 3: Collect & Verify</span>
            <p className="text-gray-600">
              Present unique pickup reference code, inspect food on site, and confirm receipt on the app.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Confirmation & Security Note */}
      <div className="bg-gradient-to-r from-[#16845B]/10 to-[#105C42]/10 border border-[#16845B]/20 rounded-3xl p-6 text-xs text-gray-700 space-y-2">
        <h4 className="font-bold text-sm text-[#105C42] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span>Dual Confirmation Technology</span>
        </h4>
        <p className="leading-relaxed">
          Yumzy prevents ghost collections and misrepresentation by requiring BOTH the donor and the recipient NGO to confirm the physical exchange before marking any request as COMPLETED. Only verified completed donations count towards social impact analytics.
        </p>
      </div>
    </div>
  );
};
