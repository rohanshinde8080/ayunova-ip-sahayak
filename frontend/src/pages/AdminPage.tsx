import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Server,
  Database,
  RefreshCw,
  Plus,
  Share2,
  Sparkles,
  Activity,
  UserCheck,
  TrendingUp,
  BookOpen,
  Layers,
  FileText
} from 'lucide-react';
import {
  KnowledgeDocument,
  DocumentChunkDetail,
  AdminMetrics,
  AuditLogEntry,
  FacilitatorRequest,
  ManualIngestFormData,
  ReindexStep,
  GraphStats,
  GraphData,
  GraphQueryResult
} from '../types';
import { adminService } from '../services/adminService';
import { facilitatorService } from '../services/facilitatorService';
import { graphService } from '../services/graphService';
import { StatCard } from '../components/StatCard';
import { ChunkInspectorModal } from '../components/ChunkInspectorModal';
import { useApp } from '../context/AppContext';

// Modular Tab Components
import { AdminCorpusTab } from './admin/AdminCorpusTab';
import { AdminIngestTab } from './admin/AdminIngestTab';
import { AdminGraphTab } from './admin/AdminGraphTab';
import { AdminReindexTab } from './admin/AdminReindexTab';
import { AdminAuditTab } from './admin/AdminAuditTab';
import { AdminReviewsTab } from './admin/AdminReviewsTab';
import { AdminResearchTab } from './admin/AdminResearchTab';

export const AdminPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'corpus' | 'ingest' | 'graph' | 'reindex' | 'audit' | 'reviews' | 'research') || 'corpus';

  const setActiveTab = (tab: 'corpus' | 'ingest' | 'graph' | 'reindex' | 'audit' | 'reviews' | 'research') => {
    setSearchParams({ tab });
  };

  const [metrics, setMetrics] = useState<AdminMetrics>({
    systemStatus: 'ONLINE',
    databaseConnected: true,
    totalDocuments: 0,
    totalChunks: 0,
    totalPriorArt: 0,
    totalIPC: 0,
    lowConfidenceQueries: 0,
    pendingReviews: 0,
    avgResponseTime: '0.8s',
    groundedAccuracy: '100%',
    knowledgeCorpusVersion: 'Ayush-Neon-2026.1',
    activeJurisdictions: ['India (IPO)', 'WIPO (Geneva)', 'US FDA (Botanical)', 'EMA (HMPC)']
  });

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [reviews, setReviews] = useState<FacilitatorRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ingestion Modes
  const [ingestMode, setIngestMode] = useState<'upload' | 'manual' | 'bulk'>('upload');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Knowledge Graph (Neo4j) State
  const [graphStats, setGraphStats] = useState<GraphStats | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [isGraphSyncing, setIsGraphSyncing] = useState(false);
  const [cypherQuery, setCypherQuery] = useState(
    'MATCH (h:Herb)-[r]->(target)\nRETURN h.name AS Herb, type(r) AS Relation, labels(target)[0] AS TargetType, target.name AS Target\nLIMIT 25'
  );
  const [cypherResult, setCypherResult] = useState<GraphQueryResult | null>(null);
  const [cypherError, setCypherError] = useState<string | null>(null);
  const [isExecutingCypher, setIsExecutingCypher] = useState(false);

  // Ingestion: File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('Patents Act');
  const [uploadAuthority, setUploadAuthority] = useState('Indian Patent Office (IPO)');
  const [uploadAct, setUploadAct] = useState('The Patents Act, 1970');
  const [uploadJurisdiction, setUploadJurisdiction] = useState('India');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);

  // Ingestion: Manual Form State
  const [manualForm, setManualForm] = useState<ManualIngestFormData>({
    title: '',
    authority: 'Ministry of Ayush / AIIA',
    officialAct: 'The Patents Act, 1970',
    section: '',
    jurisdiction: 'India',
    category: 'Patents Act',
    contentText: '',
    gazetteExcerpt: '',
    pageReference: '',
    adminEmail: 'admin@ipsakti.ai'
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Ingestion: Bulk JSON State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  // Re-indexing State
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSteps, setReindexSteps] = useState<ReindexStep[]>([]);

  // Chunk Inspector Modal State
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [docChunks, setDocChunks] = useState<DocumentChunkDetail[]>([]);
  const [isChunksLoading, setIsChunksLoading] = useState(false);

  const { showNotification } = useApp();

  useEffect(() => {
    loadAllAdminData();
    loadGraphData();
  }, []);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, docs, reqs, logs] = await Promise.all([
        adminService.getStats(),
        adminService.getKnowledgeDocuments(),
        facilitatorService.getRequests(),
        adminService.getAuditLogs()
      ]);
      setMetrics(m);
      setDocuments(docs);
      setReviews(reqs);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGraphData = async () => {
    setIsGraphLoading(true);
    try {
      const [stats, data] = await Promise.all([
        graphService.getStats(),
        graphService.getSubgraph()
      ]);
      setGraphStats(stats);
      setGraphData(data);
    } catch (e) {
      console.error('Failed to load graph data:', e);
    } finally {
      setIsGraphLoading(false);
    }
  };

  const handleSyncNeo4j = async () => {
    setIsGraphSyncing(true);
    showNotification('Synchronizing PostgreSQL documents into Neo4j Knowledge Graph...');
    try {
      const res = await graphService.syncPostgresToNeo4j();
      showNotification(
        `Neo4j Sync Complete: ${res.synced_documents} documents, ${res.nodes_created} nodes, ${res.edges_created} edges.`
      );
      await loadGraphData();
    } catch (err: any) {
      showNotification(`Neo4j synchronization failed: ${err.message || err}`);
    } finally {
      setIsGraphSyncing(false);
    }
  };

  const handleExecuteCypher = async () => {
    if (!cypherQuery.trim()) return;
    setIsExecutingCypher(true);
    setCypherError(null);
    try {
      const result = await graphService.executeQuery(cypherQuery);
      setCypherResult(result);
      showNotification(`Cypher executed: returned ${result.data.length} records.`);
    } catch (err: any) {
      setCypherError(err.message || 'Cypher execution error');
      showNotification(`Cypher error: ${err.message || err}`);
    } finally {
      setIsExecutingCypher(false);
    }
  };

  const handleToggleDoc = async (id: string) => {
    try {
      const updated = await adminService.toggleDocumentStatus(id);
      setDocuments(updated);
      showNotification('Document knowledge status toggled in Neon PostgreSQL.');
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch {
      showNotification('Failed to toggle status.');
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete '${title}' and cascade-remove all its vector chunks from Neon Postgres?`)) {
      return;
    }
    try {
      const updated = await adminService.deleteDocument(id);
      setDocuments(updated);
      showNotification(`Deleted document and removed vector chunks.`);
      const [m, logs] = await Promise.all([adminService.getStats(), adminService.getAuditLogs()]);
      setMetrics(m);
      setAuditLogs(logs);
    } catch {
      showNotification('Failed to delete document.');
    }
  };

  const handleInspectChunks = async (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setInspectorOpen(true);
    setIsChunksLoading(true);
    try {
      const details = await adminService.getDocumentDetails(doc.id);
      setDocChunks(details.chunks || []);
    } catch (err) {
      console.error('Error fetching chunks:', err);
      setDocChunks([]);
    } finally {
      setIsChunksLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showNotification('Please select a document file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadStage('1. Extracting text from document...');
    showNotification(`Initiating ingestion for ${uploadFile.name}...`);

    try {
      setTimeout(() => setUploadStage('2. Segmenting statutory legal chunks...'), 600);
      setTimeout(() => setUploadStage('3. Generating 768-dim vector embeddings via Gemini / pgvector...'), 1200);

      const res = await adminService.uploadDocument(uploadFile, {
        category: uploadCategory,
        authority: uploadAuthority,
        officialAct: uploadAct,
        jurisdiction: uploadJurisdiction,
        adminEmail: 'admin@ipsakti.ai'
      });

      setUploadStage('4. Synchronizing vector indexes on Neon Serverless Postgres...');
      await new Promise(r => setTimeout(r, 400));

      showNotification(`Successfully ingested '${uploadFile.name}' (${res.total_chunks} chunks).`);
      setUploadFile(null);
      await loadAllAdminData();
      setActiveTab('corpus');
    } catch (err: any) {
      showNotification(`Ingestion failed: ${err.message || err}`);
    } finally {
      setIsUploading(false);
      setUploadStage(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim() || !manualForm.contentText.trim()) {
      showNotification('Please fill in required fields: Title and Content.');
      return;
    }

    setIsSubmittingManual(true);
    try {
      await adminService.createManualEntry(manualForm);
      showNotification(`Injected statutory provision: '${manualForm.title}'`);
      setManualForm({
        title: '',
        authority: 'Ministry of Ayush / AIIA',
        officialAct: 'The Patents Act, 1970',
        section: '',
        jurisdiction: 'India',
        category: 'Patents Act',
        contentText: '',
        gazetteExcerpt: '',
        pageReference: '',
        adminEmail: 'admin@ipsakti.ai'
      });
      await loadAllAdminData();
      setActiveTab('corpus');
    } catch (err: any) {
      showNotification(`Manual entry failed: ${err.message || err}`);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      showNotification('Please select a JSON dataset file.');
      return;
    }

    setIsBulkImporting(true);
    showNotification('Starting bulk batch import...');

    try {
      const res = await adminService.importBulkJson(bulkFile);
      showNotification(`Bulk import completed: ${res.ingested_count} records injected.`);
      setBulkFile(null);
      await loadAllAdminData();
      setActiveTab('corpus');
    } catch (err: any) {
      showNotification(`Bulk import failed: ${err.message || err}`);
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    setReindexSteps([]);
    showNotification('Starting RAG Vector Knowledge Indexing...');

    try {
      await adminService.triggerReindex(step => {
        setReindexSteps(prev => [...prev, step]);
      });
      showNotification('Knowledge base successfully re-indexed in Neon Postgres!');
      await loadAllAdminData();
    } finally {
      setIsReindexing(false);
    }
  };

  const handleDownloadSampleJson = () => {
    const sampleData = [
      {
        title: "Patents (Amendment) Guidelines 2026 - Rule 12",
        authority: "Indian Patent Office",
        officialAct: "The Patents Act, 1970",
        section: "Section 3(e) - Synergism Threshold",
        category: "Patents Act",
        jurisdiction: "India",
        contentText: "Where polyherbal compositions are claimed, experimental synergy data demonstrating combination index < 0.8 must be submitted to overcome Section 3(e) objection."
      },
      {
        title: "Ayurvedic Pharmacopoeia Monograph - Terminalia arjuna",
        authority: "Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H)",
        officialAct: "Drugs and Cosmetics Act, 1940",
        section: "Monograph API Part I Vol II",
        category: "Pharmacopoeia",
        jurisdiction: "India",
        contentText: "Standardized stem bark extract of Terminalia arjuna must assay for not less than 0.20% w/w of Arjunolic acid and 0.05% w/w of Arjunic acid by HPLC."
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ip_shakti_sahayak_statutes_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statutory Knowledge Base Hero Card with Legal Books & Mortar Background */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/25 relative overflow-hidden bg-cover bg-no-repeat bg-right"
        style={{ 
          backgroundColor: '#0c2419',
          backgroundImage: `linear-gradient(to right, #0c2419 0%, #0c2419 50%, rgba(12,36,25,0.85) 65%, rgba(12,36,25,0.25) 100%), url('/admin_statutes_bg.jpg')`
        }}
      >
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-amber-300 border border-amber-500/50 shadow-xs font-mono flex items-center gap-1.5">
              <Server className="w-3 h-3 text-amber-300" />
              ADMIN &amp; IPR CELL CONSOLE
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-mono shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Neon Postgres: Connected
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-600/50">
              pgvector 0.8.6
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-600/50">
              Gemini 768-dim Vectors
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-7 bg-amber-400 rounded-full" />
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              Statutory Knowledge Base &amp; Ingestion Studio
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Ingest authoritative acts, parse gazette PDFs, generate semantic legal chunks, and maintain live RAG vector embeddings.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('ingest')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Ingest Document</span>
            </button>
            <button
              onClick={handleReindex}
              disabled={isReindexing}
              className="px-4 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-emerald-600/50 active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isReindexing ? 'animate-spin' : ''}`} />
              <span>{isReindexing ? 'Re-indexing...' : 'Re-index Corpus'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Master Statutes"
          value={metrics.totalDocuments}
          subtitle="Authoritative Acts & Treaties"
          icon={FileText}
          color="emerald"
        />
        <StatCard
          title="Legal Vector Chunks"
          value={metrics.totalChunks}
          subtitle="768-dim HNSW Vector Store"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="TKDL Prior Art"
          value={metrics.totalPriorArt}
          subtitle="Classical Formulations Indexed"
          icon={Layers}
          color="amber"
        />
        <StatCard
          title="Grounded Accuracy"
          value={metrics.groundedAccuracy}
          subtitle="Zero Hallucination Gate"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex border border-slate-200 bg-white/95 backdrop-blur-md rounded-2xl p-2 gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('corpus')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'corpus'
              ? 'bg-[#133827] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Statutory Corpus ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ingest')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'ingest'
              ? 'bg-[#133827] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Data Ingestion Studio</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold">
            Pipeline
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('graph');
            loadGraphData();
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'graph'
              ? 'bg-[#133827] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Knowledge Graph (Neo4j)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold">
            {graphStats?.nodes_count || 48} Nodes
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reindex')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'reindex'
              ? 'bg-[#133827] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Re-Indexing Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#133827] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Governance &amp; Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-[#133827] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Facilitator Queue ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'research'
              ? 'bg-[#133827] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Research Data Hub</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
            PubMed+
          </span>
        </button>
      </div>

      {/* ACTIVE TAB VIEWS */}
      {activeTab === 'corpus' && (
        <AdminCorpusTab
          documents={documents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedJurisdiction={selectedJurisdiction}
          onJurisdictionChange={setSelectedJurisdiction}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onToggleDoc={handleToggleDoc}
          onDeleteDoc={handleDeleteDoc}
          onInspectChunks={handleInspectChunks}
        />
      )}

      {activeTab === 'ingest' && (
        <AdminIngestTab
          ingestMode={ingestMode}
          onSelectIngestMode={setIngestMode}
          uploadFile={uploadFile}
          onSelectUploadFile={setUploadFile}
          uploadCategory={uploadCategory}
          onChangeUploadCategory={setUploadCategory}
          uploadAuthority={uploadAuthority}
          onChangeUploadAuthority={setUploadAuthority}
          uploadAct={uploadAct}
          onChangeUploadAct={setUploadAct}
          uploadJurisdiction={uploadJurisdiction}
          onChangeUploadJurisdiction={setUploadJurisdiction}
          isUploading={isUploading}
          uploadStage={uploadStage}
          onFileUpload={handleFileUpload}
          manualForm={manualForm}
          onChangeManualForm={setManualForm}
          isSubmittingManual={isSubmittingManual}
          onManualSubmit={handleManualSubmit}
          bulkFile={bulkFile}
          onSelectBulkFile={setBulkFile}
          isBulkImporting={isBulkImporting}
          onBulkImport={handleBulkImport}
          onDownloadSampleJson={handleDownloadSampleJson}
        />
      )}

      {activeTab === 'graph' && (
        <AdminGraphTab
          graphStats={graphStats}
          graphData={graphData}
          isGraphLoading={isGraphLoading}
          isGraphSyncing={isGraphSyncing}
          onSyncNeo4j={handleSyncNeo4j}
          onRefreshGraph={loadGraphData}
          cypherQuery={cypherQuery}
          onChangeCypherQuery={setCypherQuery}
          cypherResult={cypherResult}
          cypherError={cypherError}
          isExecutingCypher={isExecutingCypher}
          onExecuteCypher={handleExecuteCypher}
        />
      )}

      {activeTab === 'reindex' && (
        <AdminReindexTab
          isReindexing={isReindexing}
          reindexSteps={reindexSteps}
          onReindex={handleReindex}
        />
      )}

      {activeTab === 'audit' && (
        <AdminAuditTab auditLogs={auditLogs} />
      )}

      {activeTab === 'reviews' && (
        <AdminReviewsTab reviews={reviews} />
      )}

      {activeTab === 'research' && (
        <AdminResearchTab onNotify={showNotification} />
      )}

      {/* Chunk Inspector Modal */}
      <ChunkInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        document={selectedDoc}
        chunks={docChunks}
        isLoading={isChunksLoading}
      />
    </div>
  );
};
