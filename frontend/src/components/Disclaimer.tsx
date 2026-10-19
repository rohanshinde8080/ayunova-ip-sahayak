import React from 'react';
import { ShieldCheck, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Disclaimer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { t } = useApp();

  if (compact) {
    return (
      <div className="py-2 px-4 bg-slate-100/90 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{t('common.disclaimer', 'Preliminary AI-assisted guidance. Not final legal advice. Consult an Ayush patent attorney before filing.')}</span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-emerald-950">Statutory Grounding &amp; AI Safety Notice: </span>
        {t('common.disclaimer', 'Outputs are generated using source-grounded RAG cross-referenced against the Patents Act 1970 (Section 3(p)/3(e)), Biological Diversity Act (2002/2023), and Drugs & Cosmetics Rules 1945. This system does not guarantee patent grants or regulatory approval and serves as a preliminary evaluation tool.')}
      </div>
    </div>
  );
};
