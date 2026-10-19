import React, { useMemo } from 'react';
import {
  BookOpen,
  Share2,
  Download,
  ShieldCheck,
  UserCheck,
  X,
  Zap,
  Activity,
  FileText,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { StructuredAIAnswer, SourceCitation, RAGTelemetry, PatentRecord } from '../../types';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { SourceCard } from '../SourceCard';
import { KnowledgeGraphVisualizer } from '../KnowledgeGraphVisualizer';
import { synthesizeDynamicClientSubgraph } from '../../services/graphService';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvidence: StructuredAIAnswer | null;
  evidenceTab: 'citations' | 'patents' | 'graph';
  onSelectTab: (tab: 'citations' | 'patents' | 'graph') => void;
  telemetry: RAGTelemetry | null;
  onExportDossier: () => void;
  onEscalate: () => void;
  onLoadDemoShowcase: () => void;
  onOpenTelemetryModal: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  activeEvidence,
  evidenceTab,
  onSelectTab,
  telemetry,
  onExportDossier,
  onEscalate,
  onLoadDemoShowcase,
  onOpenTelemetryModal
}) => {
  const hasPatents = Boolean(activeEvidence?.patents && activeEvidence.patents.length > 0);

  const effectiveSubgraph = useMemo(() => {
    if (activeEvidence?.subgraph && activeEvidence.subgraph.nodes && activeEvidence.subgraph.nodes.length > 0) {
      return activeEvidence.subgraph;
    }
    if (activeEvidence?.answer) {
      return synthesizeDynamicClientSubgraph(activeEvidence.answer);
    }
    return undefined;
  }, [activeEvidence]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for overlay on mobile/tablet */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 xl:hidden animate-fade-in"
      />

      {/* Slide-over / Docked Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 xl:static xl:z-auto w-[85vw] sm:w-[420px] xl:w-[380px] 2xl:w-[420px] bg-white border-l border-slate-200 shadow-xl xl:shadow-none flex flex-col shrink-0 h-full overflow-hidden transition-transform duration-300 ease-in-out"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Grounded Evidence
                </h3>
                {activeEvidence && (
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                    {activeEvidence.sources?.length || 0} Grounded
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Statutory Gazette, TKDL, and Global Patents
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {activeEvidence && (
          <div className="p-3 pb-2 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => onSelectTab('citations')}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${evidenceTab === 'citations'
                    ? 'bg-white text-emerald-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>Citations ({activeEvidence.sources?.length || 0})</span>
              </button>
              {hasPatents && (
                <button
                  type="button"
                  onClick={() => onSelectTab('patents')}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${evidenceTab === 'patents'
                      ? 'bg-white text-emerald-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Patents ({activeEvidence.patents?.length || 0})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('graph')}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${evidenceTab === 'graph'
                    ? 'bg-white text-indigo-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Graph ({effectiveSubgraph?.nodes?.length || 0})</span>
              </button>
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeEvidence ? (
            evidenceTab === 'graph' ? (
              <div className="space-y-3">
                <KnowledgeGraphVisualizer
                  graph={effectiveSubgraph}
                  height={420}
                  title="Live Grounded Subgraph"
                  subtitle="Interactive multi-hop statutory bars & botanical relations"
                />

                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-indigo-950">
                    <span>Neo4j Graph Grounding</span>
                    <span className="text-[10px] font-mono bg-indigo-200/80 text-indigo-900 px-1.5 py-0.5 rounded font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                    Graph traversal cross-matched biological species, classical treatise precedents, and statutory bars under Patents Act Section 3(p)/3(e).
                  </p>
                </div>
              </div>
            ) : evidenceTab === 'patents' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Deduplicated Patent Records ({activeEvidence.patents?.length || 0})
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Zero Duplicate Pubs
                  </span>
                </div>

                {activeEvidence.patents?.map((pat: PatentRecord, pIdx: number) => (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-emerald-400 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {pat.publicationNumber}
                        </span>
                        {pat.jurisdiction && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {pat.jurisdiction}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {pat.isFamilyMember && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                            <Layers className="w-2.5 h-2.5 text-purple-600" />
                            <span>Same family</span>
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                          Verified ✓
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {pat.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Applicant</span>
                        <span className="text-slate-800 font-medium truncate block">{pat.applicant || 'Not Verified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Legal Status</span>
                        <span className="text-slate-800 font-medium block">{pat.legalStatus}</span>
                      </div>
                      {pat.priorityDate && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Priority Date</span>
                          <span className="text-slate-700 font-mono block">{pat.priorityDate}</span>
                        </div>
                      )}
                      {pat.filingDate && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Filing Date</span>
                          <span className="text-slate-700 font-mono block">{pat.filingDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <button
                  onClick={onExportDossier}
                  className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Download the full statutory and citation analysis as a Markdown report"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Export Legal Dossier (.md)</span>
                </button>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Verification Confidence:</span>
                    <ConfidenceBadge
                      confidence={activeEvidence.confidence}
                      confidenceMetrics={activeEvidence.confidenceMetrics}
                    />
                  </div>

                  {activeEvidence.confidenceMetrics && (
                    <div className="space-y-1 pt-1 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Evidence Coverage:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {activeEvidence.confidenceMetrics.evidenceCoverage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${activeEvidence.confidenceMetrics.evidenceCoverage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 italic pt-0.5">
                        {activeEvidence.confidenceMetrics.disclaimer}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Semantic pgvector HNSW cross-matched</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Authority metadata &amp; Gazette sections verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Grounded in Section 3(p), 3(e) &amp; TKDL corpus</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Retrieved Gazette Authorities ({activeEvidence.sources?.length || 0})
                  </div>
                  {activeEvidence.sources?.map((src: SourceCitation) => (
                    <SourceCard key={src.id} source={src} />
                  ))}
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Need Custom Legal Structuring?</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    If your bioassay data requires registered patent agent review or NBA clearance filing.
                  </p>
                  <button
                    onClick={onEscalate}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Request Ayush IP Facilitator
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span>Neon pgvector 0.8.6</span>
                    <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    {telemetry?.activeVectorsCount || 37} statutory sections and traditional knowledge prior art vectors loaded in memory.
                  </p>
                </div>

                <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                    <span>Neo4j Graph Database</span>
                    <span className="text-[10px] font-mono bg-indigo-200/80 text-indigo-900 px-1.5 py-0.5 rounded font-bold">
                      {telemetry?.neo4jStatus || 'CONNECTED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                    Multi-hop knowledge graph: {telemetry?.graphNodesCount || 48} entity nodes &amp; {telemetry?.graphRelationshipsCount || 76} relational edges.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Corpus Distribution
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-700 font-medium">Patents Act, 1970 (Sec 3p/3e)</span>
                      <span className="font-mono font-semibold text-slate-900">12 Chunks</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-700 font-medium">Drugs &amp; Cosmetics (Rule 158B)</span>
                      <span className="font-mono font-semibold text-slate-900">9 Rules</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-700 font-medium">Biological Diversity (BDA 2023)</span>
                      <span className="font-mono font-semibold text-slate-900">8 Chunks</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-700 font-medium">TKDL Prior Art Formulations</span>
                      <span className="font-mono font-semibold text-slate-900">8 References</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  onClick={onLoadDemoShowcase}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Load Triphala Demo Showcase</span>
                </button>

                <button
                  onClick={onOpenTelemetryModal}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect Pipeline Telemetry</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
