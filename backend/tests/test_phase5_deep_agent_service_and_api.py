"""
Test Suite for Phase 5: DeepAgent Service, Multi-Agent Reasoning Trace,
SSE Streaming Endpoint, and Live Telemetry for AYUNOVA.
"""

import pytest
import json
import asyncio
from fastapi.testclient import TestClient

from app.main import app
from app.services.deep_agent_service import AyushDeepAgentService
from app.models.schemas import StructuredAIAnswer


@pytest.fixture
def client():
    return TestClient(app)


def test_deep_agent_service_query_analysis_routing():
    """Verify query keyword parsing routes to appropriate specialist subagents and tools."""
    # Patent query
    routing_patent = AyushDeepAgentService._detect_active_subagents_and_tools("Can I patent a synergistic Triphala extract under Section 3(p)?")
    assert "patent-examiner" in routing_patent["subagents"]
    assert "ayush-tkdl-specialist" in routing_patent["subagents"]
    assert "search_vector_database" in routing_patent["tools"]
    assert "execute_graph_cypher" in routing_patent["tools"]

    # Biodiversity query
    routing_bio = AyushDeepAgentService._detect_active_subagents_and_tools("What NBA Form III approvals and benefit sharing are required?")
    assert "biodiversity-compliance" in routing_bio["subagents"]

    # Trademark query
    routing_tm = AyushDeepAgentService._detect_active_subagents_and_tools("How do I register a brand name under Class 5 vs Class 3?")
    assert "trademark-brand-strategist" in routing_tm["subagents"]

    # Web search query
    routing_web = AyushDeepAgentService._detect_active_subagents_and_tools("What are the claims of US Patent 11992510 regarding Bacillus coagulans?")
    assert "search_web_tavily" in routing_web["tools"]


def test_deep_agent_service_process_query_execution():
    """Verify process_deep_agent_query returns a valid StructuredAIAnswer with deepAgentTrace."""
    query = "Can I patent a formulation of Triphala with Bacillus coagulans under Section 3(p)?"
    answer = AyushDeepAgentService.process_deep_agent_query(
        query=query,
        jurisdiction="India",
        language="English",
        enable_rubric=True
    )

    assert isinstance(answer, StructuredAIAnswer)
    assert answer.answer is not None and len(answer.answer) > 0
    assert answer.assessment is not None
    assert answer.confidence in ["HIGH", "MEDIUM", "LOW", "INSUFFICIENT"]
    assert len(answer.sources) >= 0
    assert answer.generationSource == "Ayush DeepAgent (Tri-Modal + Skills + Rubric)"

    # Validate deepAgentTrace contents
    trace = answer.deepAgentTrace
    assert trace is not None
    assert "subagentsCalled" in trace
    assert "toolsQueried" in trace
    assert "rubricScore" in trace
    assert isinstance(trace["rubricScore"], (int, float))
    assert trace["rubricScore"] >= 0
    assert "rubricPassed" in trace
    assert "memoryUpdated" in trace


def test_deep_agent_service_stream_events():
    """Verify stream_deep_agent_query yields valid SSE format events."""
    async def _collect():
        query = "What are the requirements under Biological Diversity Act for export?"
        generator = AyushDeepAgentService.stream_deep_agent_query(
            query=query,
            jurisdiction="India",
            language="English",
            enable_rubric=True
        )
        events = []
        async for chunk in generator:
            events.append(chunk)
        return "".join(events)

    full_stream = asyncio.run(_collect())
    assert "event: step" in full_stream
    assert "event: subagent_call" in full_stream
    assert "event: tool_call" in full_stream
    assert "event: rubric_check" in full_stream
    assert "event: token" in full_stream
    assert "event: final_answer" in full_stream
    assert "event: done" in full_stream
    assert "[DONE]" in full_stream


def test_api_chat_process_query_with_deep_agent(client):
    """Verify POST /api/chat/process-query handles use_deep_agent=True."""
    payload = {
        "query": "Can I patent an Ayurvedic Triphala formulation with Bacillus coagulans?",
        "jurisdiction": "India",
        "language": "English",
        "use_deep_agent": True,
        "enable_rubric": True
    }
    response = client.post("/api/chat/process-query", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "answer" in data
    assert "assessment" in data
    assert "sources" in data
    assert data.get("generationSource") == "Ayush DeepAgent (Tri-Modal + Skills + Rubric)"
    assert "deepAgentTrace" in data
    assert data["deepAgentTrace"] is not None
    assert "subagentsCalled" in data["deepAgentTrace"]
    assert "toolsQueried" in data["deepAgentTrace"]
    assert "rubricScore" in data["deepAgentTrace"]


def test_api_chat_stream_with_deep_agent(client):
    """Verify POST /api/chat/stream handles use_deep_agent=True and streams SSE events."""
    payload = {
        "query": "What are the grounds of rejection under Section 3(e) of Patents Act?",
        "jurisdiction": "India",
        "language": "English",
        "use_deep_agent": True,
        "enable_rubric": True
    }
    response = client.post("/api/chat/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    content = response.text
    assert "event: step" in content
    assert "event: tool_call" in content
    assert "event: rubric_check" in content
    assert "event: final_answer" in content
    assert "event: done" in content


def test_api_chat_telemetry_includes_deep_agent_capabilities(client):
    """Verify GET /api/chat/telemetry reports DeepAgent tools, subagents, and skills."""
    response = client.get("/api/chat/telemetry")
    assert response.status_code == 200
    data = response.json()

    assert data.get("deepAgentAvailable") is True
    assert "deepAgentTools" in data
    assert len(data["deepAgentTools"]) == 5
    assert "search_vector_database" in data["deepAgentTools"]
    assert "execute_graph_cypher" in data["deepAgentTools"]
    assert "search_web_tavily" in data["deepAgentTools"]

    assert "deepAgentSubagents" in data
    assert len(data["deepAgentSubagents"]) == 4
    assert "patent-examiner" in data["deepAgentSubagents"]
    assert "biodiversity-compliance" in data["deepAgentSubagents"]
    assert "ayush-tkdl-specialist" in data["deepAgentSubagents"]
    assert "trademark-brand-strategist" in data["deepAgentSubagents"]

    assert "deepAgentSkills" in data
    assert len(data["deepAgentSkills"]) == 4
    assert "section-3p-defense" in data["deepAgentSkills"]
    assert "synergy-experimental-protocol" in data["deepAgentSkills"]
