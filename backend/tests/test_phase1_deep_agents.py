"""
Phase 1 Test Suite: LangChain DeepAgents Core Harness & Tri-Modal Tools Suite
Validates:
1. ALL_AYUSH_TOOLS suite completeness and schema validity.
2. search_vector_database tool querying Neon pgvector.
3. execute_graph_cypher tool querying Neo4j Desktop and blocking mutations.
4. extract_graph_subgraph tool returning nodes, edges, and triples.
5. search_web_tavily tool executing safely with graceful fallback.
6. lookup_statutory_section tool resolving Indian Acts and statutory tests.
7. AyushDeepAgentState schema extensions.
8. build_ayush_deep_agent factory compiling a runnable CompiledStateGraph.
9. End-to-end graph invocation with user input.
"""

import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents import (
    search_vector_database,
    execute_graph_cypher,
    extract_graph_subgraph,
    search_web_tavily,
    lookup_statutory_section,
    ALL_AYUSH_TOOLS,
    AyushDeepAgentState,
    build_ayush_deep_agent,
)


def test_tools_collection_completeness():
    """Verify ALL_AYUSH_TOOLS contains all 5 required tools with descriptive schemas."""
    assert len(ALL_AYUSH_TOOLS) == 5
    tool_names = [t.name for t in ALL_AYUSH_TOOLS]
    assert "search_vector_database" in tool_names
    assert "execute_graph_cypher" in tool_names
    assert "extract_graph_subgraph" in tool_names
    assert "search_web_tavily" in tool_names
    assert "lookup_statutory_section" in tool_names

    for t in ALL_AYUSH_TOOLS:
        assert t.description is not None
        assert len(t.description) > 20


def test_vector_database_tool_execution():
    """Verify search_vector_database tool queries Neon pgvector and returns formatted citations."""
    result = search_vector_database.invoke({"query": "Section 3(p) Traditional Knowledge", "statute_limit": 2})
    assert isinstance(result, str)
    assert "Neon Vector Database Results" in result
    assert "Patents Act" in result or "Section 3(p)" in result
    assert "Authority:" in result


def test_graph_cypher_tool_execution():
    """Verify execute_graph_cypher runs read-only Cypher queries against Neo4j Desktop."""
    result = execute_graph_cypher.invoke({"cypher_query": "MATCH (n) RETURN count(n) AS total_nodes"})
    assert isinstance(result, str)
    assert "Neo4j Graph Database Query Results" in result or "records matched" in result
    assert "total_nodes" in result or "records matched" in result or "0 records" in result


def test_graph_cypher_tool_blocks_mutations():
    """Verify execute_graph_cypher strictly rejects mutation queries like DELETE, CREATE, DROP."""
    mutation_query = "MATCH (n) DETACH DELETE n"
    result = execute_graph_cypher.invoke({"cypher_query": mutation_query})
    assert "Error: Only read-only queries" in result


def test_subgraph_extraction_tool():
    """Verify extract_graph_subgraph traverses multi-hop nodes, edges, and triples."""
    result = extract_graph_subgraph.invoke({"entities": ["Triphala", "Ashwagandha"], "max_hops": 2})
    assert isinstance(result, str)
    assert "Extracted Subgraph" in result
    assert "Total Nodes:" in result
    assert "Total Edges:" in result
    assert "Semantic Triples:" in result


def test_tavily_web_search_tool():
    """Verify search_web_tavily executes safely with or without live API key."""
    result = search_web_tavily.invoke({"query": "US Patent 11992510 Bacillus coagulans"})
    assert isinstance(result, str)
    assert len(result) > 20
    # Either returns live web results or the graceful offline notice
    assert ("Tavily Live Web Search Results" in result) or ("Tavily Web Search (Notice)" in result)


def test_statutory_section_lookup_tool():
    """Verify lookup_statutory_section resolves exact shloka and statutory text from official base."""
    res_pat = lookup_statutory_section.invoke({"act_name": "Patents", "section": "3(p)"})
    assert "Section 3(p)" in res_pat
    assert "Traditional Knowledge" in res_pat
    assert "CGPDTM" in res_pat or "Indian Patent Office" in res_pat

    res_bio = lookup_statutory_section.invoke({"act_name": "Biodiversity", "section": "19"})
    assert "Biological Diversity" in res_bio or "Section 19" in res_bio or "NBA" in res_bio


def test_deep_agent_state_schema():
    """Verify AyushDeepAgentState contains domain-specific extension fields."""
    annotations = AyushDeepAgentState.__annotations__
    assert "messages" in annotations
    assert "user_query" in annotations
    assert "detected_language" in annotations
    assert "retrieved_citations" in annotations
    assert "subgraph_data" in annotations
    assert "web_sources" in annotations
    assert "rubric_evaluations" in annotations
    assert "portfolio_scratchpad" in annotations


def test_build_ayush_deep_agent_compilation():
    """Verify build_ayush_deep_agent compiles a valid LangGraph CompiledStateGraph."""
    agent = build_ayush_deep_agent()
    # Should be an instance of LangGraph CompiledStateGraph
    assert agent is not None
    assert hasattr(agent, "invoke")
    assert hasattr(agent, "stream")


def test_deep_agent_graph_invocation():
    """Verify the compiled Deep Agent can be invoked with a user message."""
    from langchain_core.messages import HumanMessage
    agent = build_ayush_deep_agent()
    response = agent.invoke({
        "messages": [HumanMessage(content="Can I patent an Ayurvedic herbal extract under Section 3(p)?")]
    })
    assert isinstance(response, dict)
    assert "messages" in response
    assert len(response["messages"]) >= 1
    last_message = response["messages"][-1]
    # Check that answer contains legal statutory grounding
    content = str(last_message.content)
    assert len(content) > 50
    assert "3(p)" in content or "Patents Act" in content or "traditional knowledge" in content.lower()
