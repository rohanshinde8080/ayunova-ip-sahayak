import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { AdminResearchStats } from '../../types/research';

interface AdminResearchTabProps {
  onNotify?: (message: string) => void;
}

export const AdminResearchTab: React.FC<AdminResearchTabProps> = ({ onNotify }) => {
  const [stats, setStats] = useState<AdminResearchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingHerb, setSyncingHerb] = useState<string | null>(null);
  const [newHerbInput, setNewHerbInput] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await researchService.getStats();
      setStats(data);
    } catch (err: any) {
      if (onNotify) onNotify(`Failed to load research stats: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSyncHerb = async (herbName: string) => {
    setSyncingHerb(herbName);
    if (onNotify) onNotify(`Triggering scholarly multi-source sync for ${herbName}...`);
    try {
      const res = await researchService.syncHerb(herbName);
      if (onNotify) onNotify(`Successfully synced ${herbName}: ${res.data.papers.length} papers recorded.`);
      await loadStats();
    } catch (err: any) {
      if (onNotify) onNotify(`Failed to sync ${herbName}: ${err.message || err}`);
    } finally {
      setSyncingHerb(null);
    }
  };

  const handleAddNewHerbSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHerbInput.trim()) return;
    setIsSubmittingNew(true);
    const herb = newHerbInput.trim();
    if (onNotify) onNotify(`Initiating scholarly discovery across PubMed, Europe PMC, OpenAlex, Crossref for '${herb}'...`);
    try {
      const res = await researchService.search(herb, true);
      if (onNotify) {
        onNotify(`Discovered and cached ${res.analytics.total_papers} papers for ${res.herb_profile.common_name} (${res.herb_profile.scientific_name}).`);
      }
      setNewHerbInput('');
      await loadStats();
    } catch (err: any) {
      if (onNotify) onNotify(`Sync error: ${err.message || err}`);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const filteredHerbs = (stats?.herbs || []).filter(
    h =>
      h.herb_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      h.scientific_name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Herbs Indexed</div>
          <div className="text-2xl font-black text-slate-900 font-heading mt-1">
            {stats ? stats.total_herbs_indexed : 0}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">PostgreSQL Registry</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Papers</div>
          <div className="text-2xl font-black text-slate-900 font-heading mt-1">
            {stats ? (stats.total_papers_indexed ?? stats.total_research_papers ?? 0).toLocaleString() : 0}
          </div>
          <div className="text-[10px] text-blue-700 font-semibold mt-0.5">Deduplicated Records</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Recent Papers</div>
          <div className="text-2xl font-black text-slate-900 font-heading mt-1">
            {stats ? (stats.recent_additions ?? 0).toLocaleString() : 0}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold mt-0.5">2020–2026 Batch</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Duplicates Prevented</div>
          <div className="text-2xl font-black text-emerald-800 font-heading mt-1">
            {stats ? (stats.duplicates_prevented ?? 0).toLocaleString() : 0}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Cross-Database Filter</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Failed Requests</div>
          <div className="text-2xl font-black text-slate-900 font-heading mt-1">
            {stats ? (stats.failed_api_requests ?? 0) : 0}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Retry Handlers Active</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Last Sync</div>
          <div className="text-sm font-bold text-slate-900 font-mono mt-2 truncate">
            {stats?.last_sync ? new Date(stats.last_sync).toLocaleTimeString() : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">7-Day Cache TTL</div>
        </div>
      </div>

      {/* Source Breakdown & Ingest Quick Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Cards */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Scholarly Source Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Ingestion Endpoints</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {['Europe PMC', 'OpenAlex', 'PubMed', 'Crossref'].map(src => {
              const count = stats?.source_breakdown?.[src] || stats?.sources_breakdown?.[src] || 0;
              return (
                <div key={src} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 truncate">{src}</div>
                  <div className="text-xl font-black text-slate-900 font-heading mt-1">{count}</div>
                  <div className="text-[10px] text-slate-500">Indexed Papers</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync / Ingest New Herb */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 border border-emerald-800/40 shadow-sm space-y-4">
          <div>
            <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Index New Herb</span>
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1">
              Trigger instant multi-source scientific discovery for any medicinal plant across PubMed, Europe PMC, OpenAlex, and Crossref.
            </p>
          </div>

          <form onSubmit={handleAddNewHerbSync} className="space-y-3">
            <input
              type="text"
              value={newHerbInput}
              onChange={e => setNewHerbInput(e.target.value)}
              placeholder="e.g. Shatavari, Guduchi, Haritaki..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-200/50 text-xs focus:outline-none focus:border-emerald-400 font-medium"
            />
            <button
              type="submit"
              disabled={isSubmittingNew || !newHerbInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingNew ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Harvesting Scholarly Papers...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Fetch &amp; Cache Research Literature</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Indexed Herbs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900">
              Indexed Medicinal Plants ({filteredHerbs.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cached research datasets stored in Neon PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Search herbs..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              onClick={loadStats}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Herb Common Name</th>
                <th className="py-3 px-4">Botanical / Scientific Name</th>
                <th className="py-3 px-4 text-center">Unique Papers</th>
                <th className="py-3 px-4">Last Synchronized</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHerbs.length > 0 ? (
                filteredHerbs.map(h => (
                  <tr key={h.herb_name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {h.herb_name}
                    </td>
                    <td className="py-3.5 px-4 italic text-emerald-800 font-serif">
                      {h.scientific_name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {h.total_papers.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(h.last_synced_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSyncHerb(h.herb_name)}
                        disabled={syncingHerb === h.herb_name}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncingHerb === h.herb_name ? 'animate-spin text-emerald-600' : ''}`} />
                        <span>{syncingHerb === h.herb_name ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No indexed herbs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
