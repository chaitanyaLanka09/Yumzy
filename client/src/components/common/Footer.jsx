import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Heart, ShieldAlert, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#18231C] text-[#E0E7E2] pt-16 pb-12 border-t border-gray-800">
      <div className="app-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800/80">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#16845B] flex items-center justify-center text-white shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Yumzy
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
              {t('hero_subtitle')}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#218B59] font-medium pt-1">
              <Award className="w-4 h-4 text-[#FF8A45]" />
              <span>Digital Food Redistribution Marketplace • Telangana & Hyderabad</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white mb-4 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  {t('nav_home')}
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  {t('nav_explore')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition">
                  {t('nav_how_it_works')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  {t('nav_about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Portals */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white mb-4 uppercase tracking-wider">
              Platform Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Donor Dashboard Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Recipient NGO Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Register as Restaurant or NGO
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Platform Moderation Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Food Safety Disclaimer Box */}
        <div className="mt-8 bg-black/30 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
          <ShieldAlert className="w-5 h-5 text-[#FF8A45] shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400 leading-relaxed">
            <span className="font-bold text-white">{t('safety_disclaimer_title')}: </span>
            {t('safety_disclaimer_text')}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Yumzy. All rights reserved. Food Redistribution Network.</p>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Built with passion for zero food waste</span>
            <Heart className="w-3.5 h-3.5 text-[#DC5151] fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
};
