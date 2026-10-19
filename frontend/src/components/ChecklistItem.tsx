import React from 'react';
import { ComplianceItem } from '../types';
import { CheckCircle2, Circle, Shield, BookOpen } from 'lucide-react';

interface ChecklistItemProps {
  item: ComplianceItem;
  onToggle: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle }) => {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
        item.completed
          ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      <button
        type="button"
        className="mt-0.5 shrink-0 text-emerald-600 focus:outline-none"
      >
        {item.completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
        )}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4
            className={`text-xs sm:text-sm font-semibold ${
              item.completed ? 'text-slate-900 line-through/20' : 'text-slate-900'
            }`}
          >
            {item.title}
          </h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
              {item.category}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {item.requiredFor}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 font-medium pt-1">
          <BookOpen className="w-3 h-3 text-emerald-600" />
          <span>Statutory Ref: {item.statutoryRef}</span>
        </div>
      </div>
    </div>
  );
};
