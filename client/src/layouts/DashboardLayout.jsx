import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Utensils,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const DashboardLayout = ({ title, subtitle, navItems = [], children }) => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16845B] to-[#105C42] flex items-center justify-center text-white shadow-sm">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#16845B]">
              Yumzy
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200 text-xs text-gray-500">
            <span className="bg-[#16845B]/10 text-[#16845B] font-bold px-2 py-0.5 rounded uppercase">
              {user?.role} Portal
            </span>
            <span>•</span>
            <span className="font-medium text-gray-700">{user?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/explore"
            className="hidden sm:inline-flex text-xs font-semibold text-gray-600 hover:text-[#16845B] px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Marketplace
          </Link>

          <button
            onClick={toggleLanguage}
            className="text-xs font-semibold border border-gray-200 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 text-gray-700 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-[#16845B]" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-xs font-semibold text-red-600 hover:bg-red-50 p-2 rounded-xl flex items-center gap-1.5 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex w-full max-w-[94%] xl:max-w-[92%] 2xl:max-w-[1820px] mx-auto px-2 sm:px-4 lg:px-6 py-6 gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside
          className={`${
            collapsed ? 'w-20' : 'w-64'
          } shrink-0 bg-white rounded-3xl border border-gray-200/80 p-4 shadow-xs transition-all duration-300 hidden md:flex flex-col justify-between`}
        >
          <div>
            {/* User Profile Summary */}
            <div className="flex items-center gap-3 p-2.5 mb-4 bg-[#F8FAF7] rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#16845B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name?.[0] || 'U'}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{user?.name}</h4>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide block truncate">
                    {user?.organization?.organizationName || user?.role}
                  </span>
                </div>
              )}
            </div>

            {/* Nav Items */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                    item.active
                      ? 'bg-[#16845B] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.active
                          ? 'bg-white text-[#16845B]'
                          : 'bg-[#FF8A45] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom collapse button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Header Title Banner */}
          {(title || subtitle) && (
            <div className="mb-6">
              <h1 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
                {title}
              </h1>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
          )}

          {/* Children Pages */}
          {children}
        </main>
      </div>
    </div>
  );
};
