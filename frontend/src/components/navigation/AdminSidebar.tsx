import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Database,
  PlusCircle,
  Share2,
  RefreshCw,
  Activity,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: 'corpus' | 'ingest' | 'graph' | 'reindex' | 'audit' | 'reviews') => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab = 'corpus', onSelectTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (tabKey: 'corpus' | 'ingest' | 'graph' | 'reindex' | 'audit' | 'reviews') => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    } else {
      navigate(`/admin?tab=${tabKey}`);
    }
  };

  const navItems = [
    { key: 'corpus', label: 'Master Statutory Corpus', icon: Database, badge: 'pgvector' },
    { key: 'ingest', label: 'Multi-Modal Ingest Studio', icon: PlusCircle, badge: 'Pipeline' },
    { key: 'graph', label: 'Neo4j Knowledge Graph', icon: Share2, badge: 'Cypher' },
    { key: 'reindex', label: 'HNSW Re-Indexing Hub', icon: RefreshCw, badge: 'Embed' },
    { key: 'audit', label: 'Governance & Audit Trail', icon: Activity, badge: 'Ledger' },
    { key: 'reviews', label: 'Facilitator Review Queue', icon: UserCheck, badge: 'Review' }
  ];

  return (
    <aside className="w-72 bg-white/95 backdrop-blur-xl text-slate-800 border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 shrink-0 select-none shadow-sm relative">
      {/* Botanical Watermark Background at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none opacity-25 bg-no-repeat bg-bottom bg-contain z-0"
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
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 font-mono">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Ayurveda IP &amp; Regulatory Command</p>
          </div>
        </div>
      </div>

      {/* Quick Portal Switcher Banner */}
      <div className="p-3 mx-3 my-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs relative z-10">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ROOT PRIVILEGES
          </span>
          <span className="text-slate-400 font-semibold">v2026.1</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 font-bold text-xs rounded-xl border border-emerald-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98]"
        >
          <span>Return to User Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700" />
        </button>
      </div>

      {/* Admin Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1 relative z-10">
        <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
          <span>System Management Modules</span>
          <span className="text-slate-400">^</span>
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isCurrent = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleTabClick(item.key as any)}
              className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:translate-x-0.5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${isCurrent ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold transition-all ${
                    isCurrent
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
