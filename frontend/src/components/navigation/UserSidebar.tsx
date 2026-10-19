import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FlaskConical,
  ShieldCheck,
  Leaf,
  Globe2,
  CheckSquare,
  FileText,
  History,
  BookOpen,
  Search,
  X,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserSidebar: React.FC = () => {
  const { setActiveDemoQuery, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { to: '/assistant', label: t('nav.assistant', 'AI Assistant'), icon: Bot, badge: 'RAG' },
    { to: '/research', label: t('nav.research', 'Research Intelligence'), icon: BookOpen, badge: 'PubMed+' },
    { to: '/classification', label: t('nav.classification', 'Product Classification'), icon: FlaskConical },
    { to: '/ip-advisor', label: t('nav.ipAdvisor', 'IP Protection Advisor'), icon: ShieldCheck },
    { to: '/traditional-knowledge', label: t('nav.tk', 'Traditional Knowledge & ABS'), icon: Leaf },
    { to: '/comparison', label: t('nav.comparison', 'India vs International'), icon: Globe2 },
    { to: '/compliance', label: t('nav.compliance', 'Compliance Checklist'), icon: CheckSquare },
    { to: '/document-analyzer', label: t('nav.docAnalyzer', 'Document Analyzer'), icon: FileText },
    { to: '/history', label: t('nav.history', 'Query History'), icon: History }
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveDemoQuery(searchQuery.trim());
    navigate('/assistant');
  };

  const filteredItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <aside className="w-72 bg-white/85 backdrop-blur-xl border-r border-emerald-950/10 flex flex-col h-screen sticky top-0 z-30 shrink-0 select-none shadow-[4px_0_24px_-4px_rgba(16,185,129,0.06)]">
      {/* Botanical Watermark Background at bottom */}
      <div 
        className="absolute bottom-16 left-0 right-0 h-44 pointer-events-none opacity-25 bg-no-repeat bg-bottom bg-contain z-0"
        style={{ backgroundImage: `url('/sidebar_botanical_bg.jpg')` }}
      />

      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img
              src="/ip_shakti_logo.png"
              alt="IP SHAKTI SAHAYAK Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-heading font-black text-slate-900 text-base tracking-tight leading-tight">
                IP SHAKTI SAHAYAK
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{t('nav.copilotSubtitle', 'Ayurveda IP & Regulatory Copilot')}</p>
          </div>
        </div>
      </div>

      {/* Interactive Quick Filter & Command Search Bar */}
      <div className="px-3 pt-3.5 pb-2">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-emerald-600/70 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('nav.searchPlaceholder', 'Search modules or ask AI...')}
            className="w-full pl-8 pr-7 py-2.5 text-xs bg-white/90 hover:bg-white focus:bg-white border border-emerald-900/15 focus:border-emerald-600 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-3 focus:ring-emerald-500/15 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2.5 text-[10px] font-mono text-emerald-700/40 font-bold pointer-events-none">
              ↵
            </span>
          )}
        </form>

        {searchQuery.trim() && (
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 border border-emerald-300/80 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Bot className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">{t('nav.askAIQuery', 'Ask AI Copilot')}: "{searchQuery}"</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        )}
      </div>

      {/* Innovator Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
          <span>{t('nav.modulesHeader', 'Innovator Modules')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
        {filteredItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-700/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-emerald-950 hover:bg-emerald-50/70 hover:translate-x-0.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-700'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="px-3 py-4 text-center text-xs text-slate-400">
            No matching modules found
          </div>
        )}
      </nav>

      {/* Regulatory Switcher Teaser Footer */}
      <div className="p-3.5 border-t border-emerald-950/10 bg-gradient-to-t from-emerald-50/40 via-white/60 to-transparent">
        <button
          onClick={() => navigate('/admin')}
          className="w-full p-3 rounded-2xl border border-emerald-600/20 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:border-emerald-500/50 hover:from-white hover:via-emerald-50/60 hover:to-teal-50/50 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer shadow-xs hover:shadow-md hover:shadow-emerald-500/10"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                {t('nav.adminConsole', 'Admin Console')}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {t('nav.adminSub', 'Corpus, Ingest & Neo4j')}
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </aside>
  );
};
