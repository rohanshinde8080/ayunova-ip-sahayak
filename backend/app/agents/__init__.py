"""
AYUNOVA DeepAgents Module
Autonomous multi-agent legal intelligence powered by LangChain DeepAgents,
Neon pgvector, Neo4j Graph Database, and Tavily Live Web Search.
"""

from app.agents.tools import (
    search_vector_database,
    execute_graph_cypher,
    extract_graph_subgraph,
    search_web_tavily,
    search_web_tavily_structured,
    lookup_statutory_section,
    ALL_AYUSH_TOOLS,
)
from app.agents.state import AyushDeepAgentState
from app.agents.subagents import (
    build_patent_examiner_subagent,
    build_biodiversity_compliance_subagent,
    build_ayush_tkdl_subagent,
    build_trademark_brand_subagent,
    get_all_subagents,
)
from app.agents.deep_agent_factory import build_ayush_deep_agent, DEFAULT_SKILLS_DIR
from app.agents.rubrics import (
    STATUTORY_PRECISION_RUBRIC,
    PRIOR_ART_GROUNDING_RUBRIC,
    RISK_CALIBRATION_RUBRIC,
    ACTIONABLE_ROADMAP_RUBRIC,
    USER_FIRST_RUBRIC,
    DEDUPLICATION_AND_VERIFICATION_RUBRIC,
    LEGAL_SAFETY_RUBRIC,
    FOLLOW_UP_CAP_RUBRIC,
    AYUNOVA_COMPOSITE_RUBRIC,
    evaluate_response_against_rubric,
    evaluate_deep_agent_rubrics,
    build_ayunova_rubric_middleware,
)
from app.agents.memory import (
    get_portfolio_memory_path,
    read_portfolio_memory,
    update_portfolio_memory,
    append_portfolio_entry,
    reset_portfolio_memory,
    DEFAULT_PORTFOLIO_FILE,
)

__all__ = [
    "search_vector_database",
    "execute_graph_cypher",
    "extract_graph_subgraph",
    "search_web_tavily",
    "search_web_tavily_structured",
    "lookup_statutory_section",
    "ALL_AYUSH_TOOLS",
    "AyushDeepAgentState",
    "build_patent_examiner_subagent",
    "build_biodiversity_compliance_subagent",
    "build_ayush_tkdl_subagent",
    "build_trademark_brand_subagent",
    "get_all_subagents",
    "build_ayush_deep_agent",
    "DEFAULT_SKILLS_DIR",
    "STATUTORY_PRECISION_RUBRIC",
    "PRIOR_ART_GROUNDING_RUBRIC",
    "RISK_CALIBRATION_RUBRIC",
    "ACTIONABLE_ROADMAP_RUBRIC",
    "USER_FIRST_RUBRIC",
    "DEDUPLICATION_AND_VERIFICATION_RUBRIC",
    "LEGAL_SAFETY_RUBRIC",
    "FOLLOW_UP_CAP_RUBRIC",
    "AYUNOVA_COMPOSITE_RUBRIC",
    "evaluate_response_against_rubric",
    "evaluate_deep_agent_rubrics",
    "build_ayunova_rubric_middleware",
    "get_portfolio_memory_path",
    "read_portfolio_memory",
    "update_portfolio_memory",
    "append_portfolio_entry",
    "reset_portfolio_memory",
    "DEFAULT_PORTFOLIO_FILE",
]



