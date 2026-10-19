import pytest
from app.services.rag_engine import AyushRAGEngine
from app.models.schemas import SourceCitation, PatentRecord

def test_phase1_format_archetype_preserves_detailed_answer():
    """Verify that _format_archetype_answer does NOT truncate detailed paragraphs in PATENTABILITY_ASSESSMENT."""
    citations = [
        SourceCitation(
            id="test-1",
            title="Patents Act 1970 - Section 3(p)",
            authority="CGPDTM",
            section="Section 3(p)",
            summary="Section 3(p) bars inventions which are traditional knowledge or aggregation of known properties of traditionally known components. This is an absolute statutory bar for Ayurvedic treatises.",
            verified=True,
            relevanceScore=95
        ),
        SourceCitation(
            id="test-2",
            title="Patents Act 1970 - Section 3(e)",
            authority="CGPDTM",
            section="Section 3(e)",
            summary="Section 3(e) bars substances obtained by a mere admixture resulting only in aggregation of properties. Synergism with CI < 1.0 is required.",
            verified=True,
            relevanceScore=90
        )
    ]
    
    detailed_answer = (
        "**Section 3(p) of the Patents Act, 1970 — Traditional Knowledge Bar: Complete Analysis**\n\n"
        "Section 3(p) provides that traditional knowledge is not patentable. "
        "The TKDL acts as an examiner tool across 900+ classical treatises.\n\n"
        "Landmark Cases: CSIR vs Curcumin patent revoked; EPO Neem patent revoked.\n\n"
        "Three Pathways: Novel extraction process, Synergistic ratio (CI < 1.0), and NDDS delivery systems."
    )
    
    detailed_assessment = (
        "Statutory assessment confirms absolute bar under Section 3(p) for classical recipes. "
        "Filing requires BDA Form III clearance and experimental synergism data."
    )
    
    considerations = [
        "Consideration 1: Section 3(p) bar applies to classical formulations.",
        "Consideration 2: Novel extraction exception under Section 48.",
        "Consideration 3: Synergistic ratio requires CI < 1.0 data.",
        "Consideration 4: NDDS formulation overcomes classical prior art bar.",
        "Consideration 5: NBA Form III approval required before grant."
    ]
    
    next_steps = [
        "1. Prior art search on TKDL.",
        "2. Pivot to novel extraction process claims.",
        "3. Conduct GLP synergism assays.",
        "4. File NBA Form III with NBA Chennai."
    ]
    
    formatted = AyushRAGEngine._format_archetype_answer(
        archetype="PATENTABILITY_ASSESSMENT",
        answer_text=detailed_answer,
        assessment_text=detailed_assessment,
        considerations=considerations,
        next_steps=next_steps,
        citations=citations,
        patents=[],
        query="Explain Section 3(p) and traditional knowledge"
    )
    
    # Must preserve the detailed multi-sentence text
    assert "### Short Answer" in formatted
    assert "### Why" in formatted
    assert "### What You Should Check" in formatted
    assert "### Recommended Next Step" in formatted
    assert "### Grounded Evidence" in formatted
    
    # Key detail assertions: all 4 steps and 5 considerations should be present
    assert "1. Prior art search on TKDL." in formatted
    assert "4. File NBA Form III with NBA Chennai." in formatted
    assert "Consideration 5: NBA Form III approval required before grant." in formatted
    assert "Landmark Cases" in formatted
    assert "Three Pathways" in formatted

def test_phase1_format_archetype_standard_user_first_expanded():
    """Verify that STANDARD_USER_FIRST archetype includes up to 4 actions and tools."""
    citations = [
        SourceCitation(
            id="test-1",
            title="Rule 158B Drugs and Cosmetics Rules",
            authority="Ministry of Ayush",
            section="Rule 158B",
            summary="Rule 158B prescribes requirements for Ayurvedic Proprietary Medicines and Classical Formulations under Form 25D.",
            verified=True,
            relevanceScore=92
        )
    ]
    
    formatted = AyushRAGEngine._format_archetype_answer(
        archetype="STANDARD_USER_FIRST",
        answer_text="Proprietary Ayurvedic license requires Rule 158B compliance.",
        assessment_text="Form 25D is the manufacturing license for classical and proprietary Ayurvedic drugs.",
        considerations=["Rule 158B requires safety and pilot clinical data for proprietary drugs."],
        next_steps=[
            "Step 1: Determine license category",
            "Step 2: Prepare safety dossier",
            "Step 3: Schedule T GMP inspection",
            "Step 4: Submit to State Licensing Authority"
        ],
        citations=citations,
        patents=[],
        query="How to get Ayurvedic manufacturing license?",
        suggested_tools=["Tool A", "Tool B", "Tool C", "Tool D"]
    )
    
    assert "### Direct Answer" in formatted
    assert "### Key Findings / Solution" in formatted
    assert "### What You Should Do" in formatted
    assert "Step 1: Determine license category" in formatted
    assert "Step 4: Submit to State Licensing Authority" in formatted
    assert "Tool A" in formatted
    assert "Tool D" in formatted

def test_phase1_local_synthesizer_case_b_no_unbound_error():
    """Verify Case B (Section 3(p) queries) in local synthesizer returns complete StructuredAIAnswer without errors."""
    citations = [
        SourceCitation(
            id="test-1",
            title="Patents Act 1970 - Section 3(p)",
            authority="CGPDTM",
            section="Section 3(p)",
            summary="Section 3(p) bars traditional knowledge from patentability.",
            verified=True,
            relevanceScore=95
        )
    ]
    
    result = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What is Section 3(p) traditional knowledge bar?",
        citations=citations,
        jurisdiction="India",
        language="English"
    )
    
    assert result.confidence == "HIGH"
    assert "Section 3(p)" in result.answer
    assert "Traditional Knowledge" in result.answer
    assert len(result.regulatory) >= 2
    assert len(result.nextSteps) >= 2
    assert result.risks != ""
    assert result.detectedProductType == "Traditional Knowledge (Section 3(p)) IP Strategy"
