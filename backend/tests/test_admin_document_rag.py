"""
Test Suite: Admin-Uploaded Document-First RAG Architecture (Tests A - I).
Verifies that:
1. Queries targeting an admin-uploaded PDF retrieve the document first.
2. Evidence classification correctly distinguishes SUFFICIENT, PARTIAL, INSUFFICIENT, and NOT_FOUND.
3. Combination queries vs single-entity disclosure queries are properly disentangled.
4. Grounded answers are generated with specific page and chunk citations.
5. The system NEVER returns "Insufficient verified information..." when the PDF contains the answer.
6. Unsupported claims (e.g. synthetic fluorocarbons) trigger a strict grounded refusal.
7. document_id filtering restricts retrieval to the specified document.
"""

import pytest
from app.models.schemas import StructuredAIAnswer
from app.services.rag_engine import AyushRAGEngine
from app.services.vector_service import VectorService
from app.services.grounding_verifier import GroundingVerifier, QueryEntityExtractor
from app.services.intent_classifier import IntentClassifier


def test_test_a_direct_disclosure_anticancer():
    """
    Test A: Direct Disclosure Query
    Query: "Does this document disclose Withania somnifera as an anticancer agent?"
    Must classify evidence as SUFFICIENT and return a grounded document answer.
    Must NOT return "Insufficient verified information is available in the current IP-SAKTI knowledge base."
    """
    query = "Does this document disclose Withania somnifera as an anticancer agent?"
    
    # 1. Intent check
    intent_meta = IntentClassifier.classify_intent(query)
    assert intent_meta["intent"] == "DOCUMENT_DISCLOSURE"
    
    # 2. Vector retrieval check
    chunks = VectorService.search_admin_documents(query=query, limit=8)
    assert len(chunks) > 0, "Expected active admin document chunks to be retrieved"
    assert chunks[0]["source_type"] == "DOCUMENT"
    assert "score_components" in chunks[0]
    
    # 3. Grounding verifier check
    query_entities = QueryEntityExtractor.extract_entities(query)
    status, relevant_chunks, reason = GroundingVerifier.classify_document_evidence(
        query=query, doc_chunks=chunks, query_entities=query_entities
    )
    assert status == "SUFFICIENT", f"Expected SUFFICIENT evidence status, got {status} ({reason})"
    assert len(relevant_chunks) > 0
    
    # 4. End-to-End RAG synthesis check
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert "insufficient verified information" not in res.answer.lower()
    assert "not available in the knowledge base" not in res.answer.lower()
    assert res.auditTrace is not None
    assert res.auditTrace.get("answer_source") == "DOCUMENT"
    assert res.auditTrace.get("external_search_triggered") is False
    assert len(res.sources) > 0
    assert any("pharmaceutics" in s.title.lower() or "document" in s.title.lower() for s in res.sources)


def test_test_b_specific_anticancer_mechanisms():
    """
    Test B: Specific Mechanism Query
    Query: "What anticancer mechanisms of Withania somnifera are reported in this document?"
    """
    query = "What anticancer mechanisms of Withania somnifera are reported in this document?"
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert "insufficient verified information" not in res.answer.lower()
    assert len(res.sources) > 0
    # Must cite document pages or chunks
    assert any(s.page for s in res.sources)


def test_test_c_nanoparticle_disclosure():
    """
    Test C: Nanoparticle Disclosure Query
    Query: "Does this document disclose silver nanoparticles or AgNPs synthesized using Withania somnifera?"
    """
    query = "Does this document disclose silver nanoparticles or AgNPs synthesized using Withania somnifera?"
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert "insufficient verified information" not in res.answer.lower()
    assert "nanoparticle" in res.answer.lower() or "agnp" in res.answer.lower() or "silver" in res.answer.lower()


def test_test_d_extraction_methods():
    """
    Test D: Extraction Methods Query
    Query: "What extraction methods for Withania somnifera are described in this document?"
    """
    query = "What extraction methods for Withania somnifera are described in this document?"
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert "insufficient verified information" not in res.answer.lower()
    assert "extract" in res.answer.lower() or "solvent" in res.answer.lower()


def test_test_e_cisplatin_combination_disclosure():
    """
    Test E: Cisplatin Combination Query
    Query: "Does this document disclose cisplatin combination or sensitization with Withania somnifera?"
    """
    query = "Does this document disclose cisplatin combination or sensitization with Withania somnifera?"
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert "cisplatin" in res.answer.lower()
    assert "insufficient verified information" not in res.answer.lower()
    assert len(res.sources) > 0


def test_test_f_cell_lines_evaluated():
    """
    Test F: Cell Lines / Cancer Types Query
    Query: "What cell lines or cancer types are evaluated for Withania somnifera in this document?"
    """
    query = "What cell lines or cancer types are evaluated for Withania somnifera in this document?"
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert "insufficient verified information" not in res.answer.lower()
    assert any(term in res.answer.lower() for term in ["cancer", "cell", "tumor", "carcinoma", "ovarian", "breast"])


def test_test_g_bioactive_compounds():
    """
    Test G: Bioactive Compounds Query
    Query: "What are the major bioactive compounds of Withania somnifera mentioned in this document?"
    """
    query = "What are the major bioactive compounds of Withania somnifera mentioned in this document?"
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert "withaferin" in res.answer.lower() or "withanolide" in res.answer.lower()
    assert "insufficient verified information" not in res.answer.lower()


def test_test_h_nonexistent_topic_refusal():
    """
    Test H: Negative Disclosure / Nonexistent Topic Query
    Query: "Does this document disclose extraction using synthetic fluorocarbon solvents for Withania somnifera?"
    Must return grounded refusal. Must NOT hallucinate that synthetic fluorocarbons exist in the PDF.
    """
    query = "Does this document disclose extraction using synthetic fluorocarbon solvents for Withania somnifera?"
    
    chunks = VectorService.search_admin_documents(query=query, limit=8)
    query_entities = QueryEntityExtractor.extract_entities(query)
    status, relevant_chunks, reason = GroundingVerifier.classify_document_evidence(
        query=query, doc_chunks=chunks, query_entities=query_entities
    )
    assert status in ("INSUFFICIENT", "NOT_FOUND"), f"Expected refusal status, got {status}"
    
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(query)
    assert res.source_type in ("DOCUMENT", "NONE")
    assert res.confidence == "INSUFFICIENT"
    assert res.auditTrace is not None
    assert res.auditTrace.get("verification_status") in ("UNVERIFIED", "REFUSED")
    assert res.auditTrace.get("external_search_triggered") is False


def test_test_i_document_id_filtering():
    """
    Test I: Explicit document_id Filtering
    Directly query with document_id="doc-e5f43e67de07".
    """
    doc_id = "doc-e5f43e67de07"
    query = "What does this document disclose about Withania somnifera?"
    
    chunks = VectorService.search_admin_documents(query=query, limit=5, document_id=doc_id)
    assert len(chunks) > 0
    assert all(c["document_id"] == doc_id for c in chunks)
    
    res: StructuredAIAnswer = AyushRAGEngine.process_chat_query(
        query=query,
        document_id=doc_id
    )
    assert res.source_type == "DOCUMENT"
    assert res.confidence == "HIGH"
    assert res.auditTrace.get("document_id") == doc_id
