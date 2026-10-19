"""
Test suite for Phase 1: IP-SAKTI 17-Intent Classification Engine,
Response Archetype Routing, and Enhanced Schemas.
"""

import pytest
from app.services.intent_classifier import IntentClassifier, CANONICAL_INTENTS
from app.models.schemas import (
    QueryIntent,
    PatentRecord,
    ConfidenceMetrics,
    StructuredAIAnswer,
    SourceCitation
)


def test_canonical_intents_count():
    """Verify canonical intents are defined."""
    assert len(CANONICAL_INTENTS) == 19
    expected_intents = [
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
    assert set(CANONICAL_INTENTS) == set(expected_intents)


def test_intent_classification_patentability():
    """Test Patentability Assessment intent and archetype."""
    query = "Can I patent my Ashwagandha formulation?"
    res = IntentClassifier.classify_intent(query)
    assert res["intent"] == "Patentability Assessment"
    assert res["archetype"] == "PATENTABILITY_ASSESSMENT"
    assert res["complexity"] in ["MODERATE", "COMPLEX"]
    assert res["needs_deep_agent"] is True
    assert len(res["follow_up_suggestions"]) <= 2


def test_intent_classification_patent_search():
    """Test Patent Search intent and table archetype."""
    query = "Find patents on Ashwagandha"
    res = IntentClassifier.classify_intent(query)
    assert res["intent"] == "Patent Search"
    assert res["archetype"] == "PATENT_SEARCH_TABLE"
    assert res["complexity"] == "COMPLEX"
    assert res["needs_deep_agent"] is True
    assert any("Indian Patent Public Search" in t for t in res["recommended_tools"])
    assert len(res["follow_up_suggestions"]) <= 2


def test_intent_classification_patent_comparison():
    """Test Patent Comparison intent and comparison table archetype."""
    query = "Compare US11992510 with EP436257 claims"
    res = IntentClassifier.classify_intent(query)
    assert res["intent"] == "Patent Comparison"
    assert res["archetype"] == "COMPARISON_TABLE"
    assert res["complexity"] == "COMPLEX"
    assert res["needs_deep_agent"] is True
    assert len(res["follow_up_suggestions"]) <= 2


def test_intent_classification_section_3p_concept():
    """Test Section 3(p) simple concept question routing to CONCEPT_EXPLANATION."""
    query = "What is Section 3(p)?"
    res = IntentClassifier.classify_intent(query)
    assert res["intent"] == "Section 3(p) Assessment"
    assert res["archetype"] == "CONCEPT_EXPLANATION"
    assert res["complexity"] == "SIMPLE"
    # Minimal research principle: simple explanation does not require heavy deep agent
    assert res["needs_deep_agent"] is False
    assert len(res["follow_up_suggestions"]) <= 2


def test_intent_classification_section_3e():
    """Test Section 3(e) Assessment."""
    query = "How to prove synergy under Section 3(e) with Combination Index CI < 1.0?"
    res = IntentClassifier.classify_intent(query)
    assert res["intent"] == "Section 3(e) Assessment"
    assert res["archetype"] == "PATENTABILITY_ASSESSMENT"
    assert len(res["follow_up_suggestions"]) <= 2


def test_intent_classification_regulatory():
    """Test Regulatory Guidance (Rule 158B / Form 25D)."""
    query = "How do I apply for Form 25D manufacturing license under Rule 158B?"
    res = IntentClassifier.classify_intent(query)
    assert res["intent"] == "Regulatory Guidance"
    assert res["archetype"] == "STANDARD_USER_FIRST"
    assert len(res["follow_up_suggestions"]) <= 2


def test_intent_classification_general_explanation():
    """Test General Explanation concept intro."""
    query = "What is prior art in Indian patent law?"
    res = IntentClassifier.classify_intent(query)
    assert res["intent"] in ["General Explanation", "Prior Art Search"]
    assert res["complexity"] in ["SIMPLE", "MODERATE"]
    assert len(res["follow_up_suggestions"]) <= 2


def test_intent_classification_follow_up():
    """Test Follow-up question on previous answer detection."""
    history = [
        {"role": "user", "content": "Can I patent Triphala?"},
        {"role": "assistant", "content": "Direct product claims are barred under Section 3(p)."}
    ]
    query = "Why is that?"
    res = IntentClassifier.classify_intent(query, history=history)
    assert res["intent"] == "Follow-up question on previous answer"
    assert res["complexity"] == "SIMPLE"
    assert res["needs_deep_agent"] is False


def test_follow_up_suggestions_strictly_capped():
    """Verify all intents generate at most 2 follow-up options."""
    for intent in CANONICAL_INTENTS:
        follow_ups = IntentClassifier.get_follow_up_suggestions(intent, "Sample test query")
        assert isinstance(follow_ups, list)
        assert len(follow_ups) <= 2, f"Intent {intent} returned more than 2 follow-ups: {follow_ups}"


def test_patent_record_schema_instantiation():
    """Verify PatentRecord schema validates and defaults unverified fields properly."""
    rec = PatentRecord(
        publicationNumber="US11992510B2",
        title="Probiotic and Triphala synergistic formulation",
        jurisdiction="USA"
    )
    assert rec.publicationNumber == "US11992510B2"
    assert rec.applicationNumber == "Not Verified"
    assert rec.priorityDate == "Not Verified"
    assert rec.legalStatus == "Current legal status not verified."
    assert rec.verified is False


def test_confidence_metrics_schema_instantiation():
    """Verify ConfidenceMetrics adheres to evidence quality definition."""
    metrics = ConfidenceMetrics(
        level="High",
        evidenceCoverage=94.5,
        sourceVerification="High"
    )
    assert metrics.level == "High"
    assert metrics.evidenceCoverage == 94.5
    assert metrics.sourceVerification == "High"
    assert "not a legal guarantee" in metrics.disclaimer.lower()


def test_structured_ai_answer_with_phase1_extensions():
    """Verify StructuredAIAnswer integrates Phase 1 metadata without errors."""
    rec = PatentRecord(
        publicationNumber="WO2023141607A2",
        title="Ashwagandha extract composition"
    )
    metrics = ConfidenceMetrics(
        level="High",
        evidenceCoverage=92.0,
        sourceVerification="High"
    )
    citation = SourceCitation(
        id="cit-1",
        title="Patents Act 1970",
        authority="IPO",
        section="Section 3(p)",
        summary="Statutory exclusion of traditional knowledge."
    )
    answer = StructuredAIAnswer(
        answer="Direct product patent is barred under Section 3(p).",
        assessment="Classical formulations documented in treatises cannot be patented as direct mixtures.",
        considerations=["Section 3(p) non-patentability"],
        regulatory=["Rule 158B Form 25D"],
        risks="Pre-grant opposition by TKDL.",
        nextSteps=["Formulate novel extraction process", "Prove synergism under Section 3(e)"],
        confidence="HIGH",
        evidenceCount=1,
        sources=[citation],
        intent="Patentability Assessment",
        complexity="MODERATE",
        responseArchetype="PATENTABILITY_ASSESSMENT",
        confidenceMetrics=metrics,
        patents=[rec],
        followUpSuggestions=["Want me to check Section 3(p) overlap?", "Want me to show synergy test protocols?"],
        researchProcess="Search → Retrieve → Verify → Compare → Answer"
    )
    assert answer.intent == "Patentability Assessment"
    assert answer.responseArchetype == "PATENTABILITY_ASSESSMENT"
    assert answer.confidenceMetrics.evidenceCoverage == 92.0
    assert len(answer.patents) == 1
    assert len(answer.followUpSuggestions) == 2
    assert answer.researchProcess == "Search → Retrieve → Verify → Compare → Answer"
