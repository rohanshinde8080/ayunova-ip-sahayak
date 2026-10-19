import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ConfidenceMetrics } from '../types';
import { useApp } from '../context/AppContext';

interface ConfidenceBadgeProps {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'High' | 'Medium' | 'Low' | string;
  evidenceCount?: number;
  confidenceMetrics?: ConfidenceMetrics;
  showDetails?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  evidenceCount,
  confidenceMetrics,
  showDetails = false
}) => {
  const { t } = useApp();
  const norm = (confidence || 'MEDIUM').toUpperCase();
  const tooltipText =
    confidenceMetrics?.disclaimer ||
    'Confidence reflects evidence quality, not a legal guarantee.';

  if (norm === 'HIGH') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
        title={tooltipText}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span>{t('assistant.highConfidence', 'High Confidence')}</span>
        {confidenceMetrics?.evidenceCoverage !== undefined ? (
          <span className="text-[10px] bg-emerald-200/90 text-emerald-950 px-1.5 py-0.2 rounded-full font-mono font-bold">
            {confidenceMetrics.evidenceCoverage}% Cov
          </span>
        ) : (
          evidenceCount !== undefined && (
            <span className="text-[10px] bg-emerald-200/80 text-emerald-950 px-1.5 rounded-full font-mono">
              {evidenceCount} {t('assistant.sources', 'Sources')}
            </span>
          )
        )}
        {showDetails && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-800 font-normal">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{t('assistant.verifiedGrounding', 'Verified Grounding')}</span>
          </span>
        )}
      </div>
    );
  }

  if (norm === 'MEDIUM') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
        title={tooltipText}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>{t('assistant.medConfidence', 'Medium Confidence')}</span>
        {confidenceMetrics?.evidenceCoverage !== undefined ? (
          <span className="text-[10px] bg-amber-200/90 text-amber-950 px-1.5 py-0.2 rounded-full font-mono font-bold">
            {confidenceMetrics.evidenceCoverage}% Cov
          </span>
        ) : (
          evidenceCount !== undefined && (
            <span className="text-[10px] bg-amber-200/80 text-amber-950 px-1.5 rounded-full font-mono">
              {evidenceCount} {t('assistant.sources', 'Sources')}
            </span>
          )
        )}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300 shadow-2xs"
      title={tooltipText}
    >
      <AlertCircle className="w-3.5 h-3.5 text-red-700 shrink-0" />
      <span>{t('assistant.lowConfidence', 'Low Confidence — Limited Authority')}</span>
      {confidenceMetrics?.evidenceCoverage !== undefined ? (
        <span className="text-[10px] bg-red-200/90 text-red-950 px-1.5 py-0.2 rounded-full font-mono font-bold">
          {confidenceMetrics.evidenceCoverage}% Cov
        </span>
      ) : (
        evidenceCount !== undefined && (
          <span className="text-[10px] bg-red-200/80 text-red-950 px-1.5 rounded-full font-mono">
            {evidenceCount} {t('assistant.sources', 'Source')}
          </span>
        )
      )}
    </div>
  );
};
