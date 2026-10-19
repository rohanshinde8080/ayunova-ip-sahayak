"""
Phase 4 Test Suite: Responsive Output Formatting & Synthesis Engines
Validates Section 4, Section 5, Section 7, Section 8, Section 9, Section 11, Section 12:
1. Patentability assessment archetype: Short Answer -> Why -> What You Should Check -> Recommended Next Step -> Grounded Evidence.
2. Patent search table archetype: Markdown table with 6 columns -> Key Pattern -> Grounded Evidence.
3. Patent comparison table archetype: Comparison table first -> Key Takeaways -> Grounded Evidence.
4. Concept question archetype: What is X -> Why it matters -> Example -> Grounded Evidence.
5. Standard user-first archetype: Direct Answer -> Key Findings -> What You Should Do -> Recommended Tools.
6. Patent deduplication and strict verification in RAG outputs.
7. Grounded confidence metrics (evidence quality, coverage %, disclaimer).
8. Follow-up suggestions strictly capped at <= 2.
9. Research process summary: "Search → Retrieve → Verify → Compare → Answer".
10. Deep agent minimal research rule for simple queries.
"""

import os
import sys
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.rag_engine import AyushRAGEngine
from app.services.deep_agent_service import AyushDeepAgentService
from app.models.schemas import StructuredAIAnswer, QueryComplexity, ResponseArchetype


def test_patentability_archetype_synthesis():
    """Verify patentability assessment archetype structure."""
    query = "Can I patent an Ayurvedic Triphala and Curcumin synergistic blend in India?"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "PATENTABILITY_ASSESSMENT"
    
    # Verify exact Section 4 header sequence
    ans_text = answer.answer
    assert "### Short Answer" in ans_text
    assert "### Why" in ans_text
    assert "### What You Should Check" in ans_text
    assert "### Recommended Next Step" in ans_text
    assert "### Grounded Evidence" in ans_text

    # Verify no Executive Summary boilerplate
    assert "Executive Summary" not in ans_text
    assert "Here is the latest intelligence" not in ans_text


def test_patent_search_archetype_table():
    """Verify patent search archetype produces the Section 4 Markdown table."""
    query = "Search patents related to Triphala and probiotic formulations"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "PATENT_SEARCH_TABLE"
    
    ans_text = answer.answer
    assert "### Found Patents" in ans_text
    # Verify 6-column header
    assert "| Patent | Title | Applicant | Priority | Status | Jurisdiction |" in ans_text
    assert ("|---|---|---|---|---|---|" in ans_text) or ("| --- | --- | --- | --- | --- | --- |" in ans_text)
    assert "### Key Pattern" in ans_text
    assert "### Grounded Evidence" in ans_text

    # Verify patents field is populated
    assert answer.patents is not None
    assert len(answer.patents) > 0


def test_comparison_table_archetype():
    """Verify comparison table archetype presents table first without intro."""
    query = "Compare Triphala classical formulation with novel probiotic Triphala formulations"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "COMPARISON_TABLE"

    ans_text = answer.answer
    assert "### Comparison:" in ans_text
    assert "| Evaluation Parameter |" in ans_text
    assert "### Key Takeaways" in ans_text
    assert "### Grounded Evidence" in ans_text


def test_concept_explanation_archetype():
    """Verify concept question explains concept before solution."""
    query = "What is Section 3(p) of the Indian Patents Act?"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "CONCEPT_EXPLANATION"

    ans_text = answer.answer
    assert "### What is Section 3(p)" in ans_text
    assert "### Why it Matters for You" in ans_text
    assert "### Example" in ans_text
    assert "### Grounded Evidence" in ans_text


def test_standard_user_first_archetype():
    """Verify standard user-first format for general regulatory queries."""
    query = "What are the regulatory guidelines for Ayurvedic cosmetic exports?"
    answer = AyushRAGEngine.process_chat_query(query)

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.responseArchetype == "STANDARD_USER_FIRST"

    ans_text = answer.answer
    assert "### Direct Answer" in ans_text
    assert "### Key Findings / Solution" in ans_text
    assert "### What You Should Do" in ans_text
    assert "### Recommended Tools" in ans_text
    assert "### Grounded Evidence" in ans_text


def test_patent_deduplication_and_verification_in_output():
    """Verify patents in response are deduplicated, verified, and unverified fields handled safely."""
    query = "Search patents for Ashwagandha extraction"
    answer = AyushRAGEngine.process_chat_query(query)

    assert answer.patents is not None
    assert len(answer.patents) > 0

    # Ensure zero duplicate publication numbers
    pub_nums = [p.publicationNumber for p in answer.patents]
    assert len(pub_nums) == len(set(pub_nums))

    # Ensure no None unverified attributes
    for p in answer.patents:
        assert p.applicant is not None
        assert p.priorityDate is not None
        assert p.legalStatus is not None


def test_confidence_metrics_in_output():
    """Verify ConfidenceMetrics reflects evidence quality and includes disclaimer."""
    query = "Can I patent an Ayurvedic Triphala and Curcumin synergistic blend in India?"
    answer = AyushRAGEngine.process_chat_query(query)

    metrics = answer.confidenceMetrics
    assert metrics is not None
    assert metrics.level in ["High", "Medium", "Low", "HIGH", "MEDIUM", "LOW"]
    assert 0.0 <= metrics.evidenceCoverage <= 100.0
    assert metrics.sourceVerification in ["High", "Medium", "Low"]
    assert "Confidence reflects evidence quality" in metrics.disclaimer


def test_follow_up_suggestions_strictly_capped_at_2():
    """Verify follow-up suggestions are strictly capped at maximum 2 options."""
    test_queries = [
        "Can I patent an Ayurvedic Triphala formulation?",
        "Search patents for Ashwagandha",
        "What is Section 3(e)?",
        "Hello AYUNOVA"
    ]

    for q in test_queries:
        answer = AyushRAGEngine.process_chat_query(q)
        assert len(answer.followUpSuggestions) <= 2, f"Query '{q}' exceeded 2 follow-ups: {answer.followUpSuggestions}"


def test_research_process_summary():
    """Verify clean research process summary is present and conceals raw chain-of-thought."""
    query = "Evaluate patentability of Curcumin with Piperine"
    answer = AyushRAGEngine.process_chat_query(query)

    assert answer.researchProcess == "Search → Retrieve → Verify → Compare → Answer"


def test_deep_agent_minimal_research_rule():
    """Verify DeepAgent applies minimal research rule for simple concept queries."""
    query = "What is Section 3(p)?"
    routing = AyushDeepAgentService._detect_active_subagents_and_tools(query)

    assert routing["complexity"] == "SIMPLE"
    assert len(routing["subagents"]) <= 1  # Minimal subagent invocation
    assert "lookup_statutory_section" in routing["tools"]

    answer = AyushDeepAgentService.process_deep_agent_query(query)
    assert answer.researchProcess == "Search → Retrieve → Verify → Compare → Answer"
    assert len(answer.followUpSuggestions) <= 2
    # Verify trace does not leak raw prompt text
    trace = answer.deepAgentTrace
    assert trace is not None
    assert "subagentsCalled" in trace
    assert "toolsQueried" in trace
    assert trace["researchProcess"] == "Search → Retrieve → Verify → Compare → Answer"
