import React, { useState } from 'react';
import {
  Globe,
  ChevronDown,
  CheckCircle2,
  Shield,
  LogOut,
  Info,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Jurisdiction, Language } from '../../types';
import { LANGUAGES } from '../../i18n/languages';

const JURISDICTIONS: { code: Jurisdiction; label: string; flag: string }[] = [
  { code: 'India', label: 'India (Patents Act, BDA)', flag: '🇮🇳' },
  { code: 'USA', label: 'USA (FDA / USPTO)', flag: '🇺🇸' },
  { code: 'EU', label: 'EU (EMA / THMPD)', flag: '🇪🇺' },
  { code: 'Japan', label: 'Japan (PMDA / Kampo)', flag: '🇯🇵' },
  { code: 'International', label: 'Global (WIPO GRATK 2024)', flag: '🌐' }
];

export const UserTopbar: React.FC = () => {
  const {
    user,
    logout,
    language,
    setLanguage,
    t,
    jurisdiction,
    setJurisdiction,
    isDemoMode,
    setIsDemoMode,
    notification,
    showNotification
  } = useApp();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isJurisOpen, setIsJurisOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentJuris = JURISDICTIONS.find(j => j.code === jurisdiction) || JURISDICTIONS[0];
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-emerald-950/10 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Jurisdiction Selector & Live Pipeline Pill */}
      <div className="flex items-center gap-3">
        {/* Jurisdiction Selector */}
        <div className="relative">
          <button
            onClick={() => setIsJurisOpen(!isJurisOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-emerald-950/10 bg-white/90 hover:bg-emerald-50/50 hover:border-emerald-500/30 text-xs font-semibold text-slate-800 transition-all shadow-2xs cursor-pointer"
          >
            <span>{currentJuris.flag}</span>
            <span>{currentJuris.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isJurisOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white/95 backdrop-blur-xl border border-emerald-900/15 rounded-2xl shadow-xl py-1.5 z-50 animate-slide-up">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {t('topbar.jurisdictionFilter')}
              </div>
              {JURISDICTIONS.map(j => (
                <button
                  key={j.code}
                  onClick={() => {
                    setJurisdiction(j.code);
                    setIsJurisOpen(false);
                    showNotification(`Jurisdiction switched to ${j.label}`);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50/70 transition-colors cursor-pointer ${
                    jurisdiction === j.code ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{j.flag}</span>
                    <span>{j.label}</span>
                  </div>
                  {jurisdiction === j.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: 1-Click Portal Switcher, Language, and Profile */}
      <div className="flex items-center gap-3">
        {/* 1-CLICK PROMINENT SWITCH TO ADMIN CONSOLE BUTTON */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0e2a1e] hover:bg-[#133828] text-white rounded-xl text-xs font-bold transition-all shadow-sm border border-emerald-500/35 hover:border-emerald-400 cursor-pointer group active:scale-[0.98]"
          title="Switch to Regulatory Admin Console"
        >
          <Settings className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
          <span>{t('topbar.switchAdmin')}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" />
        </button>

        {/* Language Selector (Bhashini 12 Languages) */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-950/10 bg-white/90 hover:bg-emerald-50/50 hover:border-emerald-500/30 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{currentLang.native}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-slide-up max-h-80 overflow-y-auto scrollbar-thin">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono sticky top-0 bg-white/95 backdrop-blur-xs border-b border-slate-100 flex items-center justify-between">
                <span>{t('topbar.bhashiniLanguage')}</span>
                <span className="text-[9px] text-emerald-700 font-semibold font-sans">{LANGUAGES.length} Languages</span>
              </div>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setIsLangOpen(false);
                    showNotification(`${l.native} (${l.label}) - ${t('common.langSwitched')}`);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                    language === l.code ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{l.flag}</span>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{l.native}</div>
                      <div className="text-[10px] text-slate-400">{l.label}</div>
                    </div>
                  </div>
                  {language === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Toast trigger */}
        {notification && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 text-white text-xs shadow-sm animate-fade-in">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-emerald-950/10 hover:border-emerald-500/30 bg-white/90 hover:bg-emerald-50/40 transition-all shadow-2xs cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Ayush Innovator (Demo)'}</div>
              <div className="text-[10px] text-emerald-700/80 font-medium leading-tight">{user?.role || 'Innovator'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white/95 backdrop-blur-xl border border-emerald-900/15 rounded-2xl shadow-xl py-1.5 z-50 animate-slide-up">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
                <div className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {user?.organization}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Knowledge Base</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign Out / Switch Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
