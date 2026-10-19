"""
Phase 2 Test Suite: AYUNOVA Specialist SubAgents Suite & Orchestrator Delegation
Validates:
1. patent-examiner subagent specification, tools, and statutory mandate.
2. biodiversity-compliance subagent specification, tools, and NBA mandates.
3. ayush-tkdl-specialist subagent specification, tools, and classical treatises.
4. trademark-brand-strategist subagent specification, tools, and Nice classifications.
5. get_all_subagents collection integrity and uniqueness.
6. SubAgent tool suite execution (Vector, Graph, Web, Statute).
7. Deep Agent orchestrator compilation with SubAgents registered (providing `task` tool).
8. Deep Agent graph invocation with multi-domain legal inquiry.
9. SubAgent configuration override and empty-list toggling.
"""

import os
import sys
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents import (
    build_patent_examiner_subagent,
    build_biodiversity_compliance_subagent,
    build_ayush_tkdl_subagent,
    build_trademark_brand_subagent,
    get_all_subagents,
    build_ayush_deep_agent,
    search_vector_database,
    execute_graph_cypher,
    extract_graph_subgraph,
    search_web_tavily,
    lookup_statutory_section,
)
from app.agents.deep_agent_factory import OfflineAyushChatModel


def test_patent_examiner_subagent_specs():
    """Verify patent-examiner subagent name, tools, prompt, and description."""
    subagent = build_patent_examiner_subagent()
    assert subagent["name"] == "patent-examiner"
    assert "3(p)" in subagent["description"]
    assert "3(e)" in subagent["description"] or "synergism" in subagent["description"]
    
    # Check tool assignment
    tool_names = [t.name for t in subagent["tools"]]
    assert "search_vector_database" in tool_names
    assert "execute_graph_cypher" in tool_names
    assert "search_web_tavily" in tool_names
    assert "lookup_statutory_section" in tool_names

    # Check system prompt mandates
    prompt = subagent["system_prompt"]
    assert "Section 3(p)" in prompt
    assert "Section 3(e)" in prompt
    assert "Section 3(d)" in prompt
    assert "Combination Index" in prompt or "synergism" in prompt


def test_biodiversity_compliance_subagent_specs():
    """Verify biodiversity-compliance subagent name, tools, prompt, and description."""
    subagent = build_biodiversity_compliance_subagent()
    assert subagent["name"] == "biodiversity-compliance"
    assert "Biological Diversity Act" in subagent["description"]
    assert "Form III" in subagent["description"] or "NBA" in subagent["description"]

    # Check tool assignment
    tool_names = [t.name for t in subagent["tools"]]
    assert "search_vector_database" in tool_names
    assert "search_web_tavily" in tool_names
    assert "lookup_statutory_section" in tool_names

    # Check system prompt mandates
    prompt = subagent["system_prompt"]
    assert "Form III" in prompt
    assert "Section 19" in prompt or "Section 6" in prompt
    assert "Section 55" in prompt
    assert "benefit-sharing" in prompt.lower()


def test_ayush_tkdl_subagent_specs():
    """Verify ayush-tkdl-specialist subagent name, tools, prompt, and description."""
    subagent = build_ayush_tkdl_subagent()
    assert subagent["name"] == "ayush-tkdl-specialist"
    assert "treatises" in subagent["description"] or "TKDL" in subagent["description"]

    # Check tool assignment (specialized in Neo4j Graph + Vector)
    tool_names = [t.name for t in subagent["tools"]]
    assert "execute_graph_cypher" in tool_names
    assert "extract_graph_subgraph" in tool_names
    assert "search_vector_database" in tool_names

    # Check system prompt mandates
    prompt = subagent["system_prompt"]
    assert "Charaka" in prompt
    assert "Sushruta" in prompt
    assert "TKDL" in prompt
    assert "Pharmacopoeia" in prompt


def test_trademark_brand_subagent_specs():
    """Verify trademark-brand-strategist subagent name, tools, prompt, and description."""
    subagent = build_trademark_brand_subagent()
    assert subagent["name"] == "trademark-brand-strategist"
    assert "Class 5" in subagent["description"]
    assert "Class 3" in subagent["description"]
    assert "Section 9" in subagent["description"]

    # Check tool assignment
    tool_names = [t.name for t in subagent["tools"]]
    assert "search_vector_database" in tool_names
    assert "search_web_tavily" in tool_names
    assert "lookup_statutory_section" in tool_names

    # Check system prompt mandates
    prompt = subagent["system_prompt"]
    assert "Class 5" in prompt
    assert "Class 3" in prompt
    assert "Section 9" in prompt
    assert "distinctive" in prompt.lower()


def test_get_all_subagents_collection():
    """Verify get_all_subagents returns all 4 distinct SubAgents."""
    subagents = get_all_subagents()
    assert len(subagents) == 4
    names = [s["name"] for s in subagents]
    assert "patent-examiner" in names
    assert "biodiversity-compliance" in names
    assert "ayush-tkdl-specialist" in names
    assert "trademark-brand-strategist" in names
    assert len(set(names)) == 4


def test_subagent_model_binding():
    """Verify subagents properly accept a customized model instance."""
    custom_model = OfflineAyushChatModel()
    subagents = get_all_subagents(model=custom_model)
    for s in subagents:
        assert s["model"] == custom_model


def test_patent_examiner_tools_execution():
    """Verify tools wired to the patent examiner run and yield correct legal results."""
    subagent = build_patent_examiner_subagent()
    tools_dict = {t.name: t for t in subagent["tools"]}
    
    # 1. Statutory lookup tool
    statute_res = tools_dict["lookup_statutory_section"].invoke({"act_name": "Patents", "section": "3(p)"})
    assert "Section 3(p)" in statute_res

    # 2. Vector search tool
    vec_res = tools_dict["search_vector_database"].invoke({"query": "Patent Act Section 3(e) Synergism", "statute_limit": 1})
    assert "Neon Vector Database Results" in vec_res


def test_ayush_tkdl_tools_execution():
    """Verify graph tools wired to the AYUSH/TKDL subagent run and traverse Neo4j."""
    subagent = build_ayush_tkdl_subagent()
    tools_dict = {t.name: t for t in subagent["tools"]}
    
    # 1. Cypher traversal tool
    cypher_res = tools_dict["execute_graph_cypher"].invoke({"cypher_query": "MATCH (h:Herb) RETURN h.name AS herb LIMIT 3"})
    assert "Neo4j Graph Database Query Results" in cypher_res
    assert "herb" in cypher_res or "records matched" in cypher_res or "0 records" in cypher_res

    # 2. Subgraph extraction tool
    subgraph_res = tools_dict["extract_graph_subgraph"].invoke({"entities": ["Triphala"], "max_hops": 1})
    assert "Extracted Subgraph" in subgraph_res



def test_deep_agent_compilation_with_subagents():
    """Verify build_ayush_deep_agent compiles with all 4 subagents registered by default."""
    agent = build_ayush_deep_agent()
    assert agent is not None
    assert hasattr(agent, "invoke")
    assert hasattr(agent, "stream")


def test_deep_agent_subagent_override():
    """Verify caller can override or disable subagents by passing subagents explicitly."""
    # Disabling subagents
    agent_no_sub = build_ayush_deep_agent(subagents=[])
    assert agent_no_sub is not None

    # Providing only 1 subagent
    single_subagent = [build_patent_examiner_subagent()]
    agent_single = build_ayush_deep_agent(subagents=single_subagent)
    assert agent_single is not None


def test_deep_agent_graph_invocation_with_subagents():
    """Verify Deep Agent executes end-to-end multi-turn query with subagents compiled."""
    agent = build_ayush_deep_agent()
    response = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": (
                    "I want to patent a combination of Triphala and Ashwagandha. "
                    "What are the objections under Section 3(p) and 3(e), and do I need NBA Form III?"
                )
            }
        ]
    })
    assert isinstance(response, dict)
    assert "messages" in response
    assert len(response["messages"]) >= 2
    last_message = response["messages"][-1]
    content = str(last_message.content)
    assert len(content) > 50
    assert ("3(p)" in content or "Patents Act" in content)
    assert ("NBA" in content or "Biological Diversity" in content or "Form III" in content)
