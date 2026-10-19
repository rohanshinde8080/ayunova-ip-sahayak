import os
import sys

# Ensure backend root is in sys.path when imported from root or test environments
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from pgvector.sqlalchemy import Vector

try:
    from app.core.database import Base
except ImportError:
    from core.database import Base

EMBEDDING_DIM = 768

class KnowledgeDocument(Base):
    """
    Master parent record for statutory legal acts, gazette notifications,
    monographs, guidelines, and uploaded policy documents.
    Links to multiple child chunks in ayush_knowledge_vectors.
    """
    __tablename__ = "knowledge_documents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(Text, nullable=False)
    filename = Column(Text, nullable=True)
    file_type = Column(String(32), default="manual")  # 'pdf', 'docx', 'txt', 'json', 'csv', 'manual'
    category = Column(String(64), default="Patents Act")  # 'Patents Act', 'Biodiversity (BDA)', 'Ayush / Drugs & Cosmetics', 'International (WIPO/Nagoya/FDA)', 'Pharmacopoeia', 'TKDL Prior Art'
    authority = Column(Text, nullable=False)
    jurisdiction = Column(String(64), default="India")
    status = Column(String(32), default="Active")  # 'Active', 'Inactive'
    total_chunks = Column(Integer, default=1)
    content_hash = Column(String(64), nullable=True, index=True)
    uploaded_by = Column(String(128), default="admin@ipsakti.ai")
    doc_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AyushKnowledgeVector(Base):
    """Stores official legal statutes, patent rules, TKDL references, and court precedents with embeddings."""
    __tablename__ = "ayush_knowledge_vectors"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), index=True, nullable=True)  # References KnowledgeDocument.id
    chunk_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    title = Column(Text, nullable=False)
    authority = Column(Text, nullable=False)
    section = Column(Text, nullable=False)
    official_act = Column(Text, nullable=False)
    page_reference = Column(Text, nullable=True)
    jurisdiction = Column(String(64), default="India")
    content_text = Column(Text, nullable=False)
    gazette_excerpt = Column(Text, nullable=True)
    verified = Column(Boolean, default=True)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    doc_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class PriorArtVector(Base):
    """Stores documented Ayurvedic formulations from classical texts (TKDL) for novelty & prior art searching."""
    __tablename__ = "prior_art_vectors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String(64), index=True, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    reference_code = Column(String(128), unique=True, index=True, nullable=False)
    formulation_name = Column(Text, nullable=False)
    classical_treatise = Column(Text, nullable=False)
    ingredients = Column(JSON, nullable=False, default=list)
    therapeutic_indications = Column(JSON, nullable=True, default=list)
    tkdl_status = Column(String(64), default="Documented Prior Art")
    content_text = Column(Text, nullable=False)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class IPClassificationVector(Base):
    """Stores International Patent Classification (IPC/CPC/TKDL) classifications with vector representations."""
    __tablename__ = "ip_classification_vectors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    is_active = Column(Boolean, default=True, index=True)
    ipc_code = Column(String(64), index=True, nullable=False)
    category = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    patentability_guideline = Column(Text, nullable=False)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AdminAuditLog(Base):
    """Audit trail recording all data injection, modification, re-indexing, and governance actions."""
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(64), nullable=False, index=True)  # 'INGEST_FILE', 'MANUAL_ENTRY', 'UPDATE_METADATA', 'TOGGLE_STATUS', 'DELETE_DOCUMENT', 'REINDEX_CORPUS'
    target_type = Column(String(64), nullable=False)  # 'KnowledgeDocument', 'AyushKnowledgeVector', 'PriorArtVector', 'IPClassificationVector', 'Corpus'
    target_id = Column(String(128), nullable=True)
    details = Column(JSON, default=dict)
    admin_email = Column(String(128), default="admin@ipsakti.ai")
    created_at = Column(DateTime, default=datetime.utcnow)

class IngestionJob(Base):
    """Tracks asynchronous processing jobs for file ingestion, batch imports, and bulk indexing."""
    __tablename__ = "ingestion_jobs"

    id = Column(String(64), primary_key=True, index=True)
    filename = Column(Text, nullable=True)
    status = Column(String(32), default="PENDING")  # 'PENDING', 'PARSING', 'CHUNKING', 'EMBEDDING', 'COMPLETED', 'FAILED'
    progress_pct = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    chunks_created = Column(Integer, default=0)
    target_corpus = Column(String(64), default="ayush_knowledge_vectors")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


# =====================================================================
# Phase 1: Expanded Digital Knowledge & Patent Schema (PostgreSQL + pgvector)
# =====================================================================

class Patent(Base):
    """Stores official granted and published patent applications digitally."""
    __tablename__ = "patents"

    id = Column(String(64), primary_key=True, index=True)
    patent_number = Column(String(128), unique=True, index=True, nullable=False)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    filing_date = Column(String(32), nullable=True)
    grant_date = Column(String(32), nullable=True)
    jurisdiction = Column(String(64), default="Global")
    assignee = Column(Text, nullable=True)
    inventors = Column(JSON, default=list)
    status = Column(String(64), default="Granted")  # 'Granted', 'Application', 'Revoked', 'Expired'
    classification_ipc = Column(String(128), nullable=True)
    url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    doc_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    claims = relationship("PatentClaim", back_populates="patent", cascade="all, delete-orphan")


class PatentClaim(Base):
    """Stores patent claims with vector embeddings for semantic novelty and infringement retrieval."""
    __tablename__ = "patent_claims"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patent_id = Column(String(64), ForeignKey("patents.id"), nullable=False, index=True)
    claim_number = Column(Integer, default=1)
    claim_text = Column(Text, nullable=False)
    is_independent = Column(Boolean, default=True)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    claim_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    patent = relationship("Patent", back_populates="claims")


class Regulation(Base):
    """Stores authoritative IP Acts, Rules, Gazette notifications, and statutory legal exclusions."""
    __tablename__ = "regulations"

    id = Column(String(64), primary_key=True, index=True)
    act_name = Column(Text, nullable=False)  # e.g., 'The Patents Act, 1970'
    section = Column(String(128), index=True, nullable=False)  # e.g., 'Section 3(p)'
    title = Column(Text, nullable=False)
    authority = Column(Text, nullable=False)  # e.g., 'Indian Patent Office (IPO) / CGPDTM'
    jurisdiction = Column(String(64), default="India")
    official_act = Column(Text, nullable=False)
    gazette_excerpt = Column(Text, nullable=True)
    legal_summary = Column(Text, nullable=False)
    page_reference = Column(Text, nullable=True)
    verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True, index=True)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    reg_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class AyurvedaKnowledge(Base):
    """
    Stores botanical herbs, Sanskrit terminology, active markers, classical treatise
    references, Section 3(p) status, and synergy partners digitally in PostgreSQL.
    Replaces static in-memory registries.
    """
    __tablename__ = "ayurveda_knowledge"

    id = Column(String(64), primary_key=True, index=True)
    common_name = Column(String(128), index=True, nullable=False)
    botanical_name = Column(String(256), index=True, nullable=False)
    sanskrit_name = Column(String(128), nullable=True)
    active_markers = Column(Text, nullable=True)
    treatises = Column(JSON, default=list)
    indications = Column(Text, nullable=True)
    sec3p_status = Column(Text, nullable=False)
    patentable_avenues = Column(Text, nullable=False)
    synergy_partners = Column(JSON, default=list)
    category_class = Column(String(128), nullable=True)
    color_code = Column(String(16), default="#10b981")
    is_active = Column(Boolean, default=True, index=True)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    doc_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class ResearchDocument(Base):
    """Stores peer-reviewed scientific literature, pharmacopoeia monographs, and clinical trials digitally."""
    __tablename__ = "research_documents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(Text, nullable=False)
    authors = Column(JSON, default=list)
    publication = Column(Text, nullable=True)
    doi_or_ref = Column(String(128), index=True, nullable=True)
    year = Column(Integer, nullable=True)
    abstract = Column(Text, nullable=True)
    category = Column(String(64), default="Ayurveda Pharmacology")
    is_active = Column(Boolean, default=True, index=True)
    doc_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    """Stores semantic vector chunks for research documents and pharmacopoeia monographs."""
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String(64), ForeignKey("research_documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, default=0)
    content_text = Column(Text, nullable=False)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    chunk_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("ResearchDocument", back_populates="chunks")


class AgentResearchMemory(Base):
    """
    Stores user/agent multi-turn research portfolio memory digitally in PostgreSQL.
    Replaces device-local markdown files.
    """
    __tablename__ = "agent_research_memory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False, default="default")
    title: Mapped[str] = mapped_column(Text, nullable=False, default="AYUNOVA Intellectual Property Portfolio")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    active_formulations: Mapped[list] = mapped_column(JSON, default=list)
    conflicting_prior_art: Mapped[list] = mapped_column(JSON, default=list)
    compliance_clearances: Mapped[list] = mapped_column(JSON, default=list)
    filing_roadmap: Mapped[list] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# =====================================================================
# Phase 11: Research Paper Intelligence Data Models
# =====================================================================

class ResearchPaper(Base):
    """
    Stores peer-reviewed research papers retrieved from PubMed, Europe PMC,
    OpenAlex, Crossref, and other scholarly repositories.
    """
    __tablename__ = "research_papers"

    id = Column(String(64), primary_key=True, index=True)
    herb_id = Column(String(64), index=True, nullable=False)
    herb_name = Column(String(128), index=True, nullable=False)
    scientific_name = Column(String(256), index=True, nullable=False)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    authors = Column(JSON, default=list)
    journal = Column(Text, nullable=True)
    publication_year = Column(Integer, index=True, nullable=True)
    doi = Column(String(128), index=True, nullable=True)
    pmid = Column(String(64), index=True, nullable=True)
    source = Column(String(64), index=True, default="PubMed")  # 'PubMed', 'Europe PMC', 'OpenAlex', 'Crossref'
    source_id = Column(String(128), nullable=True)
    source_url = Column(Text, nullable=True)
    pdf_url = Column(Text, nullable=True)
    research_type = Column(String(64), index=True, default="Pharmacological Studies")
    keywords = Column(JSON, default=list)
    open_access = Column(Boolean, default=False, index=True)
    citation_count = Column(Integer, default=0)
    relevance_score = Column(Integer, default=100)
    doc_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HerbSynonym(Base):
    """
    Maintains taxonomic and vernacular synonyms for medicinal plants
    used during multi-source research retrieval.
    """
    __tablename__ = "herb_synonyms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    herb_id = Column(String(64), index=True, nullable=False)
    name = Column(String(128), index=True, nullable=False)
    type = Column(String(32), default="botanical")  # 'botanical', 'common', 'sanskrit', 'ayurvedic', 'english'
    source = Column(String(64), default="AYUSH / Botanical Survey of India")
    created_at = Column(DateTime, default=datetime.utcnow)


class HerbResearchCache(Base):
    """
    Caches dynamic research metadata, coverage statistics, category distributions,
    and year trends per herb to optimize scholarly API usage and provide rapid response times.
    """
    __tablename__ = "herb_research_cache"

    id = Column(String(64), primary_key=True, index=True)  # normalized herb slug e.g. 'ashwagandha'
    herb_name = Column(String(128), index=True, nullable=False)
    scientific_name = Column(String(256), nullable=False)
    total_papers = Column(Integer, default=0)
    clinical_count = Column(Integer, default=0)
    open_access_count = Column(Integer, default=0)
    sources_breakdown = Column(JSON, default=dict)
    categories_breakdown = Column(JSON, default=dict)
    year_distribution = Column(JSON, default=dict)
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

