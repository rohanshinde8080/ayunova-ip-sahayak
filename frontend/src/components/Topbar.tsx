import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Bell,
  User,
  LogOut,
  Shield,
  CheckCircle2,
  ChevronDown,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Jurisdiction, Language } from '../types';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES } from '../i18n/languages';

const JURISDICTIONS: { code: Jurisdiction; label: string; flag: string }[] = [
  { code: 'India', label: 'India (Patents Act, BDA)', flag: '🇮🇳' },
  { code: 'USA', label: 'USA (FDA / USPTO)', flag: '🇺🇸' },
  { code: 'EU', label: 'EU (EMA / THMPD)', flag: '🇪🇺' },
  { code: 'Japan', label: 'Japan (PMDA / Kampo)', flag: '🇯🇵' },
  { code: 'International', label: 'Global (WIPO GRATK 2024)', flag: '🌐' }
];

export const Topbar: React.FC = () => {
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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm/50">
      {/* Left: Context / Jurisdiction Badge */}
      <div className="flex items-center gap-3">
        {/* Jurisdiction Selector */}
        <div className="relative">
          <button
            onClick={() => setIsJurisOpen(!isJurisOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
          >
            <span>{currentJuris.flag}</span>
            <span>{currentJuris.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isJurisOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    jurisdiction === j.code ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
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

      {/* Right: Controls & User Menu */}
      <div className="flex items-center gap-3">
        {/* Language Selector (Bhashini 12 Languages) */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{currentLang.native}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 max-h-80 overflow-y-auto scrollbar-thin">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 bg-white/95 backdrop-blur-xs border-b border-slate-100 flex items-center justify-between">
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
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    language === l.code ? 'bg-emerald-50 text-emerald-900 font-semibold border-l-2 border-emerald-600' : 'text-slate-700'
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
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Demo User'}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{user?.role || 'Innovator'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
                <div className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {user?.organization}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admin Knowledge Base</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
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
