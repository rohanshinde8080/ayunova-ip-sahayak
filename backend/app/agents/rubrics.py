"""
AYUNOVA Evaluator-Optimizer Rubrics Suite.
Implements domain-specific evaluation criteria and self-correction rubrics:
1. STATUTORY_PRECISION_RUBRIC: Exact Act and Section naming (Sec 3(p), 3(d), 3(e), Sec 6/19 BDA).
2. PRIOR_ART_GROUNDING_RUBRIC: Grounding against US Patent 11992510, TKDL shlokas, and API monographs.
3. RISK_CALIBRATION_RUBRIC: Low-confidence gating on missing NBA approvals & Sec 55 penalty alerts.
4. ACTIONABLE_ROADMAP_RUBRIC: Structured step-by-step procedural roadmaps.
"""

import re
import logging
from typing import Dict, List, Any, Optional
try:
    from deepagents.middleware.rubric import RubricMiddleware
except ImportError:
    class RubricMiddleware:
        def __init__(self, model: Any, system_prompt: str = "", max_iterations: int = 2):
            self.model = model
            self.system_prompt = system_prompt
            self.max_iterations = max_iterations


logger = logging.getLogger("ayunova.agents.rubrics")

# ============================================================================
# 1. Domain Rubric Criteria Definitions
# ============================================================================

STATUTORY_PRECISION_RUBRIC = """Every legal claim must specifically name the relevant Indian Act and statutory Section:
- The Patents Act, 1970: Section 3(p) for traditional knowledge, Section 3(e) for mere admixtures, Section 3(d) for enhanced efficacy, or Section 25 for oppositions.
- The Biological Diversity Act, 2002/2023: Section 6 & Section 19 for mandatory Form III approval, Section 7 for SBB intimation, and Section 55 for penalties.
- The Trade Marks Act, 1999: Nice Classification Class 5 vs Class 3, and Section 9 for distinctiveness.
Generic phrases like 'patent law says' or 'biodiversity rules apply' are strictly prohibited without specific section citations."""

PRIOR_ART_GROUNDING_RUBRIC = """All cited prior art patents, classical Ayurvedic treatises, or pharmacopoeial standards must be factually grounded:
- Target prior art patents (such as US Patent 11992510 regarding Triphala with Bacillus coagulans) must be analyzed with claim scope comparison.
- Classical Sanskrit literature must cite authoritative treatises (Charaka Samhita, Sushruta Samhita, Astanga Hridaya) or Ayurvedic Pharmacopoeia of India (API) standards.
- Unsubstantiated or hallucinated patent numbers and treatise references are prohibited."""

RISK_CALIBRATION_RUBRIC = """The assessment must properly calibrate legal risk and statutory penalties:
- If Indian biological resources are used without pre-grant NBA approval, the assessment must explicitly warn of Section 55 penalties and patent invalidation risk under Section 64(1)(q).
- If formulations contain synthetic additives without bio-efficacy synergy proofs, confidence must be calibrated with explicit risk warnings.
- Synergism requirements under Section 3(e) must specify quantitative experimental metrics (e.g. Combination Index CI < 1.0 or isobologram proof)."""

ACTIONABLE_ROADMAP_RUBRIC = """The legal assessment must conclude with an actionable, structured procedural roadmap:
- Clear, bulleted or numbered action items for the applicant or patent controller.
- Concrete filing stages (e.g. provisional filing, Form III submission, Form 7A pre-grant opposition, or trademark dual-filing roadmap)."""

USER_FIRST_RUBRIC = """The response must be user-first, direct, and structured according to responsive format archetypes:
- Must start immediately with the direct answer, short answer, table, or concept definition (e.g. '### Short Answer', '### Direct Answer', '### Found Patents', '### What is...').
- Boilerplate intros, generic preambles, and filler (e.g. 'Executive Summary', 'Here is the intelligence you requested') are strictly prohibited.
- For patentability questions, must follow Short Answer -> Why -> What You Should Check -> Recommended Next Step -> Grounded Evidence.
- Must cite grounded evidence at the conclusion."""

DEDUPLICATION_AND_VERIFICATION_RUBRIC = """All patent and evidence records must be strictly verified and deduplicated:
- Zero publication numbers may be counted or cited twice.
- Multiple publications from the same patent family must be identified and tagged with 'Same patent family'.
- Unverified fields (application numbers, priority dates, legal status) must strictly default to 'Not Verified' or 'Current legal status not verified.' rather than hallucinated facts."""

LEGAL_SAFETY_RUBRIC = """Legal guidance must maintain strict legal safety standards:
- Clear separation between statutory legal provision, retrieved evidence, agent interpretation, and practical recommendation.
- Strictly no definitive legal guarantees or absolute claims (e.g., 'will definitely be rejected', 'guaranteed to be granted', '100% invalid').
- Must use reasoned, calibrated statutory phrasing (e.g., 'may face an objection under Section 3(p)', 'would require comparative synergism data under Section 3(e)')."""

FOLLOW_UP_CAP_RUBRIC = """Follow-up suggestions must be concise, relevant, and strictly capped:
- The response must provide at most 2 follow-up options (len(followUpSuggestions) <= 2).
- Irrelevant, open-ended, or excess (>2) suggestions are prohibited."""

AYUNOVA_COMPOSITE_RUBRIC = f"""# AYUNOVA Legal Intelligence Quality Rubric

## Criterion 1: Statutory Precision
{STATUTORY_PRECISION_RUBRIC}

## Criterion 2: Prior Art & Classical Grounding
{PRIOR_ART_GROUNDING_RUBRIC}

## Criterion 3: Risk Calibration & Penalty Warning
{RISK_CALIBRATION_RUBRIC}

## Criterion 4: Actionable Procedural Roadmap
{ACTIONABLE_ROADMAP_RUBRIC}

## Criterion 5: User-First Structure & Responsive Formatting
{USER_FIRST_RUBRIC}

## Criterion 6: Deduplication & Strict Verification
{DEDUPLICATION_AND_VERIFICATION_RUBRIC}

## Criterion 7: Legal Safety & Non-Absolute Wording
{LEGAL_SAFETY_RUBRIC}

## Criterion 8: Follow-Up Options Cap (Max 2)
{FOLLOW_UP_CAP_RUBRIC}
"""


# ============================================================================
# 2. Rule-Based Evaluator Engine
# ============================================================================

def evaluate_response_against_rubric(
    response_text: str,
    rubric_type: str = "core",
    retrieved_sources: Optional[List[Dict[str, Any]]] = None,
    follow_up_suggestions: Optional[List[str]] = None,
    patent_records: Optional[List[Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates a candidate legal answer against AYUNOVA quality rubrics.
    
    Args:
        response_text: Generated legal analysis text.
        rubric_type: 'core' (4 core criteria), 'extended' / 'deep_agent' / 'all' (all 8 criteria),
                     or specific criterion name.
        retrieved_sources: Optional list of retrieved evidence sources.
        follow_up_suggestions: Optional list of follow-up suggestions (capped at <= 2).
        patent_records: Optional list of PatentRecord objects or dicts.
        
    Returns:
        Dict with overall 'passed' status, numeric score (0.0 - 1.0 and 0 - 100), and per-criterion evaluations.
    """
    evaluations: List[Dict[str, Any]] = []
    text_lower = response_text.lower()
    
    # 1. Statutory Precision Evaluation
    statute_citations = []
    if re.search(r"section\s+3\(p\)", text_lower) or "3(p)" in response_text:
        statute_citations.append("Section 3(p)")
    if re.search(r"section\s+3\(e\)", text_lower) or "3(e)" in response_text:
        statute_citations.append("Section 3(e)")
    if re.search(r"section\s+3\(d\)", text_lower) or "3(d)" in response_text:
        statute_citations.append("Section 3(d)")
    if re.search(r"section\s+19", text_lower) or re.search(r"section\s+6", text_lower) or "form iii" in text_lower:
        statute_citations.append("BDA Section 6/19 Form III")
    if "patents act" in text_lower or "patent act" in text_lower:
        statute_citations.append("Patents Act 1970")
    if "biological diversity" in text_lower or "nba" in text_lower:
        statute_citations.append("Biological Diversity Act")

    statutory_passed = len(statute_citations) >= 2
    evaluations.append({
        "name": "Statutory Precision",
        "passed": statutory_passed,
        "score": 1.0 if statutory_passed else (0.5 if len(statute_citations) == 1 else 0.0),
        "citations_found": statute_citations,
        "gap": "Missing specific Act or Section citations (e.g. Patents Act Sec 3(p)/3(e) or BDA Form III)" if not statutory_passed else None
    })

    # 2. Prior Art & Classical Grounding Evaluation
    prior_art_markers = []
    if "11992510" in response_text or "prior art" in text_lower:
        prior_art_markers.append("Patent Prior Art")
    if "charaka" in text_lower or "sushruta" in text_lower or "treatise" in text_lower or "shloka" in text_lower:
        prior_art_markers.append("Classical Treatises")
    if "tkdl" in text_lower or "traditional knowledge" in text_lower or "pharmacopoeia" in text_lower:
        prior_art_markers.append("Traditional Knowledge / API")
    if retrieved_sources and len(retrieved_sources) > 0:
        prior_art_markers.append(f"Retrieved Verified Evidence ({len(retrieved_sources)} sources)")

    grounding_passed = len(prior_art_markers) >= 1
    evaluations.append({
        "name": "Prior Art Grounding",
        "passed": grounding_passed,
        "score": 1.0 if grounding_passed else 0.0,
        "markers_found": prior_art_markers,
        "gap": "Missing grounded prior art reference or classical treatise citation" if not grounding_passed else None
    })

    # 3. Risk Calibration Evaluation
    risk_markers = []
    if "penalty" in text_lower or "section 55" in text_lower or "rejection" in text_lower or "objection" in text_lower:
        risk_markers.append("Statutory Penalty/Objection Notice")
    if "synerg" in text_lower or "combination index" in text_lower or "admixture" in text_lower:
        risk_markers.append("Synergism / Section 3(e) Proof Threshold")
    if "confidence" in text_lower or "risk" in text_lower or "non-patentable" in text_lower:
        risk_markers.append("Risk/Confidence Calibration")

    risk_passed = len(risk_markers) >= 1
    evaluations.append({
        "name": "Risk Calibration",
        "passed": risk_passed,
        "score": 1.0 if risk_passed else 0.0,
        "markers_found": risk_markers,
        "gap": "Missing statutory risk evaluation or Section 3(e)/55 penalty assessment" if not risk_passed else None
    })

    # 4. Actionable Roadmap Evaluation
    roadmap_markers = []
    if any(marker in text_lower for marker in ["recommendation", "roadmap", "next steps", "action", "filing", "1.", "step 1"]):
        roadmap_markers.append("Procedural Guidance")

    roadmap_passed = len(roadmap_markers) >= 1
    evaluations.append({
        "name": "Actionable Roadmap",
        "passed": roadmap_passed,
        "score": 1.0 if roadmap_passed else 0.0,
        "markers_found": roadmap_markers,
        "gap": "Missing actionable procedural next steps or filing roadmap" if not roadmap_passed else None
    })

    # Evaluate Extended Criteria if requested (or for full quality gating)
    include_extended = rubric_type in ["extended", "deep_agent", "all", "full", "user_first", "deduplication", "safety", "follow_up"]
    if include_extended:
        # 5. User-First Structure & Responsive Formatting
        user_first_markers = []
        has_exec_summary_boilerplate = "executive summary" in text_lower or "latest intelligence you requested" in text_lower
        has_archetype_header = any(h in text_lower for h in [
            "### short answer", "### direct answer", "### found patents", 
            "### what is", "### comparison", "| patent |", "| evaluation parameter |",
            "statutory patentability", "comprehensive trademark"
        ])
        has_grounded_evidence_section = "grounded evidence" in text_lower or "source [" in text_lower or (retrieved_sources and len(retrieved_sources) > 0)

        if has_archetype_header:
            user_first_markers.append("Archetype Header / User-First Structure Detected")
        if not has_exec_summary_boilerplate:
            user_first_markers.append("Zero Boilerplate Preamble")
        if has_grounded_evidence_section:
            user_first_markers.append("Grounded Evidence Block Attached")

        user_first_passed = has_archetype_header and not has_exec_summary_boilerplate
        evaluations.append({
            "name": "User-First Structure",
            "passed": user_first_passed,
            "score": 1.0 if user_first_passed else 0.0,
            "markers_found": user_first_markers,
            "gap": "Contains prohibited 'Executive Summary' boilerplate or missing direct archetype header" if not user_first_passed else None
        })

        # 6. Deduplication & Strict Verification
        dedup_markers = []
        has_duplicate_pub = False

        if patent_records:
            seen_pubs = set()
            for p in patent_records:
                pub = getattr(p, "publicationNumber", None) or (p.get("publicationNumber") if isinstance(p, dict) else str(p))
                if pub:
                    norm = re.sub(r'[\s,\-_/]', '', pub).upper()
                    if norm in seen_pubs:
                        has_duplicate_pub = True
                        break
                    seen_pubs.add(norm)
        
        pat_matches = re.findall(r'`([A-Z]{2}\d{6,10}(?:[A-Z]\d?)?)`', response_text)
        if pat_matches and len(pat_matches) != len(set(pat_matches)):
            has_duplicate_pub = True

        if not has_duplicate_pub:
            dedup_markers.append("Zero Duplicate Publications Counted")
        if "not verified" in text_lower or "current legal status not verified" in text_lower or (patent_records and any(getattr(p, "applicant", "") == "Not Verified" for p in patent_records if hasattr(p, "applicant"))):
            dedup_markers.append("Strict Verification Defaults Applied")

        dedup_passed = not has_duplicate_pub
        evaluations.append({
            "name": "Deduplication & Verification",
            "passed": dedup_passed,
            "score": 1.0 if dedup_passed else 0.0,
            "markers_found": dedup_markers,
            "gap": "Duplicate publication numbers detected or unverified fields hallucinated" if not dedup_passed else None
        })

        # 7. Legal Safety & Non-Absolute Wording
        safety_markers = []
        forbidden_absolutes = [
            "will definitely be rejected", "guaranteed to fail", "guaranteed to be granted",
            "will certainly be rejected", "100% patentable", "100% guaranteed",
            "cannot possibly be patented", "will certainly be granted"
        ]
        found_absolutes = [f for f in forbidden_absolutes if f in text_lower]
        
        calibrated_safe_markers = [
            "may face an objection", "statutory objection", "section 3(p)", "section 3(e)",
            "subject to", "would require", "preliminary", "consult an empanelled",
            "potential", "evidence", "depends on", "barred under section"
        ]
        has_safe_phrasing = any(m in text_lower for m in calibrated_safe_markers)

        if not found_absolutes:
            safety_markers.append("Zero Forbidden Absolute Guarantees")
        if has_safe_phrasing:
            safety_markers.append("Statutory Reasoned Calibrated Language")

        safety_passed = (len(found_absolutes) == 0) and has_safe_phrasing
        evaluations.append({
            "name": "Legal Safety",
            "passed": safety_passed,
            "score": 1.0 if safety_passed else 0.0,
            "markers_found": safety_markers,
            "gap": f"Forbidden absolute legal claim detected: {found_absolutes}" if not safety_passed else None
        })

        # 8. Follow-Up Options Cap (Max 2)
        follow_up_markers = []
        follow_up_count = 0
        if follow_up_suggestions is not None:
            follow_up_count = len(follow_up_suggestions)
        else:
            follow_up_count = 2

        follow_up_passed = follow_up_count <= 2
        if follow_up_passed:
            follow_up_markers.append(f"Follow-ups strictly capped at {follow_up_count} (<= 2)")

        evaluations.append({
            "name": "Follow-Up Options Cap",
            "passed": follow_up_passed,
            "score": 1.0 if follow_up_passed else 0.0,
            "markers_found": follow_up_markers,
            "gap": f"Follow-up suggestions exceed maximum cap of 2 (found {follow_up_count})" if not follow_up_passed else None
        })

    # Compute aggregate metrics
    passed_count = sum(1 for e in evaluations if e["passed"])
    total_score = sum(e["score"] for e in evaluations) / len(evaluations)
    
    if len(evaluations) == 4:
        overall_passed = passed_count >= 3
    else:
        # At least 6 of 8 criteria must pass, AND Legal Safety must pass
        safety_eval = next((e for e in evaluations if e["name"] == "Legal Safety"), None)
        safety_ok = safety_eval["passed"] if safety_eval else True
        overall_passed = (passed_count >= 6) and safety_ok

    feedback_items = [e["gap"] for e in evaluations if e["gap"]]
    feedback_str = "All criteria passed." if not feedback_items else "; ".join(feedback_items)

    return {
        "passed": overall_passed,
        "score": round(total_score, 2),
        "overall_score": int(round(total_score * 100)),
        "passed_criteria_count": passed_count,
        "total_criteria_count": len(evaluations),
        "criteria": evaluations,
        "criteria_breakdown": {e["name"]: e["passed"] for e in evaluations},
        "feedback": feedback_str,
        "suggestions": feedback_items,
    }


def evaluate_deep_agent_rubrics(
    response_text: str,
    retrieved_sources: Optional[List[Dict[str, Any]]] = None,
    follow_up_suggestions: Optional[List[str]] = None,
    patent_records: Optional[List[Any]] = None
) -> Dict[str, Any]:
    """Evaluates all 8 AYUNOVA Deep Agent rubrics (core statutory + user-first quality criteria)."""
    return evaluate_response_against_rubric(
        response_text=response_text,
        rubric_type="extended",
        retrieved_sources=retrieved_sources,
        follow_up_suggestions=follow_up_suggestions,
        patent_records=patent_records
    )


# ============================================================================
# 3. RubricMiddleware Builder
# ============================================================================

def build_ayunova_rubric_middleware(model: Any, max_iterations: int = 2) -> RubricMiddleware:
    """
    Constructs a configured RubricMiddleware for AYUNOVA.
    
    Args:
        model: BaseChatModel instance used by the grader to critique outputs.
        max_iterations: Maximum self-correction evaluation loops.
        
    Returns:
        RubricMiddleware instance.
    """
    return RubricMiddleware(
        model=model,
        system_prompt=AYUNOVA_COMPOSITE_RUBRIC,
        max_iterations=max_iterations,
    )
