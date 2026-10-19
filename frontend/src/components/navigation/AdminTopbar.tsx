import React, { useState } from 'react';
import {
  Server,
  Shield,
  ShieldAlert,
  ArrowUpRight,
  Database,
  Share2,
  Globe2,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const AdminTopbar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs text-slate-800">
      {/* Left: Jurisdiction Selector */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs">
        <span className="text-sm">🇮🇳</span>
        <span>India (Patents Act, BDA)</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {/* Right: 1-Click Return to User Portal & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* 1-CLICK RETURN TO USER PORTAL BUTTON */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold rounded-xl text-xs border border-emerald-300/80 transition-all shadow-2xs active:scale-[0.98] cursor-pointer group"
          title="Return to Innovator User Portal"
        >
          <span>Return to User Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
          <Globe2 className="w-3.5 h-3.5 text-slate-500" />
          <span>English</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || 'Ayush Innovator (Admin)'}
              </div>
              <div className="text-[10px] text-emerald-700 leading-tight font-medium">
                Administrator
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-[#0a1024]/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-slide-up text-slate-200">
              <div className="px-4 py-2.5 border-b border-slate-800/80">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{user?.email}</p>
                <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                  IPR Regulatory Officer
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/assistant');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Innovator Portal View</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
