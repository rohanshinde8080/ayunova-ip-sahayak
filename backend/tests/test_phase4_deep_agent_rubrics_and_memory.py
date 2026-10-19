"""
Phase 4 Test Suite: Rubric Evaluator-Optimizer & Long-Term Research Memory
Validates:
1. Domain rubric criteria completeness and statutory specificity.
2. Factual rule-based rubric evaluation (passing grounded answers vs failing vague answers).
3. RubricMiddleware construction and grader configuration.
4. Persistent portfolio scratchpad lifecycle (read, append, update, reset).
5. Deep Agent compilation with unified backend (skills + portfolio memory + subagents).
6. Deep Agent compilation with RubricMiddleware enabled.
7. End-to-end graph invocation with memory and skills active.
8. Disabling or overriding memory via memory=[].
"""

import os
import sys
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents import (
    STATUTORY_PRECISION_RUBRIC,
    PRIOR_ART_GROUNDING_RUBRIC,
    RISK_CALIBRATION_RUBRIC,
    ACTIONABLE_ROADMAP_RUBRIC,
    AYUNOVA_COMPOSITE_RUBRIC,
    evaluate_response_against_rubric,
    build_ayunova_rubric_middleware,
    get_portfolio_memory_path,
    read_portfolio_memory,
    update_portfolio_memory,
    append_portfolio_entry,
    reset_portfolio_memory,
    DEFAULT_PORTFOLIO_FILE,
    build_ayush_deep_agent,
)
from app.agents.deep_agent_factory import OfflineAyushChatModel
from deepagents.middleware.rubric import RubricMiddleware


def test_rubric_definitions_completeness():
    """Verify all 4 domain rubrics and the composite rubric contain required statutory thresholds."""
    assert "Section 3(p)" in STATUTORY_PRECISION_RUBRIC
    assert "Section 3(e)" in STATUTORY_PRECISION_RUBRIC
    assert "Form III" in STATUTORY_PRECISION_RUBRIC
    assert "Class 5" in STATUTORY_PRECISION_RUBRIC

    assert "11992510" in PRIOR_ART_GROUNDING_RUBRIC
    assert "Charaka" in PRIOR_ART_GROUNDING_RUBRIC
    assert "Pharmacopoeia" in PRIOR_ART_GROUNDING_RUBRIC

    assert "Section 55" in RISK_CALIBRATION_RUBRIC
    assert "Section 64(1)(q)" in RISK_CALIBRATION_RUBRIC
    assert "Combination Index" in RISK_CALIBRATION_RUBRIC

    assert "roadmap" in ACTIONABLE_ROADMAP_RUBRIC.lower()
    assert "opposition" in ACTIONABLE_ROADMAP_RUBRIC.lower()

    # Composite rubric
    assert "Criterion 1" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 4" in AYUNOVA_COMPOSITE_RUBRIC


def test_rubric_evaluation_grounded_answer():
    """Verify evaluate_response_against_rubric passes a high-quality, grounded legal response."""
    grounded_answer = (
        "AYUNOVA Legal Assessment:\n\n"
        "1. Statutory Grounding under The Patents Act, 1970:\n"
        "- Under Section 3(p), traditional Ayurvedic compositions are barred from patentability.\n"
        "- Under Section 3(e), mere admixtures are unpatentable unless synergism is proven (Combination Index CI < 0.9).\n\n"
        "2. Biological Diversity Act, 2023 Compliance:\n"
        "- Mandatory National Biodiversity Authority (NBA) Form III approval required under Section 6 & Section 19.\n"
        "- Non-compliance triggers statutory penalties under Section 55 and revocation risk under Section 64(1)(q).\n\n"
        "3. Prior Art Grounding:\n"
        "- Evaluated against US Patent 11992510 and classical treatises (Charaka Samhita and Sushruta Samhita).\n\n"
        "4. Actionable Procedural Roadmap:\n"
        "- Step 1: File NBA Form III.\n"
        "- Step 2: Submit Chou-Talalay synergistic Combination Index affidavit."
    )
    result = evaluate_response_against_rubric(grounded_answer)
    assert result["passed"] is True
    assert result["score"] >= 0.75
    assert result["passed_criteria_count"] >= 3
    assert len(result["criteria"]) == 4


def test_rubric_evaluation_vague_answer_fails():
    """Verify evaluate_response_against_rubric rejects vague, ungrounded responses."""
    vague_answer = "You cannot patent natural herbs in India because patent law prohibits it. Be careful."
    result = evaluate_response_against_rubric(vague_answer)
    assert result["passed"] is False
    assert result["score"] < 0.5
    assert "Missing specific Act or Section citations" in result["feedback"]


def test_rubric_middleware_construction():
    """Verify build_ayunova_rubric_middleware instantiates a valid RubricMiddleware."""
    model = OfflineAyushChatModel()
    middleware = build_ayunova_rubric_middleware(model=model, max_iterations=2)
    assert isinstance(middleware, RubricMiddleware)
    assert middleware.max_iterations == 2


def test_portfolio_memory_lifecycle():
    """Verify portfolio memory initialization, read, update, append, and reset."""
    # Reset to pristine
    initial_text = reset_portfolio_memory()
    assert "AYUNOVA Intellectual Property Portfolio" in initial_text
    assert "Triphala" in initial_text
    assert "US Patent 11992510" in initial_text
    assert "Form III" in initial_text

    # Read
    read_text = read_portfolio_memory()
    assert read_text == initial_text

    # Append entry
    updated = append_portfolio_entry("1. Active Botanical Formulations", "Ashwagandha + Curcumin novel phytosome")
    assert "Ashwagandha + Curcumin" in updated
    assert read_portfolio_memory() == updated

    # Reset
    reset_text = reset_portfolio_memory()
    assert "Ashwagandha + Curcumin" not in reset_text


def test_deep_agent_compiles_with_memory_and_skills():
    """Verify build_ayush_deep_agent compiles with both skills and portfolio memory by default."""
    agent = build_ayush_deep_agent()
    assert agent is not None
    assert hasattr(agent, "invoke")
    assert hasattr(agent, "stream")


def test_deep_agent_compiles_with_rubric_middleware():
    """Verify build_ayush_deep_agent compiles cleanly when enable_rubric=True."""
    agent = build_ayush_deep_agent(enable_rubric=True)
    assert agent is not None
    assert hasattr(agent, "invoke")


def test_deep_agent_memory_and_skills_invocation_end_to_end():
    """Verify end-to-end execution of deep agent with memory, skills, and subagents active."""
    from langchain_core.messages import HumanMessage
    agent = build_ayush_deep_agent()
    response = agent.invoke({
        "messages": [
            HumanMessage(
                content=(
                    "What active formulations and prior art are currently tracked in my AYUNOVA research portfolio, "
                    "and what are the NBA Form III requirements?"
                )
            )
        ]
    })
    assert isinstance(response, dict)
    assert "messages" in response
    assert len(response["messages"]) >= 1
    last_message = response["messages"][-1]
    content = str(last_message.content)
    assert len(content) > 50
    assert ("Patents Act" in content or "3(p)" in content or "Form III" in content or "NBA" in content)


def test_deep_agent_memory_override_and_disable():
    """Verify caller can explicitly disable memory via memory=[] without breaking the agent."""
    agent_no_memory = build_ayush_deep_agent(memory=[])
    assert agent_no_memory is not None
    assert hasattr(agent_no_memory, "invoke")
