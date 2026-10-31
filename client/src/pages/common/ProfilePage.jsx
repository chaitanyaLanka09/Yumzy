import React, { useState } from 'react';
import { User, Building, MapPin, Phone, Mail, Globe, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [orgName, setOrgName] = useState(user?.organization?.organizationName || '');
  const [locality, setLocality] = useState(user?.organization?.locality || 'Banjara Hills');
  const [address, setAddress] = useState(user?.organization?.address || '');
  const [capacity, setCapacity] = useState(user?.organization?.capacity || 100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update User profile
      const userRes = await api.put('/users/profile', {
        name,
        phone,
        preferredLanguage
      });

      // Update Organization profile if applicable
      let updatedOrg = user?.organization;
      if (user?.organization) {
        const orgRes = await api.put('/organizations/me', {
          organizationName: orgName,
          locality,
          address,
          capacity: Number(capacity)
        });
        if (orgRes.data?.success) {
          updatedOrg = orgRes.data.organization;
        }
      }

      if (userRes.data?.success) {
        updateUser({
          ...userRes.data.user,
          organization: updatedOrg
        });
        setLanguage(preferredLanguage);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl 2xl:max-w-5xl space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-[#16845B] uppercase tracking-wider">
            Account & Organization Settings
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 mt-1">
            Profile Settings
          </h2>
          <p className="text-xs text-gray-500">
            Keep your contact, location, and operational capacity updated for accurate redistribution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            {user?.organization && (
              <>
                <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-xs text-[#105C42] uppercase tracking-wider mb-2">
                    Organization Logistics
                  </h4>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Organization / Entity Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Daily Capacity (Meals)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#16845B] hover:bg-[#105C42] text-xs font-bold text-white shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
