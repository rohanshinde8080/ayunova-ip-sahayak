"""
AYUNOVA DeepAgent State Schema.
Extends LangChain's DeepAgentState with domain-specific attributes for
statutory citations, Neo4j subgraphs, Tavily live web sources, and rubric audits.
"""

import app.core.compat  # noqa: F401
from typing import TypedDict, Optional, List, Dict, Any

try:
    from deepagents.graph import DeepAgentState
except (ImportError, Exception):
    class DeepAgentState(dict):  # type: ignore
        pass


class AyushDeepAgentState(DeepAgentState, total=False):
    """
    State schema for the AYUNOVA Deep Agent.
    Maintains cross-turn context, retrieved vector citations,
    interactive Neo4j subgraphs, live web snippets, and rubric self-critique audits.
    """
    user_query: str
    detected_language: str
    retrieved_citations: List[Dict[str, Any]]
    subgraph_data: Dict[str, Any]
    web_sources: List[Dict[str, Any]]
    rubric_evaluations: List[Dict[str, Any]]
    portfolio_scratchpad: str
    statutory_assessment: str
    confidence_level: str
    recommended_considerations: List[str]
