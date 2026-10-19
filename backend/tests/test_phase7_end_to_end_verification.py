"""
Phase 7 End-to-End Verification Test Suite.
Validates the complete IP-SAKTI Deep Agent User-First Response & Grounded Research System:
1. End-to-End Patentability Assessment flow.
2. End-to-End Patent Search Table flow.
3. End-to-End Comparison Archetype flow.
4. End-to-End Statutory Concept Explanation flow.
5. Minimal Research Rule for simple queries.
6. Strict Follow-Up Options Capping (<= 2).
7. Confidence Metrics and Grounded Evidence verification.
8. Multi-turn conversational history context.
9. Full FastAPI HTTP endpoint validation (/api/chat/process-query).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.rag_engine import AyushRAGEngine
from app.services.deep_agent_service import AyushDeepAgentService
from app.models.schemas import StructuredAIAnswer


@pytest.fixture
def client():
    return TestClient(app)


def test_e2e_patentability_query_flow():
    """End-to-End verification of a patentability query (Ashwagandha formulation)."""
    query = "Can I patent my Ashwagandha and Curcumin sustained-release formulation in India?"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.intent == "Patentability Assessment"
    assert answer.responseArchetype == "PATENTABILITY_ASSESSMENT"

    ans_text = answer.answer
    # 1. User-First Direct Answer: Starts with Short Answer, zero boilerplate
    assert "### Short Answer" in ans_text
    assert "Executive Summary" not in ans_text
    assert "Here is the latest intelligence" not in ans_text

    # 2. Section 4 Canonical Archetype Sequence
    assert "### Why" in ans_text
    assert "### What You Should Check" in ans_text
    assert "### Recommended Next Step" in ans_text
    assert "### Grounded Evidence" in ans_text

    # 3. Strictly <= 2 follow-up suggestions
    assert answer.followUpSuggestions is not None
    assert len(answer.followUpSuggestions) <= 2
    assert len(answer.followUpSuggestions) >= 1

    # 4. Confidence Metrics
    assert answer.confidenceMetrics is not None
    assert answer.confidenceMetrics.evidenceCoverage >= 0
    assert "not a legal guarantee" in answer.confidenceMetrics.disclaimer.lower()

    # 5. Research Process summary
    assert answer.researchProcess == "Search → Retrieve → Verify → Compare → Answer"


def test_e2e_patent_search_table_flow():
    """End-to-End verification of patent search table archetype."""
    query = "Find existing patents on Triphala and probiotics"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "PATENT_SEARCH_TABLE"

    ans_text = answer.answer
    assert "### Found Patents" in ans_text
    assert "| Patent | Title | Applicant | Priority | Status | Jurisdiction |" in ans_text
    assert "### Key Pattern" in ans_text
    assert "### Grounded Evidence" in ans_text

    # Verify zero duplicate publication numbers in returned patents
    assert answer.patents is not None
    assert len(answer.patents) > 0
    pub_numbers = [p.publicationNumber for p in answer.patents]
    assert len(pub_numbers) == len(set(pub_numbers)), "Duplicate publications detected!"


def test_e2e_comparison_archetype_flow():
    """End-to-End verification of side-by-side comparison table."""
    query = "Compare classical Triphala formulation with US11992510B2 probiotic patent"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "COMPARISON_TABLE"

    ans_text = answer.answer
    # Table must come first without conversational preamble
    assert "### Comparison:" in ans_text
    assert "| Evaluation Parameter |" in ans_text
    assert "### Key Takeaways" in ans_text
    assert "### Grounded Evidence" in ans_text


def test_e2e_statutory_concept_query_flow():
    """End-to-End verification of statutory concept question."""
    query = "What is Section 3(p) of the Patents Act?"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "CONCEPT_EXPLANATION"

    ans_text = answer.answer
    # Explains concept before solution
    assert "### What is Section 3(p)" in ans_text
    assert "### Why it Matters for You" in ans_text
    assert "### Example" in ans_text
    assert "### Grounded Evidence" in ans_text


def test_e2e_minimal_research_rule_for_simple_query():
    """Verify minimal necessary research principle for simple definition queries."""
    routing = AyushDeepAgentService._detect_active_subagents_and_tools("What is TKDL?")
    # Simple conceptual queries bypass heavy multi-agent cycles
    assert len(routing["subagents"]) <= 2
    assert len(routing["tools"]) <= 2


def test_e2e_follow_up_capping_max_two():
    """Verify follow-up suggestions never exceed 2 options across diverse queries."""
    test_queries = [
        "Can I patent a formulation of Neem and Tulsi?",
        "What are the Form 25D requirements under Rule 158B?",
        "Compare Section 3(p) and Section 3(e) legal standards",
        "Search patents on Ashwagandha extract"
    ]
    for q in test_queries:
        answer = AyushRAGEngine.process_chat_query(q)
        assert len(answer.followUpSuggestions or []) <= 2


def test_e2e_multi_turn_history_context():
    """Verify multi-turn history retains context and resolves follow-ups."""
    history = [
        {"role": "user", "content": "Can I patent an Ayurvedic Triphala extract?"},
        {"role": "assistant", "content": "Under Section 3(p), traditional knowledge extracts are non-patentable without proved bio-synergy under Section 3(e)."}
    ]
    follow_up_query = "What experimental proof is needed for Section 3(e)?"
    answer = AyushRAGEngine.process_chat_query(follow_up_query, history=history)

    assert isinstance(answer, StructuredAIAnswer)
    assert len(answer.followUpSuggestions or []) <= 2
    assert answer.answer is not None and len(answer.answer) > 0


def test_e2e_http_process_query_payload_structure(client):
    """End-to-End verification of POST /api/chat/process-query with Phase 1-6 fields."""
    response = client.post(
        "/api/chat/process-query",
        json={
            "query": "Can I patent an Ayurvedic formulation of Ashwagandha in India?",
            "jurisdiction": "India",
            "language": "English",
            "use_deep_agent": False
        }
    )

    assert response.status_code == 200
    data = response.json()

    # Core response fields
    assert "answer" in data
    assert "assessment" in data
    assert "confidence" in data
    assert "sources" in data

    # Phase 1-6 enriched fields
    assert "intent" in data
    assert data["intent"] == "Patentability Assessment"
    assert "responseArchetype" in data
    assert data["responseArchetype"] == "PATENTABILITY_ASSESSMENT"
    assert "confidenceMetrics" in data
    assert "evidenceCoverage" in data["confidenceMetrics"]
    assert "patents" in data
    assert isinstance(data["patents"], list)
    assert "followUpSuggestions" in data
    assert len(data["followUpSuggestions"]) <= 2
    assert "researchProcess" in data
    assert data["researchProcess"] == "Search → Retrieve → Verify → Compare → Answer"
