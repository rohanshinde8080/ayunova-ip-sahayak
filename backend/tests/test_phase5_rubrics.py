"""
Tests for Phase 5: Evaluator-Optimizer Rubrics & Quality Gating Suite.
Validates the 8 composite rubrics, deduplication checks, legal safety gates,
user-first structure enforcement, and follow-up caps.
"""

import pytest
from app.agents.rubrics import (
    AYUNOVA_COMPOSITE_RUBRIC,
    STATUTORY_PRECISION_RUBRIC,
    PRIOR_ART_GROUNDING_RUBRIC,
    RISK_CALIBRATION_RUBRIC,
    ACTIONABLE_ROADMAP_RUBRIC,
    USER_FIRST_RUBRIC,
    DEDUPLICATION_AND_VERIFICATION_RUBRIC,
    LEGAL_SAFETY_RUBRIC,
    FOLLOW_UP_CAP_RUBRIC,
    evaluate_response_against_rubric,
    evaluate_deep_agent_rubrics,
)
from app.models.schemas import PatentRecord


def test_composite_rubric_contains_all_eight_criteria():
    """Verify AYUNOVA_COMPOSITE_RUBRIC contains all 8 criteria."""
    assert "Criterion 1: Statutory Precision" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 2: Prior Art & Classical Grounding" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 3: Risk Calibration & Penalty Warning" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 4: Actionable Procedural Roadmap" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 5: User-First Structure & Responsive Formatting" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 6: Deduplication & Strict Verification" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 7: Legal Safety & Non-Absolute Wording" in AYUNOVA_COMPOSITE_RUBRIC
    assert "Criterion 8: Follow-Up Options Cap (Max 2)" in AYUNOVA_COMPOSITE_RUBRIC


def test_evaluate_deep_agent_rubrics_returns_eight_criteria():
    """Verify evaluate_deep_agent_rubrics evaluates all 8 criteria."""
    grounded_answer = (
        "### Short Answer\n\n"
        "Natural Ashwagandha extracts are generally non-patentable under Section 3(p) of the Patents Act, 1970.\n\n"
        "### Why\n\n"
        "- Under Section 3(p), traditional knowledge is barred.\n"
        "- Under Section 3(e), synergistic efficacy must be proved with Combination Index CI < 0.9.\n"
        "- Under Section 6 & 19 of the Biological Diversity Act, NBA Form III approval is mandatory.\n"
        "- Failure to obtain NBA clearance triggers Section 55 penalties.\n"
        "- Prior art evaluated against US Patent 11992510 and Charaka Samhita.\n\n"
        "### Recommended Next Step\n\n"
        "1. File NBA Form III.\n"
        "2. Conduct synergy bioassay.\n\n"
        "### Grounded Evidence\n\n"
        "- The Patents Act, 1970 (Section 3(p), Section 3(e))\n"
        "- Current legal status not verified for foreign equivalents."
    )

    result = evaluate_deep_agent_rubrics(
        response_text=grounded_answer,
        retrieved_sources=[{"id": "src-1", "title": "Patents Act Sec 3(p)"}],
        follow_up_suggestions=["Can I patent with piperine?", "What is Rule 158B?"],
        patent_records=[
            PatentRecord(
                publicationNumber="US11992510B2",
                title="Triphala synergistic composition",
                legalStatus="Active",
                jurisdiction="US",
                isFamilyMember=False,
                verified=True,
            )
        ],
    )

    assert result["total_criteria_count"] == 8
    assert len(result["criteria"]) == 8
    assert result["passed"] is True
    assert result["overall_score"] >= 80
    assert result["criteria_breakdown"]["User-First Structure"] is True
    assert result["criteria_breakdown"]["Legal Safety"] is True
    assert result["criteria_breakdown"]["Deduplication & Verification"] is True
    assert result["criteria_breakdown"]["Follow-Up Options Cap"] is True


def test_user_first_structure_rubric_passes_and_fails():
    """Verify User-First Structure rubric detects direct answers and rejects boilerplate preambles."""
    valid_user_first = (
        "### Short Answer\n\n"
        "Direct answer: Not patentable as a whole.\n\n"
        "### Grounded Evidence\n- Patents Act Section 3(p)"
    )
    result_valid = evaluate_response_against_rubric(valid_user_first, rubric_type="extended")
    assert result_valid["criteria_breakdown"]["User-First Structure"] is True

    # Executive Summary boilerplate fails
    boilerplate_answer = (
        "Executive Summary: Here is the latest intelligence you requested regarding Indian IP law.\n"
        "Section 3(p) prohibits traditional herbs."
    )
    result_invalid = evaluate_response_against_rubric(boilerplate_answer, rubric_type="extended")
    assert result_invalid["criteria_breakdown"]["User-First Structure"] is False


def test_deduplication_rubric_passes_and_fails_on_duplicate_pub():
    """Verify Deduplication & Verification rubric flags duplicate publications."""
    # Unique patent records pass
    records_unique = [
        PatentRecord(
            publicationNumber="US11992510B2",
            title="Patent 1",
            legalStatus="Active",
            jurisdiction="US",
            isFamilyMember=False,
            verified=True,
        ),
        PatentRecord(
            publicationNumber="WO2023141607A2",
            title="Patent 2",
            legalStatus="Active",
            jurisdiction="WO",
            isFamilyMember=False,
            verified=True,
        ),
    ]
    res_unique = evaluate_response_against_rubric(
        "### Direct Answer\nValid response without duplicate publication numbers.",
        rubric_type="extended",
        patent_records=records_unique,
    )
    assert res_unique["criteria_breakdown"]["Deduplication & Verification"] is True

    # Duplicate publication records fail
    records_duplicate = [
        PatentRecord(
            publicationNumber="US11992510B2",
            title="Patent 1",
            legalStatus="Active",
            jurisdiction="US",
            isFamilyMember=False,
            verified=True,
        ),
        PatentRecord(
            publicationNumber="US-11992510-B2",  # Equivalent normalized publication
            title="Patent 1 Duplicate",
            legalStatus="Active",
            jurisdiction="US",
            isFamilyMember=False,
            verified=True,
        ),
    ]
    res_dup = evaluate_response_against_rubric(
        "### Direct Answer\nContains duplicate publication records.",
        rubric_type="extended",
        patent_records=records_duplicate,
    )
    assert res_dup["criteria_breakdown"]["Deduplication & Verification"] is False


def test_legal_safety_rubric_strictly_fails_on_absolute_guarantees():
    """Verify Legal Safety rubric strictly fails whenever absolute guarantees are made."""
    unsafe_text = (
        "### Short Answer\n\n"
        "Your formulation will definitely be rejected by the Indian Patent Office under Section 3(p). "
        "It is guaranteed to fail."
    )
    result = evaluate_response_against_rubric(unsafe_text, rubric_type="extended")
    assert result["criteria_breakdown"]["Legal Safety"] is False
    assert result["passed"] is False  # Legal Safety is a hard gating constraint!


def test_legal_safety_rubric_passes_on_calibrated_language():
    """Verify Legal Safety rubric passes when reasoned, calibrated statutory phrasing is used."""
    safe_text = (
        "### Short Answer\n\n"
        "The formulation may face an objection under Section 3(p) of the Patents Act, 1970 as traditional knowledge. "
        "Overcoming this potential statutory objection would require comparative bio-synergy data under Section 3(e)."
    )
    result = evaluate_response_against_rubric(safe_text, rubric_type="extended")
    assert result["criteria_breakdown"]["Legal Safety"] is True


def test_follow_up_cap_rubric_passes_at_two_and_fails_at_three():
    """Verify Follow-Up Options Cap rubric strictly enforces max 2 follow-up suggestions."""
    # 2 follow-ups pass
    res_2 = evaluate_response_against_rubric(
        "### Short Answer\nTest.",
        rubric_type="extended",
        follow_up_suggestions=["Option 1", "Option 2"],
    )
    assert res_2["criteria_breakdown"]["Follow-Up Options Cap"] is True

    # 1 follow-up passes
    res_1 = evaluate_response_against_rubric(
        "### Short Answer\nTest.",
        rubric_type="extended",
        follow_up_suggestions=["Option 1"],
    )
    assert res_1["criteria_breakdown"]["Follow-Up Options Cap"] is True

    # 3 follow-ups fail
    res_3 = evaluate_response_against_rubric(
        "### Short Answer\nTest.",
        rubric_type="extended",
        follow_up_suggestions=["Option 1", "Option 2", "Option 3"],
    )
    assert res_3["criteria_breakdown"]["Follow-Up Options Cap"] is False


def test_backwards_compatibility_core_rubric():
    """Verify evaluate_response_against_rubric defaults to rubric_type='core' with exactly 4 criteria."""
    core_text = (
        "AYUNOVA Legal Assessment:\n\n"
        "Under Section 3(p) and Section 3(e) of Patents Act 1970, and BDA Section 19 Form III.\n"
        "Prior art evaluated against US Patent 11992510 and Charaka Samhita.\n"
        "Section 55 penalties apply for non-compliance.\n"
        "Actionable roadmap: Step 1: File Form III."
    )
    result = evaluate_response_against_rubric(core_text)
    assert result["total_criteria_count"] == 4
    assert len(result["criteria"]) == 4
    assert result["passed"] is True
