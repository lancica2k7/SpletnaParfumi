import React from 'react';

const StatsCard = ({ title, value, icon, trend, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-800/50 p-6 shadow-lg">
        <div className="mb-3 h-4 w-20 rounded bg-slate-700"></div>
        <div className="h-8 w-32 rounded bg-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-slate-800 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
      <div className="absolute -right-4 -top-4 text-8xl opacity-10 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
