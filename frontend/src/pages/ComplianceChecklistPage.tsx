import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  Download,
  RotateCcw,
  Sparkles,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ComplianceItem } from '../types';
import { complianceService } from '../services/complianceService';
import { ChecklistItem } from '../components/ChecklistItem';
import { useApp } from '../context/AppContext';

export const ComplianceChecklistPage: React.FC = () => {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showNotification } = useApp();

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    setIsLoading(true);
    try {
      const data = await complianceService.getChecklist();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    await complianceService.saveChecklist(updated);
  };

  const handleReset = async () => {
    const reset = await complianceService.resetChecklist();
    setItems(reset);
    showNotification('Checklist reset to baseline');
  };

  const handleExport = () => {
    showNotification('Exported Compliance Readiness Dossier');
  };

  // Calculations
  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = ['All', 'Documentation', 'IP & Prior Art', 'Traditional Knowledge & ABS', 'Regulatory & Licensing', 'Labeling & Quality'];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              Interactive Compliance Tracker
            </span>
            <span className="text-xs text-slate-500">Schedule T GMP &amp; Rule 158B Audits</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-1">
            Ayurveda IPR &amp; Regulatory Compliance Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track statutory documentation, prior art clearance, biodiversity permissions, and laboratory testing protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* Progress Hero Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Overall Filing Readiness
            </span>
            <h3 className="font-heading font-bold text-xl text-white">
              {percentage >= 80 ? 'High Commercial Readiness' : percentage >= 50 ? 'Moderate Progress — Critical Milestones Pending' : 'Preliminary Phase — Key Documentation Required'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-2xl font-bold text-emerald-400">{percentage}%</span>
              <span className="text-xs text-slate-400 block">{completedCount} of {totalCount} Completed</span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Schedule T GMP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>TKDL Clearance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>NBA Form III Check</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Heavy Metals CoA</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200">
        <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeCategory === cat
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist Items Feed */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 flex items-start gap-2 border border-slate-200">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Compliance checklist progress is saved locally in your browser workspace. Completing items provides preliminary readiness scoring and does not replace statutory license inspections by the State Ayush Department.
        </span>
      </div>
    </div>
  );
};
