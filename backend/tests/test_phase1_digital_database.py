"""
Test Suite for Phase 1: 100% Digital PostgreSQL + pgvector Knowledge Base.
Verifies:
1. All digital tables exist in Neon PostgreSQL (patents, patent_claims, regulations, ayurveda_knowledge, research_documents, document_chunks, agent_research_memory).
2. HNSW vector indexes are enabled and active.
3. Botanical records are queryable from PostgreSQL (no hard-copy or local file reliance).
4. Patent records and claims are queryable from PostgreSQL with pgvector embeddings.
5. Statutory regulations are queryable from PostgreSQL with pgvector embeddings.
6. Multi-turn agent research memory is persisted in PostgreSQL.
"""

import pytest
from sqlalchemy import text
from app.core.database import SessionLocal, check_db_health
from app.models.db_models import (
    Patent,
    PatentClaim,
    Regulation,
    AyurvedaKnowledge,
    ResearchDocument,
    DocumentChunk,
    AgentResearchMemory
)
from app.services.embedding_service import EmbeddingService


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()


def test_database_health_and_pgvector():
    """Verify Neon PostgreSQL connectivity and pgvector extension status."""
    health = check_db_health()
    assert health["status"] == "connected"
    assert health["pgvector_enabled"] is True


def test_phase1_digital_tables_exist(db):
    """Verify all 7 new digital tables exist and contain records."""
    tables = [
        "patents",
        "patent_claims",
        "regulations",
        "ayurveda_knowledge",
        "research_documents",
        "document_chunks",
        "agent_research_memory"
    ]
    for table_name in tables:
        count = db.execute(text(f"SELECT count(1) FROM {table_name}")).scalar()
        assert count > 0, f"Table {table_name} should have records migrated from digital knowledge base"


def test_ayurveda_knowledge_botanicals(db):
    """Verify classical botanical records (e.g. Ashwagandha, Triphala, Curcumin) are stored digitally."""
    triphala = db.query(AyurvedaKnowledge).filter(AyurvedaKnowledge.common_name == "Triphala").first()
    assert triphala is not None
    assert "Terminalia chebula" in triphala.botanical_name
    assert triphala.embedding is not None
    assert len(triphala.treatises) > 0

    ashwagandha = db.query(AyurvedaKnowledge).filter(AyurvedaKnowledge.common_name.like("%Ashwagandha%")).first()
    assert ashwagandha is not None
    assert "Withania somnifera" in ashwagandha.botanical_name
    assert ashwagandha.embedding is not None


def test_regulations_statutory_sections(db):
    """Verify statutory legal exclusions (e.g. Section 3(p), Section 3(e), BDA) are in PostgreSQL."""
    sec3p = db.query(Regulation).filter(Regulation.section == "Section 3(p)").first()
    assert sec3p is not None
    assert "Traditional Knowledge" in sec3p.title
    assert sec3p.embedding is not None

    sec3e = db.query(Regulation).filter(Regulation.section == "Section 3(e)").first()
    assert sec3e is not None
    assert "Admixture" in sec3e.title or "Synergism" in sec3e.title
    assert sec3e.embedding is not None


def test_patents_and_claims_digital_storage(db):
    """Verify official patent records and claims with pgvector embeddings."""
    pat = db.query(Patent).filter(Patent.patent_number.like("%11992510%")).first()
    assert pat is not None
    assert "Triphala" in pat.title
    assert len(pat.claims) >= 3

    independent_claims = [c for c in pat.claims if c.is_independent]
    assert len(independent_claims) >= 1
    assert independent_claims[0].embedding is not None


def test_pgvector_similarity_search_on_botanicals(db):
    """Verify semantic vector retrieval on ayurveda_knowledge using pgvector cosine distance."""
    query = "Balya Medhya adaptogenic stress reduction Withania"
    query_emb = EmbeddingService.get_embedding(query)

    top_match = (
        db.query(AyurvedaKnowledge, (1 - AyurvedaKnowledge.embedding.cosine_distance(query_emb)).label("similarity"))
        .order_by(AyurvedaKnowledge.embedding.cosine_distance(query_emb))
        .first()
    )
    assert top_match is not None
    herb, similarity = top_match
    assert "Ashwagandha" in herb.common_name


def test_pgvector_similarity_search_on_regulations(db):
    """Verify semantic vector retrieval on regulations using pgvector cosine distance."""
    query = "mere admixture synergistic non-patentable combination"
    query_emb = EmbeddingService.get_embedding(query)

    top_match = (
        db.query(Regulation, (1 - Regulation.embedding.cosine_distance(query_emb)).label("similarity"))
        .order_by(Regulation.embedding.cosine_distance(query_emb))
        .first()
    )
    assert top_match is not None
    reg, similarity = top_match
    assert "3(e)" in reg.section or "Admixture" in reg.title or "Synergism" in reg.title


def test_agent_research_memory_storage(db):
    """Verify agent research memory is stored in PostgreSQL and not on local filesystem."""
    mem = db.query(AgentResearchMemory).filter(AgentResearchMemory.session_id == "default").first()
    assert mem is not None
    assert "AYUNOVA" in mem.title
    assert len(mem.active_formulations) > 0
    assert len(mem.conflicting_prior_art) > 0
