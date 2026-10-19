"""
Comprehensive End-to-End Test Suite for Online RAG Pipeline & Chat Engine
Validates:
1. Neon pgvector telemetry endpoint (/api/chat/telemetry)
2. Presets endpoint with prior art & US patent entries (/api/chat/presets)
3. Dynamic RAG query processing for US Patent 11992510
4. Statutory citation grounding with match percentages
5. Low confidence query handling for synthetic compositions
6. Multi-turn conversation history continuity
"""

import os
import sys
import pytest

# Ensure backend root is on path regardless of runner cwd
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rag_telemetry_endpoint():
    """Verify live Neon pgvector telemetry returns active vectors and HNSW index."""
    response = client.get("/api/chat/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "Neon" in data["database"]
    assert data["activeVectorsCount"] >= 0
    assert "HNSW" in data["indexType"]
    assert "synthesisEngine" in data
    assert "geminiConfigured" in data

def test_chat_presets_endpoint():
    """Verify preset queries return rich categories including US Patent 11992510."""
    response = client.get("/api/chat/presets")
    assert response.status_code == 200
    presets = response.json().get("presets", [])
    assert len(presets) >= 3
    preset_ids = [p["id"] for p in presets]
    assert "triphala-patent" in preset_ids
    assert "us-triphala-probiotics" in preset_ids
    assert "synthetic-hybrid" in preset_ids

def test_empty_query_rejection():
    """Verify empty chat queries are rejected with 400 Bad Request."""
    response = client.post("/api/chat/process-query", json={"query": "   "})
    assert response.status_code == 400

def test_us_patent_11992510_grounded_answer():
    """Verify questions about US Patent 11992510 yield specific grounded claims and citations."""
    query = "What are the key claims of US Patent 11992510 regarding Triphala with Bacillus coagulans and probiotics?"
    response = client.post("/api/chat/process-query", json={"query": query})
    assert response.status_code == 200
    data = response.json()
    
    assert "11992510" in data["answer"] or "Triphala" in data["answer"]
    assert len(data["sources"]) > 0
    top_source = data["sources"][0]
    assert "title" in top_source
    assert "authority" in top_source
    assert "section" in top_source
    assert top_source.get("matchPercentage") is not None or top_source.get("verified") is True

def test_synthetic_low_confidence_gate():
    """Verify synthetic / unknown chemical queries trigger LOW confidence and expert review."""
    query = "Can I patent a synthetic peptide hybrid unknown chemical formulation as an Ayurvedic drug?"
    response = client.post("/api/chat/process-query", json={"query": query})
    assert response.status_code == 200
    data = response.json()
    
    assert data["confidence"] == "LOW"
    assert "synthetic" in data["answer"].lower() or "synthetic" in data["assessment"].lower()
    assert len(data["sources"]) > 0

def test_brand_trademark_strategy():
    """Verify brand and trademark exclusivity queries return Trade Marks Act Class 5 & 3 guidance."""
    query = "How do I secure brand protection and trademark exclusivity for classical Ayurvedic formulations?"
    response = client.post("/api/chat/process-query", json={"query": query})
    assert response.status_code == 200
    data = response.json()
    
    assert data["confidence"] == "HIGH"
    assert "trade mark" in data["assessment"].lower() or "brand" in data["assessment"].lower()
    assert any("Class 5" in c for c in data["considerations"])

def test_multiturn_history_context():
    """Verify multi-turn conversation history is accepted and handled without error."""
    payload = {
        "query": "What are the specific penalties under Section 12 if I fail to obtain NBA approval?",
        "history": [
            {"role": "user", "content": "I want to export an Ayurvedic formulation using Indian medicinal herbs."},
            {"role": "assistant", "content": "Under Biological Diversity Act 2023, access to Indian biological resources requires compliance."}
        ]
    }
    response = client.post("/api/chat/process-query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["sources"]) > 0
    assert data["assessment"] is not None

def test_sse_streaming_endpoint():
    """Verify POST /api/chat/stream delivers SSE steps and final grounded answer."""
    payload = {
        "query": "What are the key claims of US Patent 11992510 regarding Triphala with Bacillus coagulans?"
    }
    response = client.post("/api/chat/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    content = response.text
    assert "event: step" in content
    assert "event: final_answer" in content
    assert "event: done" in content
    assert "11992510" in content

def test_multilingual_detection_query():
    """Verify Hindi / Devanagari script query triggers language detection."""
    payload = {
        "query": "त्रिफला और अश्वगंधा के पेटेंट के लिए क्या नियम हैं?"
    }
    response = client.post("/api/chat/process-query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["detectedLanguage"] in ["Hindi", "Marathi", "English"]
    assert len(data["sources"]) > 0

def test_hybrid_vector_service_directly():
    """Directly test VectorService.search_hybrid_corpus against Neon PostgreSQL."""
    from app.services.vector_service import VectorService
    results = VectorService.search_hybrid_corpus("Triphala synergism probiotics", statute_limit=3, prior_art_limit=2)
    assert len(results) > 0
    top = results[0]
    assert "id" in top
    assert "title" in top
    assert "similarity" in top
    assert "relevanceScore" in top
    assert "matchPercentage" in top
    assert top["similarity"] >= 0.0

def test_conversational_guardrail_name_and_greeting():
    """Verify entering a personal name like 'rohan' or greeting triggers conversational guardrail instead of patent grounding."""
    # Test 1: User enters their name "rohan"
    res1 = client.post("/api/chat/process-query", json={"query": "rohan"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert "Rohan" in data1["answer"]
    assert "AYUNOVA" in data1["answer"]
    assert data1["confidence"] == "HIGH"
    assert len(data1["sources"]) == 0
    assert data1["generationSource"] == "AYUNOVA Conversational Guardrail"

    # Test 2: User enters greeting "hello"
    res2 = client.post("/api/chat/process-query", json={"query": "hello"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert "AYUNOVA" in data2["answer"]
    assert len(data2["sources"]) == 0

def test_out_of_scope_domain_guardrail():
    """Verify completely out-of-scope queries (e.g. sports, general questions) trigger domain guardrail with LOW confidence."""
    res = client.post("/api/chat/process-query", json={"query": "who won the cricket match yesterday?"})
    assert res.status_code == 200
    data = res.json()
    assert data["confidence"] == "LOW"
    assert "outside the statutory scope" in data["answer"].lower()
    assert data["generationSource"] == "AYUNOVA Domain Guardrail"
    assert len(data["sources"]) == 0
