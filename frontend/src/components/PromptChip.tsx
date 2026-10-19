import React from 'react';
import { Sparkles } from 'lucide-react';

interface PromptChipProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const PromptChip: React.FC<PromptChipProps> = ({ label, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 shadow-sm transition-all text-left"
    >
      {icon || <Sparkles className="w-3 h-3 text-emerald-600" />}
      <span>{label}</span>
    </button>
  );
};
