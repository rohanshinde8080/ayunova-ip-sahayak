import React from 'react';
import { Sparkles } from 'lucide-react';
import { ChatPreset } from '../../services/chatService';

interface PresetChipsProps {
  presets: ChatPreset[];
  onSelectPreset: (query: string) => void;
  disabled?: boolean;
}

const DEFAULT_CHIPS = [
  {
    label: 'Section 3(p) Patent Bar',
    query: 'Can my Ayurvedic formulation be patented under Section 3(p)?',
    category: 'Patent Bar',
    icon: '🌿'
  },
  {
    label: 'US Patent 11992510 (Proviva)',
    query: 'What are the key claims of US Patent 11992510 regarding Triphala with Bacillus coagulans and probiotics?',
    category: 'Global Patent',
    icon: '🇺🇸'
  },
  {
    label: 'Rule 158B & Schedule T',
    query: 'What regulatory requirements apply under Rule 158B for proprietary Ayurvedic medicines?',
    category: 'Compliance',
    icon: '📋'
  },
  {
    label: 'BDA 2023 Fair Benefit Sharing',
    query: 'What are the mandatory approvals needed under Biological Diversity Act 2023?',
    category: 'Biodiversity',
    icon: '⚖️'
  },
  {
    label: 'Brand Exclusivity (Class 5)',
    query: 'How do I secure brand protection and trademark exclusivity for classical Ayurvedic formulations?',
    category: 'Trademark',
    icon: '🏷️'
  },
  {
    label: 'Synergism Under Section 3(e)',
    query: 'How can polyherbal Ayurvedic synergy overcome Section 3(e) mere admixture rejection?',
    category: 'Synergy',
    icon: '🧪'
  }
];

export const PresetChips: React.FC<PresetChipsProps> = ({
  presets,
  onSelectPreset,
  disabled = false
}) => {
  const displayChips = presets && presets.length > 0
    ? presets.map(p => ({
        label: p.label,
        query: p.query,
        category: p.category,
        icon: p.category.toLowerCase().includes('patent') ? '📜' :
              p.category.toLowerCase().includes('regulatory') ? '📋' :
              p.category.toLowerCase().includes('trademark') ? '🏷️' : '🌿'
      }))
    : DEFAULT_CHIPS;

  return (
    <div className="w-full overflow-hidden py-1 mb-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Quick Inquiries:</span>
        </span>
        {displayChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset(chip.query)}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border border-slate-200/90 hover:border-emerald-300 transition-all duration-150 shadow-2xs hover:shadow-xs shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="text-xs">{chip.icon}</span>
            <span>{chip.label}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-800 font-medium">
              {chip.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
