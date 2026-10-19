import React from 'react';
import { X, BookOpen, ShieldCheck, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SourceDrawerModal: React.FC = () => {
  const { selectedSource, setSelectedSource } = useApp();

  if (!selectedSource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  {selectedSource.id.startsWith('web-') || selectedSource.authority.includes('Tavily') || selectedSource.authority.includes('Google Patents')
                    ? 'Live Web Prior Art Gazette'
                    : 'Official Gazette Citation'}
                </span>
                {(selectedSource.id.startsWith('web-') || selectedSource.authority.includes('Tavily') || selectedSource.authority.includes('Google Patents') || selectedSource.authority.includes('USPTO')) && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-semibold flex items-center gap-1">
                    🌐 Tavily Grounded
                  </span>
                )}
              </div>
              <h3 className="font-heading font-bold text-sm text-white line-clamp-1">
                {selectedSource.title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setSelectedSource(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Statutory Authority</span>
              <span className="font-semibold text-slate-800">{selectedSource.authority}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Section / Rule</span>
              <span className="font-semibold text-emerald-800 font-mono">{selectedSource.section}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Jurisdiction</span>
              <span className="font-semibold text-slate-800">{selectedSource.jurisdiction}</span>
            </div>
          </div>

          {/* Official Act Title */}
          {selectedSource.officialAct && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-950 rounded-lg text-xs border border-emerald-200">
              <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-medium">Governing Act: <strong>{selectedSource.officialAct}</strong></span>
            </div>
          )}

          {/* Exact Gazette Excerpt */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Official Statutory Excerpt / Legal Provision
            </span>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed border border-slate-800 selection:bg-emerald-500 selection:text-slate-950">
              {selectedSource.gazetteExcerpt || selectedSource.summary}
            </div>
          </div>

          {/* Practical Regulatory Summary */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Application to Ayurvedic Innovations
            </span>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {selectedSource.summary}
            </p>
          </div>

          {/* Grounding and Verification Badge */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                {selectedSource.id.startsWith('web-')
                  ? 'Real-Time Prior Art Grounded via Tavily Search Engine'
                  : 'Source Verified & Grounded in IP SHAKTI SAHAYAK Knowledge Base'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">
              {selectedSource.matchPercentage || 'Status: Active'}
            </span>
          </div>

          {/* Live External Gazette / Patent Link */}
          {selectedSource.url && selectedSource.url.startsWith('http') ? (
            <a
              href={selectedSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 hover:from-emerald-500/20 hover:to-blue-500/20 text-slate-800 rounded-xl border border-emerald-500/30 transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                    Live Prior Art Gazette / Patent Record
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate block group-hover:text-emerald-700 transition-colors">
                    {selectedSource.url}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-white/90 border border-emerald-300 px-3 py-1.5 rounded-lg shrink-0 shadow-xs flex items-center gap-1.5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <span>View Full Record</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </a>
          ) : (
            <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{selectedSource.url || 'Official Statutory Record — Neon pgvector Grounded'}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => setSelectedSource(null)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
};
