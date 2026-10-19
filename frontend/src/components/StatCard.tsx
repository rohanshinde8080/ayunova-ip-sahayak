import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'emerald' | 'amber' | 'blue' | 'slate';
  variant?: 'light' | 'dark';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'emerald',
  variant = 'light'
}) => {
  const lightColors = {
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs',
    blue: 'bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs',
    slate: 'bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
  };

  const darkColors = {
    emerald: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    amber: 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    blue: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    slate: 'bg-slate-800/80 text-slate-300 border border-slate-700'
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 group relative ${
        isDark
          ? 'admin-card hover:border-slate-700/90 hover:scale-[1.01]'
          : 'bg-white border border-slate-200/90 hover:border-emerald-500/40 shadow-xs hover:shadow-md hover:scale-[1.01]'
      }`}
    >
      <div className="space-y-1 min-w-0 flex-1">
        <span
          className={`block text-[10px] font-bold uppercase tracking-wider truncate ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {title}
        </span>
        <div
          className={`text-2xl font-heading font-black tracking-tight leading-tight transition-colors ${
            isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-950'
          }`}
        >
          {value}
        </div>
        {subtitle && (
          <p className={`text-[11px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
        {trend && (
          <span className={`inline-block text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {trend}
          </span>
        )}
      </div>

      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
          isDark ? darkColors[color] : lightColors[color]
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
