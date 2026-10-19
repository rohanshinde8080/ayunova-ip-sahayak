"""
Phase 5 Test Suite: SubAgent Prompts Depth Standards & Brevity Elimination
Validates:
1. Complete removal of brevity constraints (e.g. "concisely") across specialist prompts.
2. Injection of explicit depth mandates for all 4 subagents:
   - patent-examiner: complete dossier, Chou-Talalay, Turmeric landmark case, 3 overcoming pathways.
   - biodiversity-compliance: Form III timing, ABS calculation percentages, 2023 amendment penalties.
   - ayush-tkdl-specialist: Brihat/Laghu Trayi citations, API monographs, TKDL opposition brief.
   - trademark-brand-strategist: Dual Nice classification (Class 5 & 3), Section 9 clearance, 4-step roadmap.
3. SubAgent instantiation and tool wiring integrity.
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents.subagents import (
    PATENT_EXAMINER_PROMPT,
    BIODIVERSITY_COMPLIANCE_PROMPT,
    AYUSH_TKDL_PROMPT,
    TRADEMARK_BRAND_PROMPT,
    build_patent_examiner_subagent,
    build_biodiversity_compliance_subagent,
    build_ayush_tkdl_subagent,
    build_trademark_brand_subagent,
    get_all_subagents,
)


def test_phase5_patent_examiner_depth_mandates():
    """Verify patent-examiner subagent prompt enforces exhaustive depth without brevity limits."""
    # No brevity constraint
    assert "concisely" not in PATENT_EXAMINER_PROMPT
    assert "brief" not in PATENT_EXAMINER_PROMPT.lower() or "brief" in "TKDL Prior Art Opposition Brief"

    # Mandatory depth instructions
    assert "CRITICAL DEPTH & EXHAUSTIVENESS MANDATE" in PATENT_EXAMINER_PROMPT
    assert "COMPLETE, DETAILED PATENT EXAMINATION DOSSIER" in PATENT_EXAMINER_PROMPT
    assert "Chou-Talalay Combination Index" in PATENT_EXAMINER_PROMPT
    assert "Turmeric US 5,401,504" in PATENT_EXAMINER_PROMPT
    assert "Section 48 novel extraction" in PATENT_EXAMINER_PROMPT
    assert "Section 6 BDA Clearance" in PATENT_EXAMINER_PROMPT
    assert "30–50 substantive lines" in PATENT_EXAMINER_PROMPT


def test_phase5_biodiversity_compliance_depth_mandates():
    """Verify biodiversity-compliance subagent prompt enforces regulatory rigor."""
    assert "CRITICAL DEPTH & REGULATORY RIGOR MANDATE" in BIODIVERSITY_COMPLIANCE_PROMPT
    assert "COMPLETE, ACTIONABLE BIODIVERSITY COMPLIANCE DOSSIER" in BIODIVERSITY_COMPLIANCE_PROMPT
    assert "Section 6 Prior Approval Rule" in BIODIVERSITY_COMPLIANCE_PROMPT
    assert "Access & Benefit Sharing (ABS) Calculations" in BIODIVERSITY_COMPLIANCE_PROMPT
    assert "Biological Diversity (Amendment) Act, 2023" in BIODIVERSITY_COMPLIANCE_PROMPT
    assert "25–40 substantive lines" in BIODIVERSITY_COMPLIANCE_PROMPT


def test_phase5_ayush_tkdl_depth_mandates():
    """Verify ayush-tkdl subagent prompt enforces classical treatise depth."""
    assert "CRITICAL DEPTH & SCHOLARLY RIGOR MANDATE" in AYUSH_TKDL_PROMPT
    assert "COMPLETE SCHOLARLY PRIOR ART & CLASSICAL TREATISE DOSSIER" in AYUSH_TKDL_PROMPT
    assert "Brihat Trayi" in AYUSH_TKDL_PROMPT
    assert "Laghu Trayi" in AYUSH_TKDL_PROMPT
    assert "Ayurvedic Pharmacopoeia of India (API)" in AYUSH_TKDL_PROMPT
    assert "TKDL Examination Workflow" in AYUSH_TKDL_PROMPT
    assert "25–40 substantive lines" in AYUSH_TKDL_PROMPT


def test_phase5_trademark_brand_depth_mandates():
    """Verify trademark-brand subagent prompt enforces dual-class strategy."""
    assert "CRITICAL DEPTH & COMMERCIAL STRATEGY MANDATE" in TRADEMARK_BRAND_PROMPT
    assert "COMPREHENSIVE COMMERCIAL BRAND PROTECTION DOSSIER" in TRADEMARK_BRAND_PROMPT
    assert "Dual Nice Classification Strategy" in TRADEMARK_BRAND_PROMPT
    assert "Section 9 Absolute Grounds Clearance" in TRADEMARK_BRAND_PROMPT
    assert "4-Step Commercial Branding Roadmap" in TRADEMARK_BRAND_PROMPT
    assert "25–40 substantive lines" in TRADEMARK_BRAND_PROMPT


def test_phase5_subagents_instantiation():
    """Verify all 4 subagents build cleanly and expose registered tools."""
    subagents = get_all_subagents()
    assert len(subagents) == 4
    for s in subagents:
        assert len(s["tools"]) >= 3
        assert len(s["system_prompt"]) > 500
