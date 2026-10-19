import React from 'react';
import {
  Zap,
  Brain,
  Trash2,
  BookOpen,
  Filter
} from 'lucide-react';
import { RAGTelemetry } from '../../types';
import { useApp } from '../../context/AppContext';

interface AssistantToolbarProps {
  useDeepAgent: boolean;
  onToggleDeepAgent: (val: boolean) => void;
  productTypeFilter: string;
  onChangeProductType: (val: string) => void;
  telemetry: RAGTelemetry | null;
  onClearHistory: () => void;
  evidenceCount: number;
  isEvidenceDrawerOpen: boolean;
  onToggleEvidenceDrawer: () => void;
}

export const AssistantToolbar: React.FC<AssistantToolbarProps> = ({
  useDeepAgent,
  onToggleDeepAgent,
  productTypeFilter,
  onChangeProductType,
  telemetry,
  onClearHistory,
  evidenceCount,
  isEvidenceDrawerOpen,
  onToggleEvidenceDrawer
}) => {
  const { t } = useApp();

  return (
    <div className="bg-white/90 backdrop-blur-md border border-emerald-950/10 rounded-2xl p-2.5 px-4 shadow-card-soft flex flex-wrap items-center justify-between gap-3 mb-3">
      {/* Left: Engine Mode Switcher & Filter */}
      <div className="flex items-center gap-2">
        <div className="flex bg-emerald-50/60 p-1 rounded-xl gap-1 border border-emerald-900/10">
          <button
            type="button"
            onClick={() => onToggleDeepAgent(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              !useDeepAgent
                ? 'bg-white text-emerald-950 shadow-xs font-bold border border-emerald-100'
                : 'text-slate-600 hover:text-emerald-950'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${!useDeepAgent ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{t('assistant.fastRag', 'Fast RAG')}</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleDeepAgent(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              useDeepAgent
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 hover:text-emerald-950'
            }`}
          >
            <Brain className={`w-3.5 h-3.5 ${useDeepAgent ? 'text-white' : 'text-emerald-700'}`} />
            <span>{t('assistant.deepAgent', 'DeepAgent Multi-Agent')}</span>
            <span className="text-[9px] bg-white/20 text-white font-mono px-1.5 py-0.2 rounded-full font-bold">Autonomous</span>
          </button>
        </div>

        {/* Formulation Filter */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-emerald-900/10 text-xs">
          <Filter className="w-3.5 h-3.5 text-emerald-600/70" />
          <select
            value={productTypeFilter}
            onChange={e => onChangeProductType(e.target.value)}
            className="text-xs bg-transparent border-0 font-semibold text-slate-700 focus:ring-0 focus:outline-hidden cursor-pointer"
          >
            <option value="Auto Detect">{t('assistant.autoDetect', 'Auto-Detect Domain')}</option>
            <option value="Classical Ayurveda">Classical (Rule 158B)</option>
            <option value="P&P Formulations">Patent &amp; Proprietary</option>
            <option value="Phytopharmaceutical">Phytopharmaceutical</option>
            <option value="Ayurveda-Aahar">Ayurveda-Aahar</option>
          </select>
        </div>
      </div>

      {/* Right: Evidence Drawer Trigger & Clear */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleEvidenceDrawer}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
            isEvidenceDrawerOpen
              ? 'bg-gradient-to-r from-emerald-900 to-teal-950 text-white border-emerald-800 shadow-md'
              : 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 border-emerald-300/80 shadow-2xs'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('assistant.groundedEvidence', 'Grounded Evidence')}</span>
          {evidenceCount > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              isEvidenceDrawerOpen ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-950'
            }`}>
              {evidenceCount}
            </span>
          )}
        </button>

        <button
          onClick={onClearHistory}
          title={t('assistant.clearHistory', 'Clear Conversation History')}
          className="p-1.5 rounded-xl border border-emerald-950/10 hover:border-red-300 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
