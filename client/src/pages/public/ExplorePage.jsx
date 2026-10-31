import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Map,
  Grid,
  Sparkles,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FoodCard } from '../../components/food/FoodCard';
import { RequestFoodModal } from '../../components/food/RequestFoodModal';
import { FoodMapModal } from '../../components/map/FoodMapModal';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyNotice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ExplorePage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dietaryType, setDietaryType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [locality, setLocality] = useState('');

  // Modals
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const categories = [
    'All',
    'Vegetarian',
    'Non-vegetarian',
    'Bakery',
    'Cooked meals',
    'Fruits',
    'Vegetables',
    'Packaged food'
  ];

  const localities = [
    'All Localities',
    'Banjara Hills',
    'Jubilee Hills',
    'Madhapur',
    'Gachibowli',
    'Kukatpally',
    'Secunderabad'
  ];

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (dietaryType !== 'all') params.dietaryType = dietaryType;
      if (sortBy) params.sortBy = sortBy;
      if (locality && locality !== 'All Localities') params.locality = locality;

      const res = await api.get('/donations', { params });
      if (res.data?.success) {
        setDonations(res.data.donations);
      }

      // If user is NGO, fetch smart matching recommendations
      if (user?.role === 'ngo') {
        try {
          const recRes = await api.get('/matching/recommended-donations');
          if (recRes.data?.success) {
            setRecommendations(recRes.data.recommendations);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load food listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category, dietaryType, sortBy, locality]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleRequestClick = (donation) => {
    if (!user) {
      toast('Please log in to request food donations', { icon: '🔑' });
      navigate('/login');
      return;
    }
    if (user.role !== 'ngo' && user.role !== 'admin') {
      toast.error('Only registered NGOs can request food donations');
      return;
    }
    setSelectedDonation(donation);
    setRequestModalOpen(true);
  };

  return (
    <div className="app-container py-8 space-y-8">
      {/* Page Title & View Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold text-[#16845B] uppercase tracking-wider">
            Zomato-Quality Food Redistribution
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-gray-900 tracking-tight">
            Explore Surplus Food Donations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse edible meals, bakeries, and fresh produce available for community redistribution in Hyderabad.
          </p>
        </div>

        {/* Map View Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#16845B] hover:border-[#16845B] shadow-2xs transition"
          >
            <Map className="w-4 h-4 text-[#16845B]" />
            <span>{t('map_view')}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Food Safety Banner */}
      <FoodSafetyBanner compact={true} />

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-12 pr-28 py-3.5 text-sm rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B] focus:border-transparent bg-[#F8FAF7]"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-[#16845B] hover:bg-[#105C42] text-white text-xs font-bold shadow-xs transition"
          >
            Search
          </button>
        </form>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                category === cat
                  ? 'bg-[#16845B] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Locality, Dietary, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-xs">
          {/* Locality */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Locality</label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 bg-white font-medium text-gray-700"
            >
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Type */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Dietary Type</label>
            <select
              value={dietaryType}
              onChange={(e) => setDietaryType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 bg-white font-medium text-gray-700"
            >
              <option value="all">All Dietary Types</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{t('filter_sort_by')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 bg-white font-medium text-gray-700"
            >
              <option value="recent">{t('sort_recent')}</option>
              <option value="deadline">{t('sort_deadline')}</option>
              <option value="quantity">{t('sort_quantity')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Smart Matching Recommendations (Highlighted for NGOs) */}
      {user?.role === 'ngo' && recommendations.length > 0 && (
        <div className="bg-[#E8F5EF] border border-[#CDE5D8] rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#16845B] fill-current" />
            <h3 className="font-heading font-extrabold text-base text-[#105C42]">
              Smart Rule-Matched Recommendations for {user.name}
            </h3>
          </div>
          <p className="text-xs text-[#526359]">
            Matched based on your organization's food preferences, daily capacity, and geographic proximity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 pt-2">
            {recommendations.slice(0, 4).map((rec) => (
              <FoodCard
                key={rec.donation._id}
                donation={rec.donation}
                matchScore={rec.matchScore}
                distanceKm={rec.distanceKm}
                onRequestClick={handleRequestClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Listings Grid */}
      <div>
        <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500">
          <span>Found {donations.length} surplus donations available</span>
          <button
            onClick={fetchDonations}
            className="flex items-center gap-1 text-[#16845B] hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900">
              No Food Listings Found
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We couldn't find any surplus listings matching your filters. Try selecting "All Categories" or clearing your search term.
            </p>
            <button
              onClick={() => {
                setCategory('All');
                setSearch('');
                setDietaryType('all');
                setLocality('All Localities');
              }}
              className="px-4 py-2 rounded-xl bg-[#16845B] text-white text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {donations.map((donation) => (
              <FoodCard
                key={donation._id}
                donation={donation}
                onRequestClick={handleRequestClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Request Food Modal */}
      <RequestFoodModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        donation={selectedDonation}
        onSuccess={() => {
          navigate('/ngo/my-requests');
        }}
      />

      {/* Food Map Modal */}
      <FoodMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        donations={donations}
      />
    </div>
  );
};
