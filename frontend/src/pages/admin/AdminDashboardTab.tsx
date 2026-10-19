import React from 'react';
import {
  Database,
  Share2,
  Globe2,
  RefreshCw,
  Plus,
  UserCheck,
  Activity,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { AdminMetrics, GraphStats } from '../../types';

interface AdminDashboardTabProps {
  metrics: AdminMetrics;
  graphStats: GraphStats | null;
  onNavigateTab: (tab: 'corpus' | 'ingest' | 'graph' | 'reindex' | 'audit' | 'reviews') => void;
  onTriggerReindex: () => void;
  isReindexing: boolean;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  metrics,
  graphStats,
  onNavigateTab,
  onTriggerReindex,
  isReindexing
}) => {
  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Neon Postgres Card */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="font-heading font-bold text-sm text-white">Neon pgvector</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Serverless PostgreSQL cluster running <span className="font-mono text-emerald-300">pgvector 0.8.6</span> with 768-dim cosine distance HNSW index.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Active Vectors:</span>
            <span className="font-bold text-emerald-400">{metrics.totalChunks} Chunks</span>
          </div>
        </div>

        {/* Neo4j Graph Card */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span className="font-heading font-bold text-sm text-white">Neo4j Desktop</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-hop relational graph enforcing domain ontology across herbs, classical treatises, and Section 3(p) bars.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Topology Size:</span>
            <span className="font-bold text-indigo-300">
              {graphStats?.nodes_count || 48} Nodes / {graphStats?.relationships_count || 76} Edges
            </span>
          </div>
        </div>

        {/* Tavily Search Card */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <span className="font-heading font-bold text-sm text-white">Tavily Live Web</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
              READY
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time live search grounding across Google Patents, USPTO records, WIPO gazettes, and clinical registries.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Domain Filters:</span>
            <span className="font-bold text-blue-300">patents.google.com, who.int</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Administrative Control Launchpad</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('ingest')}
            className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 rounded-xl transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Plus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="font-bold text-xs text-white">Ingest Statute / Act</div>
            <p className="text-[11px] text-slate-400 mt-0.5">PDF parser &amp; vector chunker</p>
          </button>

          <button
            onClick={() => onNavigateTab('graph')}
            className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/60 rounded-xl transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Terminal className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="font-bold text-xs text-white">Cypher Query Studio</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Explore Neo4j knowledge graph</p>
          </button>

          <button
            onClick={onTriggerReindex}
            disabled={isReindexing}
            className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 rounded-xl transition-all text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isReindexing ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="font-bold text-xs text-white">Re-index Vectors</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Rebuild HNSW cosine indexes</p>
          </button>

          <button
            onClick={() => onNavigateTab('reviews')}
            className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 rounded-xl transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <UserCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="font-bold text-xs text-white">Escalation Queue</div>
            <p className="text-[11px] text-slate-400 mt-0.5">{metrics.pendingReviews} items pending review</p>
          </button>
        </div>
      </div>
    </div>
  );
};
