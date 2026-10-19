import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FlaskConical,
  ShieldCheck,
  Leaf,
  Globe2,
  CheckSquare,
  FileText,
  BookOpen,
  Send,
  HelpCircle,
  TrendingUp,
  History,
  ShieldAlert,
  Zap,
  Users,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { DEMO_RECENT_QUERIES } from '../data/demoData';
import { Disclaimer } from '../components/Disclaimer';

export const DashboardPage: React.FC = () => {
  const { user, setActiveDemoQuery, t } = useApp();
  const [queryInput, setQueryInput] = useState('');
  const navigate = useNavigate();

  const handleAskAI = (text?: string) => {
    const q = text || queryInput || 'I have developed a Triphala-based Ayurvedic formulation. Can I protect it through IP and what regulatory requirements should I check?';
    setActiveDemoQuery(q);
    navigate('/assistant');
  };


  interface QuickAction {
    title: string;
    desc: string;
    icon: typeof FlaskConical;
    to: string;
    color: 'emerald' | 'blue' | 'amber' | 'purple';
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Research Intelligence',
      desc: 'PubMed, Europe PMC & clinical data',
      icon: BookOpen,
      to: '/research',
      color: 'emerald'
    },
    {
      title: 'Formulation IP Advisor',
      desc: 'Protect Ayurvedic formulations',
      icon: FlaskConical,
      to: '/ip-advisor',
      color: 'emerald'
    },
    {
      title: 'Regulatory Compliance',
      desc: 'Guidance under D&C, FSSAI',
      icon: FileText,
      to: '/compliance',
      color: 'blue'
    },
    {
      title: 'TKDL & Prior Art Search',
      desc: 'Check traditional knowledge',
      icon: Leaf,
      to: '/traditional-knowledge',
      color: 'amber'
    },
    {
      title: 'Global IP Strategy',
      desc: 'PCT, Madrid, Hague support',
      icon: Globe2,
      to: '/comparison',
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Intro Header with Himalayan Heritage Illustration */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        {/* Himalayan Mountains & Ancient Temple Background */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-right bg-contain pointer-events-none opacity-90 hidden sm:block"
          style={{ backgroundImage: `url('/himalaya_header_bg.jpg')` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2">
              {t('dashboard.welcomeBack', 'Welcome back')}, {user?.name?.split(' ')[0] || 'Ayush'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-medium">
              {t('dashboard.subtitle', 'Get source-cited preliminary guidance for your Ayurveda innovation.')}
            </p>
          </div>
        </div>
      </div>

      {/* Hero Card: ASK IP-SAKTI with Authentic Mortar & Pestle Background */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/25 relative overflow-hidden bg-cover bg-no-repeat bg-right"
        style={{ 
          backgroundColor: '#0c2419',
          backgroundImage: `linear-gradient(to right, #0c2419 0%, #0c2419 48%, rgba(12,36,25,0.88) 64%, rgba(12,36,25,0.3) 100%), url('/hero_ayurveda_bg.jpg')`
        }}
      >
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-xs font-mono">
              {t('dashboard.copilotBadge', 'COPILOT INTERFACE')}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {t('dashboard.groundedIn', 'Grounded in Patents Act 1970, DCA 1940 & BDA 2023')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-7 bg-amber-400 rounded-full" />
            <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
              Ask <span className="text-emerald-400">IP-SAKTI</span> Legal &amp; Regulatory Assistant
            </h2>
          </div>

          {/* Crisp White Input Box with Rounded Corners */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 text-slate-800 shadow-xl border border-white/20">
            <textarea
              rows={2}
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              placeholder={t('dashboard.placeholder', "Describe your Ayurvedic formulation, product or IP question (e.g. 'Can I patent a synergistic Triphala extract for metabolic wellness in India and USA?')...")}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none p-1 resize-none"
            />
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 px-1 mt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('dashboard.supportsLanguages', 'Supports English, हिन्दी, मराठी, संस्कृतम् and 8+ Indian Languages')}</span>
              </div>
              <button
                onClick={() => handleAskAI()}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>{t('dashboard.askAI', 'Ask AI')}</span>
              </button>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-300 font-semibold">{t('dashboard.tryJudgePrompts', 'Try Judge Prompts:')}</span>
            <button
              onClick={() => handleAskAI('I have developed a Triphala-based Ayurvedic formulation. Can I protect it through IP and what regulatory requirements should I check?')}
              className="text-[11px] px-3.5 py-1.5 rounded-full bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/50 transition-all text-left cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>{t('dashboard.promptTriphala', 'Triphala Formulation Patent & Regulatory')}</span>
            </button>
            <button
              onClick={() => handleAskAI('What IP protection may be relevant for an Ayurvedic brand launching globally across US and EU markets?')}
              className="text-[11px] px-3.5 py-1.5 rounded-full bg-emerald-950/70 hover:bg-emerald-900 text-amber-200 border border-amber-600/50 transition-all text-left cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>🏷️</span>
              <span>{t('dashboard.promptBrand', 'Brand Exclusivity & Export')}</span>
            </button>
            <button
              onClick={() => handleAskAI('I have developed a synthetic peptide mixed with unknown rainforest extract. Can I patent it? (Low confidence demo)')}
              className="text-[11px] px-3.5 py-1.5 rounded-full bg-emerald-950/70 hover:bg-red-950 text-amber-200 border border-amber-600/50 transition-all text-left cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>⚠️</span>
              <span>Low-Confidence Escalation Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <StatCard
          title="Statutory Knowledge"
          value="6 Acts"
          subtitle="Patents, BDA, DCA, WIPO"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="RAG Grounding"
          value="98.4%"
          subtitle="Zero hallucination policy"
          icon={ShieldCheck}
          color="blue"
        />
        <StatCard
          title="Verification Latency"
          value="1.2s"
          subtitle="Instant judge responsiveness"
          icon={Zap}
          color="amber"
        />
        <StatCard
          title="Smart Escalation"
          value="Active"
          subtitle="Human facilitator routing"
          icon={Users}
          color="emerald"
        />
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-900">
            {t('dashboard.quickActionsTitle', 'Quick Actions & Specialized Advisors')}
          </h3>
          <span className="text-xs text-slate-500">PS SIH26045 Compliance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                onClick={() => navigate(action.to)}
                className="bg-white border border-slate-200/90 hover:border-emerald-500/50 p-4.5 rounded-2xl cursor-pointer flex items-center justify-between gap-3 group transition-all shadow-xs hover:shadow-md hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    action.color === 'blue' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white' 
                      : action.color === 'amber'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-600 group-hover:text-white'
                      : action.color === 'purple'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white'
                  } transition-colors`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-950 truncate">
                      {action.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Queries Feed */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Recent Grounded Inquiries
            </h3>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            View All History →
          </button>
        </div>

        <div className="space-y-2.5">
          {DEMO_RECENT_QUERIES.map(q => (
            <div
              key={q.id}
              onClick={() => handleAskAI(q.query)}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-0.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 line-clamp-1">
                    {q.query}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>{q.date}</span>
                  <span>•</span>
                  <span>Jurisdiction: {q.jurisdiction}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">{q.category}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 group-hover:underline shrink-0">
                Re-run Query →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Disclaimer Box */}
      <Disclaimer />
    </div>
  );
};
