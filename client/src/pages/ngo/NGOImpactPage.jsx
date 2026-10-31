import React, { useEffect, useState } from 'react';
import {
  Heart,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

export const NGOImpactPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/ngo');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="font-heading font-extrabold text-2xl text-gray-900">
          NGO Community Nutrition Impact
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Visual reporting on surplus food collected and estimated people served in your beneficiary communities.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16845B]/10 flex items-center justify-center text-[#16845B] shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Meals Collected
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
              {data?.stats?.mealsCollected || 0}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Verified dual-confirmed pickups
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Estimated People Served
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-blue-700">
              ~{data?.stats?.estimatedPeopleServed || 0}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Shelters & community kitchens
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF8A45]/10 flex items-center justify-center text-[#FF8A45] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Food Weight Handled
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
              {data?.stats?.estimatedFoodWeightKg || 0} kg
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Redistributed edible nutrition
            </span>
          </div>
        </div>
      </div>

      {/* Category Chart */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="font-heading font-extrabold text-base text-gray-900">
          Beneficiary Distribution by Category
        </h3>
        <p className="text-xs text-gray-500">
          Types of surplus food collected and served.
        </p>

        {data?.categoryDistribution?.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryDistribution}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#16845B" radius={[8, 8, 0, 0]} name="Meals Received" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-400">
            No completed collections yet. Completed food pickups will appear here in visual analytics.
          </div>
        )}
      </div>
    </div>
  );
};
