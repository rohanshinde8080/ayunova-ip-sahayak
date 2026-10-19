from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

JurisdictionType = Literal['India', 'International', 'USA', 'EU', 'Japan']
ConfidenceType = Literal['HIGH', 'MEDIUM', 'LOW', 'High', 'Medium', 'Low']

QueryIntent = Literal[
    'Patent Search',
    'Patent Details',
    'Prior Art Search',
    'Patent Comparison',
    'Patentability Assessment',
    'Novelty Assessment',
    'Inventive Step Assessment',
    'Traditional Knowledge / TKDL',
    'Section 3(p) Assessment',
    'Section 3(e) Assessment',
    'Regulatory Guidance',
    'Ayurveda / Formulation Guidance',
    'Botanical Classification / Taxonomy',
    'International IP Comparison',
    'Patent Drafting Guidance',
    'Research / Literature Search',
    'General Explanation',
    'Follow-up question on previous answer',
    'DOCUMENT_DISCLOSURE'
]

QueryComplexity = Literal['SIMPLE', 'MODERATE', 'COMPLEX']

ResponseArchetype = Literal[
    'PATENTABILITY_ASSESSMENT',
    'PATENT_SEARCH_TABLE',
    'COMPARISON_TABLE',
    'CONCEPT_EXPLANATION',
    'STANDARD_USER_FIRST'
]

class PatentRecord(BaseModel):
    publicationNumber: str
    applicationNumber: Optional[str] = "Not Verified"
    patentNumber: Optional[str] = None
    title: str
    applicant: Optional[str] = "Not Verified"
    inventors: Optional[List[str]] = Field(default_factory=list)
    priorityDate: Optional[str] = "Not Verified"
    filingDate: Optional[str] = "Not Verified"
    publicationDate: Optional[str] = "Not Verified"
    grantDate: Optional[str] = "Not Verified"
    legalStatus: Optional[str] = "Current legal status not verified."
    status: Optional[str] = "Application"
    ipcClass: Optional[str] = "A61K"
    abstract: Optional[str] = ""
    verified: bool = False
    claimsExcerpt: Optional[str] = None
    claimsSummary: Optional[str] = None
    relevanceScore: Optional[int] = 85
    jurisdiction: Optional[str] = "India"
    patentFamily: Optional[str] = None
    isFamilyMember: Optional[bool] = False
    url: Optional[str] = None
    sourceUrl: Optional[str] = None

class PriorArtRecord(BaseModel):
    referenceCode: str
    formulationName: str
    classicalTreatise: str
    ingredients: List[str]
    therapeuticIndications: List[str]
    tkdlStatus: str = "Documented Prior Art"
    verified: bool = True

class ConfidenceMetrics(BaseModel):
    level: Literal['HIGH', 'MEDIUM', 'LOW', 'High', 'Medium', 'Low', 'INSUFFICIENT', 'Insufficient'] = 'High'
    evidenceCoverage: float = 90.0
    sourceVerification: Literal['High', 'Medium', 'Low', 'Insufficient'] = 'High'
    disclaimer: str = "Confidence reflects evidence quality, not a legal guarantee."

class SourceCitation(BaseModel):
    id: str
    title: str
    authority: str
    section: str = "General Provisions"
    page: Optional[str] = None
    jurisdiction: str = "India"
    verified: bool = True
    url: Optional[str] = None
    summary: str
    gazetteExcerpt: Optional[str] = None
    similarity: Optional[float] = None
    relevanceScore: Optional[int] = 85
    matchPercentage: Optional[str] = None
    officialAct: Optional[str] = None

class ProcessingStep(BaseModel):
    id: str
    label: str
    status: Literal['pending', 'in-progress', 'completed']

class ChatMessageHistory(BaseModel):
    role: Literal['user', 'assistant', 'system']
    content: str

class ChatQueryRequest(BaseModel):
    query: str
    jurisdiction: Optional[JurisdictionType] = "India"
    language: Optional[str] = "English"
    history: Optional[List[ChatMessageHistory]] = None
    stream: Optional[bool] = False
    use_deep_agent: Optional[bool] = False
    enable_rubric: Optional[bool] = False
    document_id: Optional[str] = None
    source_document_id: Optional[str] = None

class GraphNode(BaseModel):
    id: str
    label: str
    name: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphData(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
    triples: List[str] = Field(default_factory=list)

class StructuredAIAnswer(BaseModel):
    answer: str
    assessment: str
    considerations: List[str]
    regulatory: List[str]
    risks: str
    nextSteps: List[str]
    confidence: Literal['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT']
    evidenceCount: int
    sources: List[SourceCitation]
    detectedLanguage: Optional[str] = None
    detectedJurisdiction: Optional[str] = None
    detectedProductType: Optional[str] = None
    generationSource: Optional[str] = "Neon pgvector Grounded"
    graphContext: Optional[List[str]] = None
    subgraph: Optional[GraphData] = None
    deepAgentTrace: Optional[Dict[str, Any]] = None
    intent: Optional[str] = None
    complexity: Optional[str] = None
    responseArchetype: Optional[str] = None
    confidenceMetrics: Optional[ConfidenceMetrics] = None
    patents: Optional[List[PatentRecord]] = None
    followUpSuggestions: Optional[List[str]] = Field(default_factory=list)
    researchProcess: Optional[str] = None
    source_type: Optional[Literal['DOCUMENT', 'EXTERNAL_AUTHORITY', 'DOCUMENT + EXTERNAL_AUTHORITY', 'NONE']] = "DOCUMENT"
    evidence: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    auditTrace: Optional[Dict[str, Any]] = None

class RAGTelemetryResponse(BaseModel):
    status: str
    database: str
    activeVectorsCount: int
    activeStatutesCount: int
    activePriorArtCount: int
    indexType: str
    synthesisEngine: str
    geminiConfigured: bool
    graphDatabase: Optional[str] = "Neo4j Graph Database"
    graphConnected: Optional[bool] = False
    graphNodesCount: Optional[int] = 0
    graphRelationshipsCount: Optional[int] = 0
    tavilyConfigured: Optional[bool] = False
    tavilyStatus: Optional[str] = "OFFLINE"
    deepAgentAvailable: Optional[bool] = True
    deepAgentTools: Optional[List[str]] = Field(default_factory=list)
    deepAgentSubagents: Optional[List[str]] = Field(default_factory=list)
    deepAgentSkills: Optional[List[str]] = Field(default_factory=list)

class CypherQueryRequest(BaseModel):
    query: str
    parameters: Optional[Dict[str, Any]] = None

class GraphStatsResponse(BaseModel):
    connected: bool
    status: str
    total_nodes: int
    total_relationships: int
    labels: Dict[str, int] = Field(default_factory=dict)
    relationship_types: Dict[str, int] = Field(default_factory=dict)
    server_version: Optional[str] = None
    dbms_id: Optional[str] = None

class ProductClassificationInput(BaseModel):
    name: str
    ingredients: str
    purpose: str
    dosageForm: str
    manufacturingMethod: str
    targetMarket: str
    country: Optional[JurisdictionType] = "India"

class ProductClassificationResult(BaseModel):
    category: str
    description: str
    ipConsiderations: List[str]
    regulatoryPathway: List[str]
    traditionalKnowledgeScreening: str
    confidence: Literal['High', 'Medium', 'Low']
    applicableSchedules: List[str]
    recommendedForms: List[str]
    sources: List[SourceCitation]

class IPAdvisorInput(BaseModel):
    innovationName: Optional[str] = None
    description: str
    novelFeature: str
    category: Optional[Literal['Formulation', 'Process', 'Composition', 'Brand', 'Traditional Knowledge', 'Other']] = 'Formulation'
    jurisdiction: Optional[JurisdictionType] = "India"
    # Backward compatibility aliases
    innovationTitle: Optional[str] = None
    formulationType: Optional[str] = None

class IPRoute(BaseModel):
    route: str
    relevance: str
    potentialConcern: str
    recommendedNextStep: str
    applicableLaw: str
    sources: List[str]

class PriorArtSimilarity(BaseModel):
    id: str
    document: str
    source: str
    similarityPercentage: int
    relevantTopic: str
    similarityNotes: str
    publicationDate: str

class IPAdvisorResult(BaseModel):
    routes: List[IPRoute]
    priorArtFindings: List[PriorArtSimilarity]
    recommendationSummary: str
    confidenceScore: int
    primaryBarConcern: Optional[str] = None

class DocumentAnalysisResult(BaseModel):
    documentName: str
    documentType: str
    detectedIngredients: List[str]
    detectedClaims: List[str]
    patentBarSection3pRisk: Literal['CRITICAL', 'MODERATE', 'LOW']
    synergyRequirementSection3e: str
    nbaBiodiversityActCompliance: str
    fdaAyushLicensingForm: str
    keyFindings: List[str]
    suggestedModifications: List[str]
    citations: List[SourceCitation]

# --- Admin Ingestion & Governance Schemas ---

class ManualIngestRequest(BaseModel):
    title: str = Field(..., description="Title of the statutory provision, gazette, or guideline")
    authority: str = Field(..., description="Issuing authority e.g. Indian Patent Office, Ministry of Ayush")
    officialAct: str = Field(..., description="Governing Act e.g. The Patents Act, 1970")
    section: str = Field(..., description="Section or Rule identifier e.g. Section 3(p), Rule 158B")
    jurisdiction: Optional[str] = "India"
    category: Optional[str] = "Patents Act"
    summary: Optional[str] = None
    contentText: str = Field(..., description="Full legal text of the provision")
    gazetteExcerpt: Optional[str] = None
    pageReference: Optional[str] = None
    adminEmail: Optional[str] = "admin@ipsakti.ai"

class DocumentListItem(BaseModel):
    id: str
    title: str
    filename: Optional[str] = None
    fileType: Optional[str] = "manual"
    category: str
    authority: str
    jurisdiction: str
    chunksCount: int
    status: str
    lastUpdated: str
    uploadedBy: Optional[str] = "admin@ipsakti.ai"

class DocumentDetailResponse(BaseModel):
    document: DocumentListItem
    chunks: List[Dict[str, Any]]

class AdminMetricsResponse(BaseModel):
    systemStatus: str
    databaseConnected: bool
    totalDocuments: int
    totalChunks: int
    totalPriorArt: int
    totalIPC: int
    lowConfidenceQueries: int
    pendingReviews: int
    avgResponseTime: str
    groundedAccuracy: str
    knowledgeCorpusVersion: str
    activeJurisdictions: List[str]

class AuditLogItem(BaseModel):
    id: int
    action: str
    targetType: str
    targetId: Optional[str] = None
    details: Dict[str, Any]
    adminEmail: str
    timestamp: str

class ReindexResponse(BaseModel):
    success: bool
    status: str
    total_items: int
    duration_seconds: float
    steps: List[Dict[str, Any]]
    timestamp: str
