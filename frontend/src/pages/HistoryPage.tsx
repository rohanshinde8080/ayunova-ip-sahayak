import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Bot,
  ArrowRight,
  Trash2,
  Calendar,
  Globe2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { historyService, HistoryEntry } from '../services/historyService';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { useApp } from '../context/AppContext';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { setActiveDemoQuery, showNotification } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await historyService.getHistory();
      setHistory(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    await historyService.clearHistory();
    setHistory([]);
    showNotification('Inquiry history cleared');
  };

  const handleOpenQuery = (queryText: string) => {
    setActiveDemoQuery(queryText);
    navigate('/assistant');
  };

  const filtered = history.filter(h =>
    h.query.toLowerCase().includes(search.toLowerCase()) ||
    h.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
              Audit Trail &amp; DPDP Log
            </span>
            <span className="text-xs text-slate-500">Encrypted Local Session Storage</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-1">
            Inquiry History &amp; Saved Dossiers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review previous source-grounded inquiries, confidence assessments, and load past evaluations back into the AI Assistant.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search prior inquiries by formulation, herb name, or statutory topic..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filtered.map(entry => (
          <div
            key={entry.id}
            className="gov-card p-5 space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {entry.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {entry.date}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Globe2 className="w-3 h-3" /> {entry.jurisdiction}
                </span>
              </div>

              <h4 className="font-heading font-semibold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors">
                "{entry.query}"
              </h4>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <ConfidenceBadge confidence={entry.confidence} />
              <button
                onClick={() => handleOpenQuery(entry.query)}
                className="px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <span>Re-open in Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">No prior inquiries match your search filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
