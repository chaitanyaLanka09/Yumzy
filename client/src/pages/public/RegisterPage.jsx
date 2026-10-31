import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, Heart, Building, MapPin, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('restaurant');
  const [locality, setLocality] = useState('Banjara Hills');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
        phone,
        organizationName,
        organizationType,
        locality,
        address,
        capacity: Number(capacity)
      });
      toast.success(`Account registered successfully as ${role.toUpperCase()}!`, { icon: '🎉' });
      if (role === 'donor') navigate('/donor/overview');
      else navigate('/ngo/overview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-gray-200/80 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#16845B] uppercase tracking-wider">
            Join Yumzy Food Network
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            Create an Organization Account
          </h2>
          <p className="text-xs text-gray-500">
            Choose whether you are donating surplus food or collecting for charity.
          </p>
        </div>

        {/* Role Selection Pills */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F8FAF7] rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setRole('donor');
              setOrganizationType('restaurant');
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              role === 'donor'
                ? 'bg-[#16845B] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Food Donor (Restaurant/Hotel)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('ngo');
              setOrganizationType('ngo');
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              role === 'ngo'
                ? 'bg-[#16845B] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>NGO / Charitable Recipient</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Rajesh Kumar"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@org.org"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Organization / Entity Name
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="E.g. Spice Garden Restaurant"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Organization Type
              </label>
              <select
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              >
                {role === 'donor' ? (
                  <>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel / Buffet</option>
                    <option value="caterer">Event Caterer</option>
                    <option value="bakery">Bakery</option>
                    <option value="supermarket">Supermarket</option>
                  </>
                ) : (
                  <>
                    <option value="ngo">Charitable NGO</option>
                    <option value="food_bank">Food Bank</option>
                    <option value="shelter">Shelter Home</option>
                    <option value="community_kitchen">Community Kitchen</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Locality (Hyderabad)
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              >
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
                <option value="Madhapur">Madhapur</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Kukatpally">Kukatpally</option>
                <option value="Secunderabad">Secunderabad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Daily Meal Handling Capacity
              </label>
              <input
                type="number"
                min="10"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Road / Landmark / Building number"
              className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#16845B] hover:bg-[#105C42] text-white text-xs font-bold shadow-md hover:shadow-lg transition"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#16845B] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
