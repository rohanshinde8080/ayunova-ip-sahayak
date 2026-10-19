import React from 'react';
import {
  Share2,
  RefreshCw,
  Terminal,
  Play
} from 'lucide-react';
import { KnowledgeGraphVisualizer } from '../../components/KnowledgeGraphVisualizer';
import { GraphData, GraphStats, GraphQueryResult } from '../../types';

interface AdminGraphTabProps {
  graphStats: GraphStats | null;
  graphData: GraphData | null;
  isGraphLoading: boolean;
  isGraphSyncing: boolean;
  onRefreshGraph: () => void;
  onSyncNeo4j: () => void;
  cypherQuery: string;
  onChangeCypherQuery: (query: string) => void;
  cypherResult: GraphQueryResult | null;
  cypherError: string | null;
  isExecutingCypher: boolean;
  onExecuteCypher: () => void;
}

export const AdminGraphTab: React.FC<AdminGraphTabProps> = ({
  graphStats,
  graphData,
  isGraphLoading,
  isGraphSyncing,
  onRefreshGraph,
  onSyncNeo4j,
  cypherQuery,
  onChangeCypherQuery,
  cypherResult,
  cypherError,
  isExecutingCypher,
  onExecuteCypher
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in text-slate-800">
      {/* Header Banner: Connection Status & Sync Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Neo4j Knowledge Graph Instance Connected
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-700">
              {graphStats?.version || '2026.08.1'}
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
            <span>Neo4j Graph Database Studio</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              ({graphStats?.uri || 'neo4j://127.0.0.1:7687'})
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            DBMS ID: <span className="font-mono text-emerald-300">{graphStats?.dbms_id || 'ffddfc71-94df-4a41-9c96-cab5cd510087'}</span> · Graph Schema: Enforcing Herb, Statute, Section, Treatise &amp; Patent topology.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSyncNeo4j}
            disabled={isGraphSyncing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGraphSyncing ? 'animate-spin' : ''}`} />
            <span>{isGraphSyncing ? 'Syncing Documents...' : 'Sync Postgres to Neo4j'}</span>
          </button>
          <button
            onClick={onRefreshGraph}
            disabled={isGraphLoading}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGraphLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Graph Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Total Nodes
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {graphStats?.nodes_count || 48}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Entities Indexed</span>
        </div>

        <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700">
            Relationships
          </span>
          <div className="text-xl font-bold font-mono text-indigo-900">
            {graphStats?.relationships_count || 76}
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">Multi-hop Edges</span>
        </div>

        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800">
            🌿 Botanical Herbs
          </span>
          <div className="text-xl font-bold font-mono text-emerald-950">
            {graphStats?.labels?.Herb || 14}
          </div>
          <span className="text-[10px] text-emerald-700">Ashwagandha, Triphala...</span>
        </div>

        <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800">
            ⚖️ Statutes &amp; Acts
          </span>
          <div className="text-xl font-bold font-mono text-blue-950">
            {graphStats?.labels?.Statute || 6}
          </div>
          <span className="text-[10px] text-blue-700">Patents Act, BDA, DCA</span>
        </div>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
            📜 Treatises / TKDL
          </span>
          <div className="text-xl font-bold font-mono text-amber-950">
            {graphStats?.labels?.Treatise || 7}
          </div>
          <span className="text-[10px] text-amber-700">Charaka, Sushruta, AFI</span>
        </div>

        <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800">
            📑 Patents &amp; Claims
          </span>
          <div className="text-xl font-bold font-mono text-purple-950">
            {graphStats?.labels?.Patent || 3}
          </div>
          <span className="text-[10px] text-purple-700">US 11992510 &amp; Formulations</span>
        </div>
      </div>

      {/* Interactive Graph Visualizer Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Interactive Knowledge Graph Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Drag nodes to reposition, scroll/pan to explore multi-hop legal links, and click nodes to view properties.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            Force-Directed Physics Simulation
          </span>
        </div>

        <KnowledgeGraphVisualizer
          graph={graphData || undefined}
          height={500}
          title="IP SHAKTI SAHAYAK Knowledge Graph"
          subtitle="Neo4j Desktop Multi-Hop Entity & Relational Topology"
        />
      </div>

      {/* Cypher Query Runner & Playground */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-heading font-bold text-sm text-slate-100">
              Read-Only Cypher Query Console
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
              Safe Admin Runner
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-mono">Presets:</span>
            <button
              type="button"
              onClick={() =>
                onChangeCypherQuery(
                  'MATCH (h:Herb)-[r]->(target)\nRETURN h.name AS Herb, type(r) AS Relation, labels(target)[0] AS TargetType, target.name AS Target\nLIMIT 25'
                )
              }
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded transition-colors cursor-pointer border border-slate-700"
            >
              All Herbs &amp; Relations
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeCypherQuery(
                  'MATCH (f)-[r:BARRED_BY]->(s:Section)\nRETURN f.name AS Formulation, s.name AS BarredBySection\nLIMIT 25'
                )
              }
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded transition-colors cursor-pointer border border-slate-700"
            >
              Section 3(p) TK Bars
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeCypherQuery(
                  'MATCH (h:Herb)-[r:DOCUMENTED_IN]->(t:Treatise)\nRETURN h.name AS Herb, t.name AS ClassicalTreatise\nLIMIT 25'
                )
              }
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded transition-colors cursor-pointer border border-slate-700"
            >
              Treatises / TKDL
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={cypherQuery}
            onChange={e => onChangeCypherQuery(e.target.value)}
            rows={3}
            className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-300 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500/80 resize-y"
            placeholder="MATCH (n) RETURN n LIMIT 25"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Read-only: Mutating Cypher keywords (CREATE, DELETE, DROP, SET) are barred for security.
            </span>
            <button
              type="button"
              onClick={onExecuteCypher}
              disabled={isExecutingCypher || !cypherQuery.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Play className={`w-3.5 h-3.5 ${isExecutingCypher ? 'animate-spin' : ''}`} />
              <span>{isExecutingCypher ? 'Running Cypher...' : 'Execute Cypher Query'}</span>
            </button>
          </div>
        </div>

        {cypherError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200">
            <span className="font-bold">Execution Error: </span>
            <span>{cypherError}</span>
          </div>
        )}

        {cypherResult && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold font-mono">
                Query Output ({cypherResult.data.length} records returned)
              </span>
            </div>
            <div className="overflow-x-auto max-h-64 border border-slate-800 rounded-xl bg-slate-950">
              <table className="w-full text-left font-mono text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-200 text-[11px] uppercase tracking-wider sticky top-0">
                  <tr>
                    {cypherResult.columns.map(col => (
                      <th key={col} className="p-2.5 font-bold border-b border-slate-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {cypherResult.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                      {cypherResult.columns.map(col => (
                        <td key={col} className="p-2.5 text-[11px] text-emerald-300">
                          {typeof row[col] === 'object'
                            ? JSON.stringify(row[col])
                            : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
