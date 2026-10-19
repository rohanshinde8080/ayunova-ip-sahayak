"""
Phase 3 Test Suite: DeepAgent System Prompt Depth Standards & Bias Elimination (RC6)
Validates:
1. Complete removal of anti-detail instructions ("unnecessarily long", "keep concise", 3-8 line limits).
2. Addition of mandatory line depth minimums (10-20 simple, 30-60 moderate, full dossier complex).
3. Section-level depth criteria (>=4 bullets under Why, exact statutory quotes, Chou-Talalay CI < 0.8, Schedule T).
4. DeepAgent compilation and execution integrity with updated system prompt.
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents.deep_agent_factory import AYUNOVA_SYSTEM_PROMPT, build_ayush_deep_agent, OfflineAyushChatModel


def test_phase3_no_anti_detail_bias_in_prompt():
    """Verify all anti-detail, brevity-forcing phrases have been eliminated."""
    anti_patterns = [
        "unnecessarily long",
        "Keep the answer concise unless",
        "Simple question → 3–8 lines",
        "Moderate question → 5–15 lines",
        "Do NOT give a long textbook explanation",
        "Answer simply.",
    ]
    for pattern in anti_patterns:
        assert pattern not in AYUNOVA_SYSTEM_PROMPT, f"Anti-detail bias pattern found: '{pattern}'"


def test_phase3_mandatory_depth_standards_present():
    """Verify explicit depth requirements and statutory minimums are established."""
    required_phrases = [
        "ANSWER LENGTH & DEPTH STANDARDS (CRITICAL)",
        "ALWAYS provide a COMPLETE, DETAILED analysis — NEVER a short summary",
        "Simple conceptual question → 10–20 lines",
        "Moderate IP/regulatory question → 30–60 lines",
        "Complex patentability/multi-issue research → Full comprehensive dossier",
        "Each \"### Why\" section must have ≥4",
        "Chou-Talalay Combination Index CI < 0.8",
        "Schedule T heavy metal limits",
        "CSIR Curcumin revocation (US 5,401,504)",
        "EPO Neem revocation (EP0436257)",
        "Biological Diversity Act Section 6",
    ]
    for phrase in required_phrases:
        assert phrase in AYUNOVA_SYSTEM_PROMPT, f"Mandatory depth standard missing: '{phrase}'"


def test_phase3_deep_agent_compiles_with_new_prompt():
    """Verify DeepAgent compiles and can be invoked with updated system prompt."""
    agent = build_ayush_deep_agent()
    assert agent is not None
    assert hasattr(agent, "invoke")

    # Verify execution with OfflineAyushChatModel
    response = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": "Can I patent an Ayurvedic formulation of Ashwagandha and Curcumin?"
            }
        ]
    })
    assert isinstance(response, dict)
    assert "messages" in response
    last_msg = response["messages"][-1]
    assert len(str(last_msg.content)) > 50
