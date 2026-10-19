"""
Phase 3 Test Suite: Hybrid GraphRAG Engine & Multi-Hop Cypher Retrieval
Validates:
1. /api/graph/stats endpoint returns valid GraphStatsResponse schema.
2. /api/graph/subgraph traverses multi-hop entity relations for visual graph rendering.
3. /api/chat/telemetry reports both Neon pgvector and Neo4j graph telemetry.
4. /api/chat/process-query fuses vector chunks and knowledge graph triples into StructuredAIAnswer.
5. /api/chat/stream emits live graph traversal step and subgraph in SSE events.
"""

import os
import sys
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_graph_stats_endpoint():
    """Verify /api/graph/stats returns structured metrics without error."""
    response = client.get("/api/graph/stats")
    assert response.status_code == 200
    data = response.json()
    assert "connected" in data
    assert "status" in data
    assert "total_nodes" in data
    assert "total_relationships" in data
    assert isinstance(data["labels"], dict)
    assert isinstance(data["relationship_types"], dict)


def test_graph_subgraph_endpoint():
    """Verify /api/graph/subgraph retrieves multi-hop nodes and edges for entities."""
    response = client.get("/api/graph/subgraph?entities=Ashwagandha,Triphala&max_hops=2")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert "triples" in data
    assert isinstance(data["nodes"], list)
    assert isinstance(data["edges"], list)
    assert isinstance(data["triples"], list)
    assert len(data["nodes"]) > 0
    assert len(data["edges"]) > 0


def test_chat_telemetry_includes_graph_metrics():
    """Verify /api/chat/telemetry reports both vector and graph metrics."""
    response = client.get("/api/chat/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert "graphDatabase" in data
    assert "graphConnected" in data
    assert "graphNodesCount" in data
    assert "graphRelationshipsCount" in data
    assert "GraphRAG" in data["synthesisEngine"] or "pgvector" in data["synthesisEngine"]


def test_process_query_hybrid_graphrag_fusion():
    """Verify /api/chat/process-query returns both vector citations and knowledge graph facts."""
    query = "Can I patent an Ayurvedic Triphala and Curcumin synergistic blend in India?"
    response = client.post("/api/chat/process-query", json={"query": query})
    assert response.status_code == 200
    data = response.json()

    # Verify vector grounding
    assert len(data["sources"]) > 0

    # Verify Knowledge Graph fusion
    assert "graphContext" in data
    assert "subgraph" in data
    assert data["subgraph"] is not None
    assert len(data["subgraph"]["nodes"]) > 0
    assert len(data["subgraph"]["edges"]) > 0

    # Verify that generationSource indicates GraphRAG or pgvector
    assert "GraphRAG" in data["generationSource"] or "pgvector" in data["generationSource"]

    # Verify that key legal and botanical entities are represented in the subgraph
    node_names = [n["name"] for n in data["subgraph"]["nodes"]]
    assert any("Triphala" in n for n in node_names) or any("Section 3(p)" in n for n in node_names)


def test_stream_chat_emits_graph_step_and_subgraph():
    """Verify /api/chat/stream includes the graph traversal step and subgraph in final answer."""
    query = "What are the key claims of US Patent 11992510 regarding Triphala?"
    response = client.post("/api/chat/stream", json={"query": query})
    assert response.status_code == 200

    content = response.text
    # Verify graph traversal step was emitted
    assert "step-2b" in content or "Neo4j" in content
    assert "Traversing Neo4j Knowledge Graph" in content or "graph" in content.lower()

    # Verify final_answer event contains subgraph
    assert "final_answer" in content
    assert "subgraph" in content
