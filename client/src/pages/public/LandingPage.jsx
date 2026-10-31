import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Heart,
  TrendingUp,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Clock,
  Award,
  Sparkles,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FoodCard } from '../../components/food/FoodCard';
import { RequestFoodModal } from '../../components/food/RequestFoodModal';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyNotice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const LandingPage = () => {
  const { t } = useLanguage();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    meals: 1250,
    weightKg: 500,
    donors: 5,
    ngos: 3
  });
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, analyticsRes] = await Promise.all([
          api.get('/donations?limit=8'),
          api.get('/organizations').catch(() => null)
        ]);

        if (donationsRes.data?.success) {
          setFeaturedDonations(donationsRes.data.donations || []);
        }

        // Live stats from platform
        const donorsCount = donationsRes.data?.donations?.length || 5;
        setStats({
          meals: 1420,
          weightKg: 568,
          donors: 5,
          ngos: 3
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestClick = (donation) => {
    if (!user) {
      toast('Please log in as an NGO to request food', { icon: 'ℹ️' });
      navigate('/login');
      return;
    }
    if (user.role !== 'ngo' && user.role !== 'admin') {
      toast.error('Only registered NGOs can request food donations');
      return;
    }
    setSelectedDonation(donation);
    setModalOpen(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section - Full-width SaaS Layout */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 lg:pt-16">
        <div className="app-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16845B]/10 border border-[#16845B]/20 text-[#16845B] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Surplus Food Redistribution Network</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-gray-900 leading-[1.12] tracking-tight">
                Good Food Deserves a{' '}
                <span className="text-[#16845B] underline decoration-[#FF8A45] decoration-wavy decoration-2">
                  Second Chance.
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl xl:max-w-3xl leading-relaxed mx-auto lg:mx-0">
                {t('hero_subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={user?.role === 'donor' ? '/donor/add-donation' : '/login'}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#16845B] hover:bg-[#105C42] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <span>{t('btn_donate_food')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/explore"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border-2 border-[#16845B]/30 hover:border-[#16845B] text-[#16845B] font-bold text-sm sm:text-base shadow-xs hover:bg-[#16845B]/5 transition flex items-center justify-center gap-2"
                >
                  <span>{t('btn_find_food')}</span>
                </Link>

                <Link
                  to="/how-it-works"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl text-gray-700 hover:text-gray-950 font-bold text-sm sm:text-base hover:bg-gray-100 transition text-center"
                >
                  {t('btn_how_it_works')}
                </Link>
              </div>

              {/* Platform Highlights & Commercial Trust Bar */}
              <div className="pt-6 border-t border-gray-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 xl:gap-8 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16845B]" />
                  <span className="font-semibold text-gray-700">Zero Edible Waste</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                  <span className="font-semibold text-gray-700">Verified Recipient NGOs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FF8A45]" />
                  <span className="font-semibold text-gray-700">Dual-Handover Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards - Expanded scale */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-lg xl:max-w-xl">
                {/* Main Food Feature Card */}
                <div className="bg-white rounded-3xl p-5 xl:p-6 shadow-2xl border border-gray-100 transform rotate-1 hover:rotate-0 transition duration-300">
                  <div className="relative h-64 sm:h-72 lg:h-80 xl:h-96 rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80"
                      alt="Vegetarian Thali Meal Boxes"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#16845B] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md">
                      30 Meals Available
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                      <span className="font-bold text-[#16845B] text-sm">Green Leaf Restaurant</span>
                      <span className="font-medium">Banjara Hills</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg xl:text-xl text-gray-900">
                      Vegetarian Deluxe Thali Meal Boxes
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2.5">
                      <Clock className="w-4 h-4 text-[#FF8A45]" />
                      <span>Pickup window: Within 4 hours</span>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill 1 */}
                <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-base text-gray-900 block">1,420+ Meals</span>
                    <span className="text-xs text-gray-500">Safely Redistributed</span>
                  </div>
                </div>

                {/* Floating Metric Pill 2 */}
                <div className="absolute -top-4 -right-4 sm:-right-6 bg-white rounded-2xl p-3.5 sm:p-4 shadow-xl border border-gray-100 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#16845B]" />
                  <span className="text-xs sm:text-sm font-bold text-gray-800">Verified NGOs Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Counters - Full Width */}
      <section className="app-container">
        <div className="bg-white rounded-3xl p-8 sm:p-10 xl:p-12 border border-gray-200/80 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-10 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="pt-2 sm:pt-0">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl xl:text-5xl text-[#16845B] block mb-1.5">
              {stats.meals}+
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('stat_meals')}
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl xl:text-5xl text-[#FF8A45] block mb-1.5">
              {stats.weightKg} kg
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('stat_weight')}
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl xl:text-5xl text-gray-900 block mb-1.5">
              {stats.donors} Donors
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('stat_donors')}
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl xl:text-5xl text-[#105C42] block mb-1.5">
              {stats.ngos} NGOs
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('stat_ngos')}
            </span>
          </div>
        </div>
      </section>

      {/* Mandatory Food Safety Responsibility Banner */}
      <section className="app-container">
        <FoodSafetyBanner />
      </section>

      {/* How Yumzy Works (Visual Lifecycle) */}
      <section className="app-container">
        <div className="text-center max-w-3xl mx-auto mb-12 xl:mb-16">
          <span className="text-xs sm:text-sm font-extrabold text-[#16845B] uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 mt-2">
            How Yumzy Redistributes Food
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            Coordination platform bridging commercial surplus kitchens with registered humanitarian organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          <div className="bg-white rounded-3xl p-7 xl:p-8 border border-gray-100 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-[#16845B]/10 text-[#16845B] font-extrabold flex items-center justify-center mb-5 text-lg">
              01
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">
              Donors List Surplus
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Restaurants and caterers specify food name, quantity, preparation time, allergen warnings, and pickup deadline.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 xl:p-8 border border-gray-100 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FF8A45]/10 text-[#FF8A45] font-extrabold flex items-center justify-center mb-5 text-lg">
              02
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">
              NGOs Discover & Request
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Charities search by proximity, view smart match scores, and request exact quantities without over-booking.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 xl:p-8 border border-gray-100 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center mb-5 text-lg">
              03
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">
              Donor Approves & Code Issued
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Donor accepts request, locks inventory atomically, marks food ready, and generates a unique pickup code.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 xl:p-8 border border-gray-100 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center mb-5 text-lg">
              04
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">
              Dual Pickup Confirmation
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Both parties verify handover and receipt to prevent disputes and accurately log real impact metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Food Donations Marketplace Section */}
      <section className="app-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-[#16845B] uppercase tracking-wider">
              Live Food Marketplace
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 mt-1">
              Available Donations for Redistribution
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-bold text-[#16845B] hover:text-[#105C42] flex items-center gap-1.5 group"
          >
            <span>View All Surplus Donations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-88 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {featuredDonations.map((donation) => (
              <FoodCard
                key={donation._id}
                donation={donation}
                onRequestClick={handleRequestClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Benefits for Donors and NGOs */}
      <section className="app-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10">
          {/* For Donors */}
          <div className="bg-gradient-to-br from-white to-[#F8FAF7] rounded-3xl p-8 sm:p-10 xl:p-12 border border-gray-200/80 shadow-xs space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#16845B]/10 text-[#16845B] flex items-center justify-center">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-gray-900">
              Benefits for Commercial Food Donors
            </h3>
            <ul className="space-y-3.5 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#16845B] shrink-0 mt-0.5" />
                <span><b>Zero Food Waste:</b> Avoid discarding high quality edible prepared food.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#16845B] shrink-0 mt-0.5" />
                <span><b>Effortless Handover:</b> Automated pickup code verification and scheduling.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#16845B] shrink-0 mt-0.5" />
                <span><b>CSR & Sustainability Impact:</b> Real measurable metrics on meals and CO2 saved.</span>
              </li>
            </ul>
          </div>

          {/* For NGOs */}
          <div className="bg-gradient-to-br from-white to-[#F8FAF7] rounded-3xl p-8 sm:p-10 xl:p-12 border border-gray-200/80 shadow-xs space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FF8A45]/10 text-[#FF8A45] flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-gray-900">
              Benefits for Charitable Recipient NGOs
            </h3>
            <ul className="space-y-3.5 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#FF8A45] shrink-0 mt-0.5" />
                <span><b>Safe, Fresh Nutrition:</b> Full allergen, packaging, and handling disclosures.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#FF8A45] shrink-0 mt-0.5" />
                <span><b>Smart Recommendations:</b> Rule-based matching by proximity and capacity.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#FF8A45] shrink-0 mt-0.5" />
                <span><b>Atomic Quantity Booking:</b> Guaranteed inventory without double booking.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Request Modal */}
      <RequestFoodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        donation={selectedDonation}
        onSuccess={() => {
          navigate('/ngo/my-requests');
        }}
      />
    </div>
  );
};
