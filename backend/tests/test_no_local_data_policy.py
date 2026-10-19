"""
Test Suite: Critical Data Source Policy — No Hard Copy / Local Data Compliance
Validates:
1. Zero hardcoded knowledge datasets or dictionary registries in runtime source code.
2. PostgreSQL + pgvector is the 100% authoritative knowledge repository.
3. Strict "No-Answer-Without-Retrieval" gate returns exact policy refusal for ungrounded queries.
4. Grounded Evidence Block traceability (Source: PostgreSQL + pgvector, Database Status: Verified).
5. Segregation of Live External Evidence from internal database evidence.
6. Database-backed Agent Research Memory persistence.
"""

import os
import sys
import ast
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.db_models import (
    AyurvedaKnowledge,
    Regulation,
    Patent,
    PatentClaim,
    AgentResearchMemory
)
from app.services.botanical_service import BotanicalService
from app.services.rag_engine import AyushRAGEngine
from app.services.deep_agent_service import AyushDeepAgentService
from app.agents.memory import read_portfolio_memory, append_portfolio_entry
from app.models.schemas import SourceCitation, StructuredAIAnswer


# ============================================================================
# 1. Zero Hardcoded Data in Runtime Code
# ============================================================================

def test_zero_hardcoded_knowledge_in_runtime_code():
    """Inspects runtime source code to verify complete eradication of static datasets."""
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    runtime_files = [
        os.path.join(backend_dir, "app", "services", "rag_engine.py"),
        os.path.join(backend_dir, "app", "services", "deep_agent_service.py"),
        os.path.join(backend_dir, "app", "services", "botanical_service.py"),
        os.path.join(backend_dir, "app", "agents", "tools.py"),
        os.path.join(backend_dir, "app", "agents", "memory.py"),
        os.path.join(backend_dir, "app", "api", "endpoints", "sources.py"),
    ]

    for filepath in runtime_files:
        assert os.path.exists(filepath), f"File {filepath} must exist"
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Ensure no AYUSH_BOTANICAL_REGISTRY definition
        assert "AYUSH_BOTANICAL_REGISTRY = {" not in content, (
            f"Static dictionary AYUSH_BOTANICAL_REGISTRY found in {filepath}"
        )

        # 2. Ensure no imports from app.data
        assert "from app.data" not in content and "import app.data" not in content, (
            f"Prohibited import from app.data found in {filepath}"
        )

        # 3. Ensure no static OFFICIAL_SOURCES dictionary lookup in rag_engine.py
        if "rag_engine.py" in filepath:
            assert "OFFICIAL_SOURCES[" not in content, (
                f"Static OFFICIAL_SOURCES lookup found in {filepath}"
            )


# ============================================================================
# 2. PostgreSQL + pgvector Knowledge Base Verification
# ============================================================================

def test_postgresql_models_populated():
    """Verifies that the digital knowledge base in PostgreSQL contains required records."""
    db = SessionLocal()
    try:
        # Check AyurvedaKnowledge
        botanical_count = db.query(AyurvedaKnowledge).count()
        assert botanical_count >= 5, f"Expected at least 5 botanicals in DB, found {botanical_count}"
        
        ashwa = db.query(AyurvedaKnowledge).filter(AyurvedaKnowledge.common_name.ilike("%Ashwagandha%")).first()
        assert ashwa is not None
        assert "Withania somnifera" in ashwa.botanical_name
        assert ashwa.embedding is not None

        # Check Regulation
        reg_count = db.query(Regulation).count()
        assert reg_count >= 4, f"Expected at least 4 regulations in DB, found {reg_count}"
        
        sec3p = db.query(Regulation).filter(Regulation.section == "Section 3(p)").first()
        assert sec3p is not None
        assert "Traditional Knowledge" in sec3p.title or "traditional knowledge" in sec3p.legal_summary.lower()

        # Check Patents
        pat_count = db.query(Patent).count()
        assert pat_count >= 1, f"Expected at least 1 reference patent in DB, found {pat_count}"

    finally:
        db.close()


def test_botanical_service_database_retrieval():
    """Verifies BotanicalService queries PostgreSQL dynamically."""
    # Test lookup by name
    herb = BotanicalService.get_botanical_by_name("Triphala")
    assert herb is not None
    assert herb["common_name"] == "Triphala"
    assert "Charaka Samhita" in str(herb["treatises"])

    # Test detection in natural language query
    matches = BotanicalService.detect_botanicals_in_query("How do I patent a Curcumin and Piperine formulation?")
    assert len(matches) >= 1
    matched_names = [m["common_name"].lower() for m in matches]
    assert any("curcumin" in n or "turmeric" in n or "haridra" in n for n in matched_names)


# ============================================================================
# 3. Strict Evidence Gate & Refusal on Insufficient Evidence
# ============================================================================

def test_evidence_gate_refusal_for_unverified_domain_query():
    """
    Verifies that domain queries with ZERO matching database records and no web search
    strictly return the policy refusal message without hallucination.
    """
    from unittest.mock import patch

    fictional_query = "Can I patent FictionalPlantX999 extract with nonexistent properties?"
    with patch("app.services.rag_engine.search_web_tavily_structured", return_value={"results": [], "answer": ""}), \
         patch("app.services.rag_engine.VectorService.search_hybrid_corpus", return_value=[]), \
         patch("app.services.graph_service.GraphService.query_graph_context", return_value={"triples": [], "nodes": [], "edges": []}):
        answer = AyushRAGEngine.process_chat_query(fictional_query)

    assert isinstance(answer, StructuredAIAnswer)
    # Must trigger the strict evidence gate refusal
    assert "Insufficient verified information is available in the current IP-SAKTI knowledge base." in answer.answer
    assert answer.confidence == "INSUFFICIENT"
    assert answer.generationSource == "IP-SAKTI Database-First Evidence Gate"


# ============================================================================
# 4. Grounded Evidence Block Traceability
# ============================================================================

def test_grounded_evidence_block_traceability():
    """Verifies that Grounded Evidence is formatted with PostgreSQL + pgvector and Verified status."""
    query = "What are the patentability requirements for Ashwagandha under Section 3(p)?"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    ans_text = answer.answer

    # Must contain Grounded Evidence header
    assert "### Grounded Evidence" in ans_text
    # Must declare PostgreSQL + pgvector source
    assert "Source: PostgreSQL + pgvector" in ans_text
    # Must declare Database Status: Verified
    assert "Database Status: Verified" in ans_text
    assert "Verification: Verified" in ans_text


# ============================================================================
# 5. Live External Evidence Segregation
# ============================================================================

def test_live_external_evidence_segregated_from_database_evidence():
    """Verifies that web/external citations are segregated under ### Live External Evidence."""
    citations = [
        SourceCitation(
            id="pg-1",
            title="Patents Act, 1970 (Section 3(p))",
            authority="Indian Patent Office (IPO)",
            section="Section 3(p)",
            jurisdiction="India",
            verified=True,
            summary="Traditional knowledge exclusions."
        ),
        SourceCitation(
            id="web-1",
            title="Live USPTO Record for Herbal Extraction",
            authority="Global Patent & Science Web (Tavily)",
            section="Live Patent / Gazette Record",
            jurisdiction="United States",
            verified=True,
            url="https://patents.google.com/patent/US11992510B2/en",
            summary="Synergistic compositions of Triphala and probiotics."
        )
    ]

    formatted = AyushRAGEngine._format_archetype_answer(
        archetype="PATENTABILITY_ASSESSMENT",
        answer_text="Triphala formulation assessment.",
        assessment_text="Evaluated against Section 3(p) and Section 3(e).",
        considerations=["Synergism required."],
        next_steps=["File Form III."],
        citations=citations,
        patents=[],
        query="Can I patent Triphala?"
    )

    # Must contain BOTH separate headers
    assert "### Grounded Evidence" in formatted
    assert "### Live External Evidence" in formatted

    # Grounded Evidence must reference PostgreSQL
    assert "Source: PostgreSQL + pgvector" in formatted

    # Live External Evidence must reference Live Web Search
    assert "Source: Live Web Search" in formatted
    assert "Status: Live Verified" in formatted


# ============================================================================
# 6. Database-Backed Agent Research Memory
# ============================================================================

def test_database_agent_research_memory():
    """Verifies that agent research memory persists to PostgreSQL agent_research_memory table."""
    test_session = "test_compliance_session"
    
    # Read initial memory (auto-creates in PostgreSQL)
    memory_content = read_portfolio_memory(session_id=test_session)
    assert "# AYUNOVA Intellectual Property Portfolio" in memory_content

    # Append entry
    test_note = "Compliance Test: Verified 100% database-driven memory."
    updated_memory = append_portfolio_entry("Multi-Turn Filing Roadmap", test_note, session_id=test_session)
    assert test_note in updated_memory

    # Verify directly in PostgreSQL
    db = SessionLocal()
    try:
        record = db.query(AgentResearchMemory).filter(AgentResearchMemory.session_id == test_session).first()
        assert record is not None
        assert test_note in record.content
        # Clean up test session
        db.delete(record)
        db.commit()
    finally:
        db.close()
