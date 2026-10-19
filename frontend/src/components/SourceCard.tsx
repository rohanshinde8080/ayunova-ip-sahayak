import React from 'react';
import { SourceCitation } from '../types';
import { ShieldCheck, BookOpen, ExternalLink, ChevronRight, FileText, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SourceCardProps {
  source: SourceCitation;
  compact?: boolean;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, compact }) => {
  const { setSelectedSource } = useApp();

  // Detect patent publication number if explicitly present or extracted from section/id
  const pubNumber =
    source.publicationNumber ||
    (source.section?.match(/^[A-Z]{2}\d{6,10}(?:[A-Z]\d?)?$/) ? source.section : undefined);
  const isPatent = Boolean(
    pubNumber ||
    source.authority?.toLowerCase().includes('patent') ||
    source.section?.toLowerCase().includes('patent') ||
    source.title?.toLowerCase().includes('patent')
  );

  const isFamilyMember = source.isFamilyMember || Boolean(source.patentFamily);
  const legalStatus = source.legalStatus || (isPatent ? 'Current legal status not verified' : undefined);

  if (compact) {
    return (
      <button
        onClick={() => setSelectedSource(source)}
        className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-start justify-between group"
      >
        <div className="space-y-0.5 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {pubNumber ? (
              <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {pubNumber}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 truncate">
                {source.section}
              </span>
            )}
            {isFamilyMember && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-purple-100 text-purple-900 border border-purple-200 shrink-0 flex items-center gap-0.5">
                <Layers className="w-2.5 h-2.5 text-purple-700" />
                <span>Same patent family</span>
              </span>
            )}
            {(source.id.startsWith('web-') || source.authority.includes('Tavily') || source.authority.includes('Google Patents') || source.authority.includes('USPTO')) && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                🌐 Live Web
              </span>
            )}
            {source.matchPercentage ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                {source.matchPercentage}
              </span>
            ) : source.verified !== false ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-100 text-emerald-800 shrink-0">
                Verified ✓
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-100 text-amber-800 shrink-0">
                Not Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate">{source.authority}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1" />
      </button>
    );
  }

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-emerald-400 transition-all">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {isPatent ? (
            <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
          )}
          <h4 className="text-xs font-bold text-slate-900 truncate">{source.title}</h4>
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
          {isFamilyMember && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-50 border border-purple-200 text-purple-800 flex items-center gap-1">
              <Layers className="w-2.5 h-2.5 text-purple-600" />
              <span>Same patent family</span>
            </span>
          )}
          {(source.id.startsWith('web-') || source.authority.includes('Tavily') || source.authority.includes('Google Patents') || source.authority.includes('USPTO')) && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-50 border border-blue-300 text-blue-700">
              🌐 Live Web
            </span>
          )}
          {source.matchPercentage && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 border border-emerald-300 text-emerald-700">
              {source.matchPercentage}
            </span>
          )}
          {source.verified !== false ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
              Verified ✓
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
              Not Verified
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[11px] mb-1">
        <span className="font-mono text-emerald-800 font-medium">
          {pubNumber || source.section}
        </span>
        {legalStatus && (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Status: {legalStatus}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 mb-1.5 leading-relaxed">
        {source.summary}
      </p>

      {source.gazetteExcerpt && (
        <div className="mb-2 p-2 bg-emerald-50/50 border-l-2 border-emerald-500 rounded-r-lg text-[11px] text-slate-700 italic line-clamp-2 leading-relaxed">
          &ldquo;{source.gazetteExcerpt}&rdquo;
        </div>
      )}

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{source.authority}</span>
        <button
          onClick={() => setSelectedSource(source)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 shrink-0"
        >
          <span>{source.id.startsWith('web-') ? 'View Live Record' : isPatent ? 'View Patent' : 'View Gazette'}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

