import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Package,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AddDonationPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Preset food image gallery for convenient 1-click selection
  const presetImages = [
    { name: 'Veg Thali', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
    { name: 'Biryani Platter', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
    { name: 'Fresh Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { name: 'Rice & Curry', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80' },
    { name: 'Farm Fruits', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80' }
  ];

  const now = new Date();
  const defaultDeadline = new Date(now.getTime() + 6 * 3600 * 1000).toISOString().slice(0, 16);
  const defaultPrep = new Date(now.getTime() - 2 * 3600 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Vegetarian',
    dietaryType: 'veg',
    description: '',
    image: presetImages[0].url,
    quantity: 30,
    unit: 'Meals',
    preparationDateTime: defaultPrep,
    pickupStartTime: defaultPrep,
    pickupDeadline: defaultDeadline,
    useByDateTime: '',
    storageInstructions: 'Keep in temperature controlled container / ambient cool area.',
    allergenInformation: 'May contain dairy, gluten or peanuts.',
    packagingInformation: 'Hygienically packaged in tamper-evident food containers.',
    address: user?.organization?.address || 'Main Kitchen Premises',
    locality: user?.organization?.locality || 'Banjara Hills'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }

    if (!formData.pickupDeadline) {
      toast.error('Please specify a pickup deadline');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/donations', {
        foodName: formData.foodName,
        category: formData.category,
        dietaryType: formData.dietaryType,
        description: formData.description,
        image: formData.image,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        preparationDateTime: formData.preparationDateTime ? new Date(formData.preparationDateTime).toISOString() : new Date().toISOString(),
        pickupDeadline: new Date(formData.pickupDeadline).toISOString(),
        useByDateTime: formData.useByDateTime ? new Date(formData.useByDateTime).toISOString() : null,
        storageInstructions: formData.storageInstructions,
        allergenInformation: formData.allergenInformation,
        packagingInformation: formData.packagingInformation,
        pickupLocation: {
          address: formData.address,
          locality: formData.locality,
          city: user?.organization?.city || 'Hyderabad',
          state: user?.organization?.state || 'Telangana',
          postalCode: user?.organization?.postalCode || '500034'
        }
      });

      if (res.data?.success) {
        toast.success('Food donation listing published successfully!', {
          icon: '🍲',
          duration: 4000
        });
        navigate('/donor/my-donations');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create food listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl 2xl:max-w-6xl space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-[#16845B] uppercase tracking-wider">
            Surplus Redistribution Form
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 mt-1">
            Add New Food Donation Listing
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Provide accurate preparation, food safety disclosures, and pickup window for recipient NGOs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
              1. Basic Food Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleChange}
                  placeholder="E.g. Vegetarian Dum Biryani Meal Boxes"
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Food Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-vegetarian">Non-vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Packaged food">Packaged food</option>
                  <option value="Cooked meals">Cooked meals</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Dietary Classification
                </label>
                <select
                  name="dietaryType"
                  value={formData.dietaryType}
                  onChange={handleChange}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal</option>
                  <option value="jain">Jain Friendly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full text-sm font-bold p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Unit of Measure *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                >
                  <option value="Meals">Meals</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Packets">Packets</option>
                  <option value="Portions">Portions</option>
                  <option value="Kilograms">Kilograms</option>
                  <option value="Litres">Litres</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="E.g. Freshly packed surplus from afternoon banquet hall buffet..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>
            </div>
          </div>

          {/* Quick Photo Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              Food Image Selection (Click to choose preset photo)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {presetImages.map((img) => (
                <div
                  key={img.name}
                  onClick={() => setFormData({ ...formData, image: img.url })}
                  className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition relative ${
                    formData.image === img.url
                      ? 'border-[#16845B] shadow-md scale-102'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="h-20 w-full object-cover" />
                  <span className="text-[10px] font-bold block text-center py-1 bg-white truncate">
                    {img.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Timing Disclosures (Section 23 Requirements) */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-[#105C42] border-b border-gray-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16845B]" />
              <span>2. Mandatory Food Safety & Handling Disclosures</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Preparation Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  name="preparationDateTime"
                  value={formData.preparationDateTime}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pickup Deadline (Expiry from platform) *
                </label>
                <input
                  type="datetime-local"
                  required
                  name="pickupDeadline"
                  value={formData.pickupDeadline}
                  onChange={handleChange}
                  className="w-full text-xs font-bold text-[#DC5151] p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Storage & Temperature Instructions *
                </label>
                <input
                  type="text"
                  required
                  name="storageInstructions"
                  value={formData.storageInstructions}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Allergen Information Disclosures *
                </label>
                <input
                  type="text"
                  required
                  name="allergenInformation"
                  value={formData.allergenInformation}
                  onChange={handleChange}
                  placeholder="E.g. Contains dairy, peanuts, mustard, gluten"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Packaging Details
                </label>
                <input
                  type="text"
                  name="packagingInformation"
                  value={formData.packagingInformation}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>
            </div>
          </div>

          {/* Pickup Address */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#16845B]" />
              <span>3. Collection & Pickup Logistics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Locality (Hyderabad)
                </label>
                <input
                  type="text"
                  required
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Specific Street Address / Loading Dock
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/donor/overview')}
              className="px-5 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 text-xs font-bold text-white bg-[#16845B] hover:bg-[#105C42] rounded-xl shadow-md transition"
            >
              {loading ? 'Publishing...' : 'Publish Surplus Food Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
