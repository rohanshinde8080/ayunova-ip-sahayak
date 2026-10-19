import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assistant', label: 'AI Assistant', icon: Bot, badge: 'RAG' },
  { to: '/classification', label: 'Product Classification', icon: FlaskConical },
  { to: '/ip-advisor', label: 'IP Protection Advisor', icon: ShieldCheck },
  { to: '/traditional-knowledge', label: 'Traditional Knowledge & ABS', icon: Leaf },
  { to: '/comparison', label: 'India vs International', icon: Globe2 },
  { to: '/compliance', label: 'Compliance Checklist', icon: CheckSquare },
  { to: '/document-analyzer', label: 'Document Analyzer', icon: FileText },
  { to: '/history', label: 'Query History', icon: History },
  { to: '/admin', label: 'Admin & Knowledge Base', icon: ShieldAlert, adminOnly: false }
];

export const Sidebar: React.FC = () => {

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 shrink-0 select-none">
      {/* Brand Header with IP SHAKTI SAHAYAK Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 overflow-hidden shrink-0">
            <img
              src="/ip_shakti_logo.png"
              alt="IP SHAKTI SAHAYAK Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-heading font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                IP SHAKTI SAHAYAK
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                INNOVATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Ayurveda IP &amp; Regulatory Copilot</p>
          </div>
        </div>
      </div>


      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Modules
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-semibold border-l-4 border-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-700" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Gov / Ayush Badge Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-700">SIH 2026 | PS 26045</span>
          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">Ayush</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Ministry of Ayush &amp; All India Institute of Ayurveda (AIIA)
        </p>
      </div>
    </aside>
  );
};
