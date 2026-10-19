"""
Test Suite: Authoritative Answer Flow, Document-First Priority,
and Verified External Patent Research Engine.

Validates the complete grounding architecture:
1. TEST 1: Admin-uploaded PDF has highest priority.
   Query: "What are the major bioactive compounds of Withania somnifera mentioned in this document?"
   Expected: Answers ONLY compounds from PDF (Withaferin A, withanolides, etc.) with page citations.
   Strictly excludes outside facts (API heavy metals, Charaka Samhita, Bhavaprakasha).
   source_type == "DOCUMENT".

2. TEST 2: Combination disclosure check in document.
   Query: "Does this document disclose a combination of Withaferin A with cisplatin?"
   Expected: Direct affirmation of combination disclosure with Chunk 12 (Page 14) and Chunk 26 (Page 28) citations.
   source_type == "DOCUMENT".

3. TEST 2 (Fallback to External Patent Research):
   When document is insufficient or query targets external prior art:
   Expected: Deep Agent searches official patent sources (IP India, WIPO, EPO), verifies results,
   and returns structured answer with source_type == "EXTERNAL_AUTHORITY".

4. TEST 3: Unanswerable query absent from both documents and patent sources.
   Expected: Refusal containing "The available knowledge base and approved authoritative sources do not provide sufficient evidence to answer this question."
   source_type == "NONE".

5. TEST 5: Zero fake citations or hardcoded heavy metal templates.
"""

import pytest
from app.models.schemas import StructuredAIAnswer
from app.services.rag_engine import AyushRAGEngine
from app.services.patent_providers import PatentResearchOrchestrator
from app.services.grounding_verifier import GroundingVerifier


def test_test1_bioactive_compounds_grounded_solely_in_admin_pdf():
    """
    TEST 1:
    User asks: 'What are the major bioactive compounds of Withania somnifera mentioned in this document?'
    Must search uploaded PDF first.
    Answers strictly the compounds mentioned in the PDF.
    Must NOT add outside database facts (API standards, heavy metal tables, Charaka Samhita).
    """
    query = "What are the major bioactive compounds of Withania somnifera mentioned in this document?"
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert len(res.evidence) >= 1

    # Verified document compounds present
    assert "Withaferin A" in res.answer
    assert "Withanolide" in res.answer or "withanolide" in res.answer.lower()

    # Document citations present
    assert "Pharmaceutics 14 00611" in res.answer or "Pharmaceutics" in str(res.sources[0].title)

    # Outside ungrounded facts strictly excluded
    assert "Lead ≤10 ppm" not in res.answer
    assert "Arsenic ≤3 ppm" not in res.answer
    assert "Cadmium ≤0.3 ppm" not in res.answer
    assert "Mercury ≤1 ppm" not in res.answer
    assert "foreign matter limits" not in res.answer
    assert "Charaka Samhita" not in res.answer
    assert "Bhavaprakasha" not in res.answer

    # Audit trace verification
    assert res.auditTrace is not None
    assert res.auditTrace.get("document_search_performed") is True
    assert res.auditTrace.get("document_evidence_status") == "SUFFICIENT"
    assert res.auditTrace.get("external_search_triggered") is False
    assert res.auditTrace.get("answer_source") == "DOCUMENT"


def test_test2_combination_disclosure_in_uploaded_document():
    """
    TEST 2:
    User asks: 'Does this document disclose a combination of Withaferin A with cisplatin?'
    Determines that direct combination disclosure exists in uploaded document.
    Answers from document with page/chunk citation.
    """
    query = "Does this document disclose a combination of Withaferin A with cisplatin?"
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"

    # Confirms disclosure
    assert "Yes" in res.answer or "discloses" in res.answer.lower()
    assert "Withaferin A" in res.answer
    assert "cisplatin" in res.answer.lower()

    # Cites specific pages / chunks
    assert "Page 14" in res.answer or "Page 28" in res.answer or "Page 10" in res.answer
    assert "doc-e5f43e67de07-chk-12" in res.answer or "doc-e5f43e67de07" in str(res.sources)

    # Audit trace confirms document grounding without web search
    assert res.auditTrace is not None
    assert res.auditTrace.get("answer_source") == "DOCUMENT"
    assert res.auditTrace.get("external_search_triggered") is False


def test_test2_external_patent_research_synthesis():
    """
    TEST 2 (External Patent Research Pathway):
    When document evidence is insufficient, Deep Agent searches official patent sources
    (IP India, WIPO, EPO), verifies results, and synthesizes an authoritative answer.
    """
    query = "Does existing patent prior art disclose Withaferin A combined with cisplatin?"
    orch = PatentResearchOrchestrator()
    patent_results, sources_used = orch.search_authoritative_patent_sources(
        query=query, query_entities={"compounds": ["withaferin a", "cisplatin"]}
    )
    verified = GroundingVerifier.verify_external_patent_evidence(
        results=patent_results, query=query, query_entities={"compounds": ["withaferin a", "cisplatin"]}
    )

    ans = AyushRAGEngine._synthesize_external_patent_answer(
        query=query,
        patent_results=verified,
        sources_used=sources_used,
        doc_status="INSUFFICIENT",
        intent="Patent Prior Art",
        complexity="COMPLEX",
        archetype="Prior Art Dossier",
        detected_lang="English",
        jurisdiction="India",
        follow_ups=[],
        query_entities={"compounds": ["withaferin a", "cisplatin"]}
    )

    assert isinstance(ans, StructuredAIAnswer)
    assert ans.source_type == "EXTERNAL_AUTHORITY"
    assert ans.confidence == "HIGH"
    assert len(ans.sources) >= 1

    # Must cite official patent authorities, NOT blogs or wikipedia
    authorities = [s.authority for s in ans.sources]
    assert any("IP India" in a for a in authorities)
    assert any("WIPO" in a for a in authorities)
    assert any("EPO" in a for a in authorities)

    # Publication numbers present
    pub_numbers = [s.id for s in ans.sources]
    assert any("IN202111045892A" in p for p in pub_numbers)

    # Audit trace confirms external authority source
    assert ans.auditTrace.get("answer_source") == "EXTERNAL_AUTHORITY"
    assert ans.auditTrace.get("external_search_triggered") is True


def test_test3_unanswerable_query_refusal():
    """
    TEST 3:
    User asks something not present in uploaded PDFs or external patent sources.
    Expected:
    Admin RAG: NOT_FOUND / INSUFFICIENT
    Deep Agent: External research -> unverified
    Return exact refusal:
    'The available knowledge base and approved authoritative sources do not provide sufficient evidence to answer this question.'
    source_type == "NONE".
    """
    query = "Does this document disclose an extraction of UnknownAlienExtract999 with synthetic fluorocarbon solvents?"
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    assert res.source_type == "NONE"
    assert res.confidence == "INSUFFICIENT"
    assert "The available knowledge base and approved authoritative sources do not provide sufficient evidence to answer this question." in res.answer
    assert "This information is not available in the knowledge base." in res.answer

    # Audit trace confirms refusal
    assert res.auditTrace is not None
    assert res.auditTrace.get("answer_source") == "NONE"
    assert res.auditTrace.get("verification_status") == "UNVERIFIED"


def test_no_fake_citations_or_unverified_direct_matches():
    """
    TEST 4:
    Confirms that fake citations like '99% Direct Match' or 'bot-api' are not fabricated.
    All citations must correspond to real retrieved records.
    """
    query = "What are the major bioactive compounds of Withania somnifera mentioned in this document?"
    res = AyushRAGEngine.process_chat_query(query)

    for citation in res.sources:
        assert citation.matchPercentage != "99% Direct Match"
        assert citation.matchPercentage != "98% Direct Match"
        assert citation.id not in ["bot-api", "bot-bsi", "bot-kew"]
