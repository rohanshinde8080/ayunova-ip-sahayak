import React from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { ReindexStep } from '../../types';

interface AdminReindexTabProps {
  isReindexing: boolean;
  reindexSteps: ReindexStep[];
  onReindex: () => void;
}

export const AdminReindexTab: React.FC<AdminReindexTabProps> = ({
  isReindexing,
  reindexSteps,
  onReindex
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Live HNSW Vector Re-indexing Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Recalculate 768-dimensional legal embeddings across all statutes, prior art, and classifications, and rebuild HNSW cosine similarity indexes.
          </p>
        </div>
        <button
          onClick={onReindex}
          disabled={isReindexing}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 ${isReindexing ? 'animate-spin' : ''}`} />
          <span>{isReindexing ? 'Executing Re-indexing...' : 'Trigger Full Re-index'}</span>
        </button>
      </div>

      {/* Stepper Display */}
      {reindexSteps.length > 0 ? (
        <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-heading font-bold text-sm text-white">
                Knowledge Base Embedding Pipeline
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              {reindexSteps.length}/4 Steps Executed
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {reindexSteps.map(st => (
              <div key={st.step} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5 animate-slide-up">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-slate-200">{st.label}</div>
                  {st.detail && (
                    <div className="text-[10px] text-slate-400">
                      {st.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 border border-slate-200 bg-slate-50/70 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Corpus Index Synchronized
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              All statutory documents, Gazette amendments, and classical formulations are currently indexed with 768-dimensional embeddings in PostgreSQL with pgvector.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
