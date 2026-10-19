export type Jurisdiction = 'India' | 'International' | 'USA' | 'EU' | 'Japan';
export type Language =
  | 'en'
  | 'hi'
  | 'mr'
  | 'sa'
  | 'gu'
  | 'bn'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or';

export interface SourceCitation {
  id: string;
  title: string;
  authority: string;
  section: string;
  page?: string;
  jurisdiction: Jurisdiction | 'Global';
  verified: boolean;
  url?: string;
  summary: string;
  gazetteExcerpt?: string;
  officialAct?: string;
  similarity?: number;
  relevanceScore?: number;
  matchPercentage?: string;
  publicationNumber?: string;
  patentFamily?: string;
  legalStatus?: string;
  isFamilyMember?: boolean;
}

export interface PatentRecord {
  publicationNumber: string;
  applicationNumber?: string;
  patentNumber?: string;
  title: string;
  applicant?: string;
  inventors?: string[];
  priorityDate?: string;
  filingDate?: string;
  publicationDate?: string;
  grantDate?: string;
  legalStatus: string;
  jurisdiction: string;
  patentFamily?: string;
  claimsSummary?: string;
  isFamilyMember: boolean;
  verified: boolean;
}

export interface ConfidenceMetrics {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceCoverage: number;
  sourceVerification: string;
  disclaimer: string;
}

export interface DeepAgentTrace {
  subagentsCalled?: string[];
  toolsQueried?: string[];
  skillsApplied?: string[];
  researchProcess?: string;
  rubricScore?: number;
  rubricPassed?: boolean;
  rubricDetails?: Record<string, boolean>;
  rubricSuggestions?: string[];
  webSources?: Array<{ title: string; url: string; content?: string }>;
  memoryUpdated?: boolean;
}

export interface StructuredAIAnswer {
  answer: string;
  assessment: string;
  considerations: string[];
  regulatory: string[];
  risks: string;
  nextSteps: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceCount: number;
  sources: SourceCitation[];
  detectedLanguage?: string;
  detectedJurisdiction?: Jurisdiction;
  detectedProductType?: string;
  subgraph?: GraphData;
  graphContext?: string;
  generationSource?: string;
  deepAgentTrace?: DeepAgentTrace;
  intent?: string;
  complexity?: string;
  responseArchetype?: string;
  confidenceMetrics?: ConfidenceMetrics;
  patents?: PatentRecord[];
  followUpSuggestions?: string[];
  researchProcess?: string;
  source_type?: 'DOCUMENT' | 'EXTERNAL_AUTHORITY' | 'DOCUMENT + EXTERNAL_AUTHORITY' | 'NONE';
  evidence?: Array<{
    document_name?: string;
    page?: number | string;
    chunk_id?: string;
    relevance?: number;
    passage?: string;
  }>;
  auditTrace?: Record<string, any>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  name: string;
  color?: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphStats {
  status: string;
  nodes_count: number;
  relationships_count: number;
  labels: Record<string, number>;
  relationship_types: Record<string, number>;
  dbms_id: string;
  version: string;
  uri: string;
}

export interface GraphQueryResult {
  columns: string[];
  data: Record<string, any>[];
  summary: {
    nodes_returned: number;
    relationships_returned: number;
  };
}

export interface RAGTelemetry {
  status: string;
  database: string;
  activeVectorsCount: number;
  activeStatutesCount: number;
  activePriorArtCount: number;
  indexType: string;
  synthesisEngine: string;
  geminiConfigured: boolean;
  graphNodesCount?: number;
  graphRelationshipsCount?: number;
  neo4jStatus?: string;
  tavilyConfigured?: boolean;
  tavilyStatus?: string;
  deepAgentAvailable?: boolean;
  deepAgentTools?: string[];
  deepAgentSubagents?: string[];
  deepAgentSkills?: string[];
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
  type?: 'step' | 'tool_call' | 'subagent_call' | 'rubric_check';
  tool?: 'vector' | 'graph' | 'web' | 'statute' | string;
  subagent?: string;
  rubricScore?: number;
  data?: any;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text?: string;
  structuredResponse?: StructuredAIAnswer;
  isLowConfidence?: boolean;
  isStreaming?: boolean;
  streamedText?: string;
  escalationStatus?: 'none' | 'requested' | 'submitted';
  escalationRef?: string;
}

export interface ProductClassificationInput {
  name: string;
  ingredients: string;
  purpose: string;
  dosageForm: string;
  manufacturingMethod: string;
  targetMarket: string;
  country: Jurisdiction;
}

export interface ProductClassificationResult {
  category: 'Ayurvedic Formulation (Classical)' | 'Patent & Proprietary Medicine (P&P)' | 'Phytopharmaceutical / New Botanical Drug' | 'Ayurveda-Aahar (FSSAI/Ayush)' | 'Ayurvedic Cosmetic';
  description: string;
  ipConsiderations: string[];
  regulatoryPathway: string[];
  traditionalKnowledgeScreening: string;
  confidence: 'High' | 'Medium' | 'Low';
  applicableSchedules: string[];
  recommendedForms: string[];
  sources: SourceCitation[];
}

export interface IPAdvisorInput {
  innovationName: string;
  description: string;
  novelFeature: string;
  category: 'Formulation' | 'Process' | 'Composition' | 'Brand' | 'Traditional Knowledge' | 'Other';
  jurisdiction: Jurisdiction;
}

export interface IPRoute {
  route: 'Patent' | 'Trademark' | 'Trade Secret / Confidential Know-how' | 'Traditional Knowledge Considerations' | 'Geographical Indication (GI)';
  relevance: string;
  potentialConcern: string;
  recommendedNextStep: string;
  applicableLaw: string;
  sources: string[];
}

export interface PriorArtSimilarity {
  id: string;
  document: string;
  source: string;
  similarityPercentage: number;
  relevantTopic: string;
  similarityNotes: string;
  publicationDate: string;
}

export interface IPAdvisorResult {
  routes: IPRoute[];
  priorArtSimilarities: PriorArtSimilarity[];
  confidence: 'High' | 'Medium' | 'Low';
  overallGuidance: string;
}

export interface ComplianceItem {
  id: string;
  category: 'Documentation' | 'IP & Prior Art' | 'Traditional Knowledge & ABS' | 'Regulatory & Licensing' | 'Labeling & Quality';
  title: string;
  description: string;
  completed: boolean;
  requiredFor: 'India' | 'International' | 'Both';
  statutoryRef: string;
}

export interface DocumentAnalysisResult {
  fileName: string;
  fileSize: string;
  pageCount: number;
  detectedLanguage: string;
  detectedTopic: string;
  keyInformation: {
    productName: string;
    herbsIdentified: string[];
    intendedUse: string;
    extractionSolvents: string;
  };
  ipConsiderations: string[];
  regulatoryConsiderations: string[];
  potentialMissingInformation: string[];
  relevantSources: SourceCitation[];
  confidence: 'High' | 'Medium' | 'Low';
}

export interface ComparisonData {
  country: Jurisdiction;
  flag: string;
  ipConsiderations: string[];
  regulatoryPathway: string[];
  typicalDocumentation: string[];
  complianceCheckpoints: string[];
  traditionalKnowledgeRequirements: string[];
  importantNotes: string;
}

export interface FacilitatorRequest {
  id: string;
  referenceNumber: string;
  innovationName: string;
  subject: string;
  jurisdiction: Jurisdiction;
  query: string;
  contactEmail: string;
  submittedAt: string;
  status: 'Pending Review' | 'In Analysis' | 'Completed';
  priority: 'Normal' | 'Urgent';
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  filename?: string;
  fileType?: string;
  authority: string;
  category: string;
  jurisdiction: Jurisdiction | 'Global' | string;
  chunksCount: number;
  status: 'Active' | 'Inactive' | string;
  lastUpdated: string;
  uploadedBy?: string;
}

export interface DocumentChunkDetail {
  id: string;
  document_id?: string;
  chunk_index: number;
  is_active: boolean;
  title: string;
  section: string;
  page_reference?: string;
  content_text: string;
  has_embedding: boolean;
  doc_metadata?: Record<string, any>;
  created_at?: string;
}

export interface AdminMetrics {
  systemStatus: string;
  databaseConnected: boolean;
  totalDocuments: number;
  totalChunks: number;
  totalPriorArt: number;
  totalIPC: number;
  lowConfidenceQueries: number;
  pendingReviews: number;
  avgResponseTime: string;
  groundedAccuracy: string;
  knowledgeCorpusVersion: string;
  activeJurisdictions: string[];
}

export interface AuditLogEntry {
  id: number;
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  adminEmail: string;
  timestamp: string;
}

export interface ManualIngestFormData {
  title: string;
  authority: string;
  officialAct: string;
  section: string;
  jurisdiction: Jurisdiction | string;
  category: string;
  summary?: string;
  contentText: string;
  gazetteExcerpt?: string;
  pageReference?: string;
  adminEmail?: string;
}

export interface ReindexStep {
  step: number;
  label: string;
  detail: string;
  duration_ms?: number;
}

export interface ReindexResult {
  success: boolean;
  status: string;
  total_items: number;
  duration_seconds: number;
  steps: ReindexStep[];
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'Innovator' | 'Ayush Researcher' | 'IP Professional' | 'Admin';
  organization: string;
  isDemoMode: boolean;
}
