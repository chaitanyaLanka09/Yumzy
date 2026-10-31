import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF7]">
        <div className="w-10 h-10 border-4 border-[#16845B]/30 border-t-[#16845B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'donor') return <Navigate to="/donor/overview" replace />;
    if (user.role === 'ngo') return <Navigate to="/ngo/overview" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/overview" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
