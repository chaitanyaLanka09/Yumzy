import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ExplorePage } from './pages/public/ExplorePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';

// Donor Pages
import { DonorOverviewPage } from './pages/donor/DonorOverviewPage';
import { AddDonationPage } from './pages/donor/AddDonationPage';
import { MyDonationsPage } from './pages/donor/MyDonationsPage';
import { IncomingRequestsPage } from './pages/donor/IncomingRequestsPage';
import { DonorPickupManagementPage } from './pages/donor/DonorPickupManagementPage';
import { DonorAnalyticsPage } from './pages/donor/DonorAnalyticsPage';

// NGO Pages
import { NGOOverviewPage } from './pages/ngo/NGOOverviewPage';
import { NGOMyRequestsPage } from './pages/ngo/NGOMyRequestsPage';
import { NGOPickupTrackingPage } from './pages/ngo/NGOPickupTrackingPage';
import { NGOImpactPage } from './pages/ngo/NGOImpactPage';

// Admin & Common
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ProfilePage } from './pages/common/ProfilePage';

// Icons for Sidebar Navs
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Inbox,
  Truck,
  TrendingUp,
  User,
  Heart,
  Compass,
  ShieldAlert,
  Users,
  Activity
} from 'lucide-react';

export default function App() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Donor Sidebar Items
  const donorNavItems = [
    { label: t('dashboard_overview'), path: '/donor/overview', icon: LayoutDashboard },
    { label: t('dashboard_my_donations'), path: '/donor/my-donations', icon: Package },
    { label: t('dashboard_add_donation'), path: '/donor/add-donation', icon: PlusCircle },
    { label: t('dashboard_incoming_requests'), path: '/donor/incoming-requests', icon: Inbox },
    { label: t('dashboard_pickup_management'), path: '/donor/pickup-management', icon: Truck },
    { label: t('dashboard_analytics'), path: '/donor/analytics', icon: TrendingUp },
    { label: t('dashboard_profile'), path: '/donor/profile', icon: User }
  ];

  // NGO Sidebar Items
  const ngoNavItems = [
    { label: t('dashboard_overview'), path: '/ngo/overview', icon: LayoutDashboard },
    { label: t('nav_explore'), path: '/explore', icon: Compass },
    { label: 'My Requests', path: '/ngo/my-requests', icon: Inbox },
    { label: 'Pickup Tracking', path: '/ngo/pickup-tracking', icon: Truck },
    { label: 'Impact Dashboard', path: '/ngo/impact', icon: Heart },
    { label: t('dashboard_profile'), path: '/ngo/profile', icon: User }
  ];

  // Admin Sidebar Items
  const adminNavItems = [
    { label: t('dashboard_overview'), path: '/admin/overview', icon: LayoutDashboard },
    { label: 'Platform Marketplace', path: '/explore', icon: Compass },
    { label: t('dashboard_profile'), path: '/admin/profile', icon: User }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7]">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Donor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['donor', 'admin']} />}>
            <Route
              path="/donor/*"
              element={
                <DashboardLayout navItems={donorNavItems}>
                  <Routes>
                    <Route path="overview" element={<DonorOverviewPage />} />
                    <Route path="my-donations" element={<MyDonationsPage />} />
                    <Route path="add-donation" element={<AddDonationPage />} />
                    <Route path="incoming-requests" element={<IncomingRequestsPage />} />
                    <Route path="pickup-management" element={<DonorPickupManagementPage />} />
                    <Route path="analytics" element={<DonorAnalyticsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/donor/overview" replace />} />
                  </Routes>
                </DashboardLayout>
              }
            />
          </Route>

          {/* Protected NGO Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ngo', 'admin']} />}>
            <Route
              path="/ngo/*"
              element={
                <DashboardLayout navItems={ngoNavItems}>
                  <Routes>
                    <Route path="overview" element={<NGOOverviewPage />} />
                    <Route path="my-requests" element={<NGOMyRequestsPage />} />
                    <Route path="pickup-tracking" element={<NGOPickupTrackingPage />} />
                    <Route path="impact" element={<NGOImpactPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/ngo/overview" replace />} />
                  </Routes>
                </DashboardLayout>
              }
            />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route
              path="/admin/*"
              element={
                <DashboardLayout navItems={adminNavItems}>
                  <Routes>
                    <Route path="overview" element={<AdminDashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/admin/overview" replace />} />
                  </Routes>
                </DashboardLayout>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
