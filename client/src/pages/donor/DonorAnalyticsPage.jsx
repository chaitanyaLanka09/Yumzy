import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Award, TrendingUp, Heart, Leaf } from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#16845B', '#FF8A45', '#105C42', '#3B82F6', '#8B5CF6', '#F59E0B'];

export const DonorAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/donor');
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
          Redistribution Impact Analytics
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Measurable sustainability metrics calculated strictly from completed food donation pickups.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16845B]/10 flex items-center justify-center text-[#16845B] shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Meals Redistributed
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
              {data?.stats?.estimatedMealsRedistributed || 0}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Strictly verified handovers
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF8A45]/10 flex items-center justify-center text-[#FF8A45] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Edible Food Rescued
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
              {data?.stats?.estimatedFoodWeightKg || 0} kg
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Based on standard 0.4 kg/meal
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              CO₂ Emissions Prevented
            </span>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-700">
              {data?.stats?.co2SavedKg || 0} kg
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              2.5 kg CO₂ saved / kg food rescued
            </span>
          </div>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="font-heading font-extrabold text-base text-gray-900">
          Redistributed Food Categories Breakdown
        </h3>
        <p className="text-xs text-gray-500">
          Volume of meals delivered across different culinary categories.
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
                <Bar dataKey="value" fill="#16845B" radius={[8, 8, 0, 0]} name="Meals Donated" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-400">
            No completed donations yet to display category charts. Complete a pickup to view visual impact.
          </div>
        )}
      </div>
    </div>
  );
};
