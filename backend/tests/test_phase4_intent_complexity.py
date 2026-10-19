"""
Phase 4 Test Suite: Intent Classifier Complexity Defaults (RC1/RC3 integration)
Validates:
1. Patentability, Section 3(e) synergism, Section 3(p) application, regulatory licensing,
   novelty, and inventive step queries default to COMPLEX complexity.
2. Formulation guidance with synergy/extraction terms defaults to COMPLEX.
3. Simple concept definitions (e.g. "What is Section 3(p)?") route to SIMPLE.
4. Minimal research routing and deep agent flags align with query complexity.
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.intent_classifier import IntentClassifier


def test_phase4_patentability_query_is_complex():
    """Verify patentability questions resolve to COMPLEX."""
    queries = [
        "Can I patent my Ashwagandha formulation?",
        "Is it patentable to combine Curcumin with Piperine for arthritis?",
        "Can we patent a synergistic extract of Triphala?",
    ]
    for q in queries:
        res = IntentClassifier.classify_intent(q)
        assert res["complexity"] == "COMPLEX", f"Expected COMPLEX for '{q}', got {res['complexity']}"
        assert res["needs_deep_agent"] is True


def test_phase4_section_3e_synergy_is_complex():
    """Verify Section 3(e) and synergism queries resolve to COMPLEX."""
    queries = [
        "How to prove synergy under Section 3(e) with Combination Index CI < 1.0?",
        "What data satisfies Section 3(e) mere admixture bar for herbal combinations?",
    ]
    for q in queries:
        res = IntentClassifier.classify_intent(q)
        assert res["complexity"] == "COMPLEX", f"Expected COMPLEX for '{q}', got {res['complexity']}"
        assert res["intent"] == "Section 3(e) Assessment"


def test_phase4_regulatory_licensing_is_complex():
    """Verify Rule 158B, Form 25D, and Schedule T queries resolve to COMPLEX."""
    queries = [
        "How do I apply for Form 25D manufacturing license under Rule 158B?",
        "What are the Schedule T GMP requirements for heavy metal testing?",
        "Explain NBA Form III clearance under the Biological Diversity Act",
    ]
    for q in queries:
        res = IntentClassifier.classify_intent(q)
        assert res["complexity"] == "COMPLEX", f"Expected COMPLEX for '{q}', got {res['complexity']}"
        assert res["intent"] == "Regulatory Guidance"


def test_phase4_novelty_and_inventive_step_are_complex():
    """Verify novelty and inventive step queries resolve to COMPLEX."""
    queries = [
        "How do I establish an inventive step over classical Ayurvedic treatises?",
        "Is my novel extraction process novel under Section 48?",
    ]
    for q in queries:
        res = IntentClassifier.classify_intent(q)
        assert res["complexity"] == "COMPLEX", f"Expected COMPLEX for '{q}', got {res['complexity']}"


def test_phase4_formulation_synergy_is_complex():
    """Verify botanical queries with synergy or extraction markers resolve to COMPLEX."""
    q = "Ashwagandha and Curcumin formulation with standardized withaferin A marker synergy"
    res = IntentClassifier.classify_intent(q)
    assert res["complexity"] == "COMPLEX", f"Expected COMPLEX for '{q}', got {res['complexity']}"
    assert res["intent"] == "Ayurveda / Formulation Guidance"


def test_phase4_concept_definitions_remain_simple():
    """Verify basic definitional 'What is' queries resolve to SIMPLE or MODERATE."""
    q_simple = "What is Section 3(p)?"
    res_simple = IntentClassifier.classify_intent(q_simple)
    assert res_simple["complexity"] == "SIMPLE"
    assert res_simple["archetype"] == "CONCEPT_EXPLANATION"
    assert res_simple["needs_deep_agent"] is False
