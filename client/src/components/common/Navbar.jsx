import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import {
  Utensils,
  Globe,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user, logout, login } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/overview';
    if (user.role === 'ngo') return '/ngo/overview';
    if (user.role === 'admin') return '/admin/overview';
    return '/';
  };

  const navLinks = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_explore'), path: '/explore' },
    { name: t('nav_how_it_works'), path: '/how-it-works' },
    { name: t('nav_about'), path: '/about' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#16845B] to-[#105C42] flex items-center justify-center text-white shadow-md shadow-[#16845B]/20 group-hover:scale-105 transition">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-2xl tracking-tight text-[#16845B]">
                    Yumzy
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium tracking-wide hidden sm:block">
                  Food Redistribution Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'text-[#16845B] bg-[#16845B]/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Button (English / తెలుగు) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              title="Switch Language / భాషను మార్చండి"
            >
              <Globe className="w-3.5 h-3.5 text-[#16845B]" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Notifications Bell (when logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF8A45] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                      <h4 className="font-heading font-bold text-xs text-gray-900">
                        {t('dashboard_notifications')} ({unreadCount} new)
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-[#16845B] hover:underline font-semibold"
                        >
                          {t('mark_all_read')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">
                          {t('notif_empty')}
                        </p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition ${
                              n.isRead ? 'bg-gray-50 text-gray-600' : 'bg-[#16845B]/10 text-gray-900 font-medium'
                            }`}
                          >
                            <div className="font-bold text-[11px] text-[#105C42] mb-0.5">
                              {n.title}
                            </div>
                            <p className="line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons / User Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#16845B] hover:bg-[#105C42] text-white text-xs font-semibold shadow-xs transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('nav_dashboard')}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title={t('nav_logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:text-[#16845B] hover:bg-gray-50 rounded-xl transition"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#16845B] hover:bg-[#105C42] rounded-xl shadow-xs transition"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-[#16845B]/10 hover:text-[#16845B]"
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl bg-[#16845B] text-white font-semibold text-sm"
            >
              {t('nav_dashboard')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
