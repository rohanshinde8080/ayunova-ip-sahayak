"""
Strict RAG Grounding Test Suite for AyuNova / IP-SAKTI Sahayak.
Validates that:
1. Entity mismatches are detected and rejected (e.g. Ashwagandha cancer vs Tulsi).
2. Section 3(e) synergism is explained without ungrounded numbers (CI < 0.8 or 2x-20x Cmax as statutory mandates).
3. Missing botanical taxonomy returns a factual refusal, not a synthetic hierarchy.
4. Unverified patent numbers are refused, never hallucinated (no US11992510B2 for general blends).
5. Scientific papers are summarized strictly from context without clinical overclaims.
6. Missing legal sources produce explicit insufficiency refusals.
"""
import pytest
from unittest.mock import patch
from app.services.rag_engine import AyushRAGEngine
from app.services.grounding_verifier import GroundingVerifier, QueryEntityExtractor
from app.services.botanical_service import BotanicalService
from app.models.schemas import SourceCitation, StructuredAIAnswer


def test_entity_mismatch_rejection_unit():
    """TEST 1 (Unit): Query is about Tulsi vs Cancer, but candidates contain only Ashwagandha."""
    query = "Can Tulsi cure cancer? Provide evidence from the knowledge base."
    query_entities = QueryEntityExtractor.extract_entities(query)

    assert "tulsi" in query_entities["botanicals"]
    assert "cancer" in query_entities["diseases"]

    candidate_sources = [
        {
            "id": "doc-ashwa-cancer",
            "title": "Ayurvedic Oncology: Cytotoxic Evaluation of Withania somnifera (Ashwagandha) Root Extract",
            "authority": "Journal of Ayurvedic Integrative Medicine",
            "section": "Scientific Study / Withaferin-A Oncology",
            "summary": "Withania somnifera (Ashwagandha) root extract demonstrated cytotoxic efficacy against NSCLC cells with Withaferin A reducing cell viability.",
            "officialAct": "Scientific Research Dossier",
            "similarity": 0.82
        }
    ]

    valid_sources, rejections = GroundingVerifier.filter_sources_by_entity_and_relevance(
        sources=candidate_sources,
        query=query,
        query_entities=query_entities
    )

    # Ashwagandha source MUST be rejected for a Tulsi query
    assert len(valid_sources) == 0
    assert len(rejections) == 1
    assert "Entity Mismatch" in rejections[0]["reason"]

    # Sufficiency check MUST fail and state mismatch explicitly
    is_sufficient, msg = GroundingVerifier.check_evidence_sufficiency(
        query=query,
        valid_sources=valid_sources,
        query_entities=query_entities
    )
    assert is_sufficient is False
    assert "Ashwagandha" in msg
    assert "Tulsi" in msg
    assert "This information is not available in the knowledge base." in msg


def test_entity_mismatch_e2e():
    """TEST 1 (E2E): process_chat_query for Tulsi vs Cancer refuses to use Ashwagandha data."""
    query = "Can Tulsi cure cancer? Provide evidence from the knowledge base."
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    # Must NOT claim Ashwagandha cured cancer for Tulsi
    assert "Ashwagandha (Withania somnifera)" in res.answer or "not available in the knowledge base" in res.answer
    assert "This information is not available in the knowledge base." in res.answer or "insufficient" in res.answer.lower()
    # Confidence must be INSUFFICIENT
    assert res.confidence == "INSUFFICIENT"


def test_synergy_section_3e_grounding():
    """
    TEST 2: Triphala + Curcumin synergy
    Query: 'Can I patent an Ayurvedic Triphala and Curcumin synergistic blend in India?'
    Expect:
    - Answers based ONLY on retrieved sources
    - Does NOT claim 'CI < 0.8' is a statutory requirement
    - Does NOT state '2x–20x Cmax' as a requirement unless in sources
    - Explains Section 3(e) based on actual text
    """
    query = "Can I patent an Ayurvedic Triphala and Curcumin synergistic blend in India?"
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    answer_text = res.answer

    # Must explain Section 3(e) and Section 3(p)
    assert "Section 3(e)" in answer_text or "Section 3(e)" in res.assessment
    assert "Section 3(p)" in answer_text or "Section 3(p)" in res.assessment

    # MUST NOT state CI < 0.8 is a statutory standard / mandatory legal requirement
    assert "statutory standard required to satisfy Section 3(e)" not in answer_text
    assert "CI < 0.8: Strong synergistic efficacy (statutory standard" not in answer_text

    # MUST NOT state 2x to 20x Cmax as requirement
    assert "2x to 20x higher plasma Cmax" not in answer_text

    # Combination Index is mentioned as experimental method or bioassay proof
    assert "Combination Index" in answer_text or "synerg" in answer_text.lower()


def test_missing_taxonomy_refusal():
    """
    TEST 3: Botanical classification when taxonomy is not in KB
    When taxonomy metadata is missing/empty, returns refusal, NOT a synthetic Kingdom->Species hierarchy.
    """
    query = "What is the botanical classification of UnknownHerbXYZ?"
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    # Must refuse, not fabricate Kingdom -> Division -> Class
    assert (
        "not available in the knowledge base" in res.answer.lower()
        or "insufficient verified information" in res.answer.lower()
        or "not a documented botanical herb" in res.answer.lower()
    )


def test_unverified_patent_number_refusal():
    """
    TEST 4: Patent number query for unverified formulation
    Query: 'What is the patent number for the Triphala Curcumin synergistic formulation?'
    Expect: Refusal, NOT a hallucinated patent number (e.g., US11992510B2).
    """
    query = "What is the patent number for the Triphala Curcumin synergistic formulation?"
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    # Must NOT hallucinate US11992510B2 for Triphala + Curcumin
    assert "US11992510" not in res.answer
    assert "US 11,992,510" not in res.answer
    assert "11992510" not in [p.patentNumber for p in res.patents]

    # Must indicate information is not available
    assert "This information is not available in the knowledge base." in res.answer or "insufficient" in res.answer.lower()


def test_scientific_paper_grounding():
    """
    TEST 5: Scientific paper summarization
    Query: 'Summarize the scientific paper on Withaferin A in the knowledge base.'
    Expect:
    - Summarizes ONLY findings in the paper
    - Does NOT extrapolate to human cancer treatment if paper is in-vitro/pre-clinical
    """
    query = "Summarize the scientific paper on Withaferin A in the knowledge base."
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    answer_text = res.answer.lower()

    # Should mention the laboratory in-vitro findings (Withaferin A, NSCLC or cytotoxic evaluation)
    assert "withaferin" in answer_text or "withania" in answer_text
    # Must NOT claim proven human cancer cure
    assert "cures cancer in humans" not in answer_text
    assert "effective treatment for cancer in humans" not in answer_text


def test_missing_legal_source_refusal():
    """
    TEST 6: Missing legal source
    Query: 'Which Indian law applies to Ayurvedic intellectual property?'
    When legal sources are not retrieved, expect:
    'The available knowledge base provides insufficient evidence to verify this specific point.'
    """
    query = "Which Indian law applies to Ayurvedic intellectual property?"
    
    # Unit check when sources list is empty
    is_sufficient, msg = GroundingVerifier.check_evidence_sufficiency(
        query=query,
        valid_sources=[],
        query_entities=QueryEntityExtractor.extract_entities(query)
    )
    assert is_sufficient is False
    assert "The available knowledge base provides insufficient evidence to verify this specific point." in msg
