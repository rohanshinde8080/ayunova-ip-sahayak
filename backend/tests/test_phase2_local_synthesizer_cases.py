import pytest
from app.services.rag_engine import AyushRAGEngine
from app.models.schemas import SourceCitation

def _make_mock_citations():
    return [
        SourceCitation(
            id="statute-3e",
            title="Patents Act 1970 - Section 3(e)",
            authority="CGPDTM (Indian Patent Office)",
            section="Section 3(e)",
            summary="Section 3(e) excludes from patentability mere admixtures resulting only in the aggregation of properties. Synergistic interaction (CI < 1.0) must be experimentally demonstrated.",
            gazetteExcerpt="Section 3(e): a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not an invention.",
            verified=True,
            similarity=0.85,
            relevanceScore=95
        ),
        SourceCitation(
            id="statute-158b",
            title="Drugs and Cosmetics Rules 1945 - Rule 158B",
            authority="Ministry of Ayush",
            section="Rule 158B",
            summary="Rule 158B specifies the regulatory requirements for the grant of manufacturing license in Form 25D for Ayurvedic Proprietary Medicines.",
            gazetteExcerpt="Rule 158B prescribes safety and efficacy proof requirements for patent or proprietary Ayurvedic drugs.",
            verified=True,
            similarity=0.80,
            relevanceScore=90
        ),
        SourceCitation(
            id="statute-bda",
            title="Biological Diversity Act 2002 - Section 6",
            authority="National Biodiversity Authority (NBA)",
            section="Section 6",
            summary="Section 6 mandates prior approval (Form III) from NBA Chennai before applying for or obtaining any intellectual property right based on Indian biological resources.",
            gazetteExcerpt="Section 6(1): No person shall apply for any intellectual property right in or outside India without obtaining previous approval of NBA.",
            verified=True,
            similarity=0.82,
            relevanceScore=92
        )
    ]

def test_phase2_case_c_synergism_depth():
    """Verify Case C produces detailed Section 3(e) Chou-Talalay synergism analysis."""
    cits = _make_mock_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What is the Section 3(e) synergism requirement for polyherbal patenting?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert res.confidence == "HIGH"
    assert "Section 3(e)" in res.answer
    assert "Chou-Talalay" in res.answer
    assert "CI < 0.8" in res.answer or "Combination Index" in res.answer
    assert len(res.considerations) >= 4
    assert len(res.regulatory) >= 2
    assert len(res.nextSteps) >= 3
    assert res.detectedProductType == "Synergistic Polyherbal IP Formulation"

def test_phase2_case_d_licensing_rule158b_depth():
    """Verify Case D produces detailed Rule 158B two-pathway manufacturing analysis."""
    cits = _make_mock_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="How to get Form 25D manufacturing license under Rule 158B?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert res.confidence == "HIGH"
    assert "Rule 158B" in res.answer
    assert "Form 25D" in res.answer
    assert "Classical Ayurvedic Medicine" in res.answer
    assert "Ayurvedic Proprietary Medicine" in res.answer
    assert "Schedule T" in res.answer
    assert len(res.regulatory) >= 3
    assert len(res.nextSteps) >= 3
    assert "158B" in res.detectedProductType

def test_phase2_case_e_bda_nba_form_iii_depth():
    """Verify Case E produces detailed Biological Diversity Act and NBA Form III guidance."""
    cits = _make_mock_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="Explain NBA Form III requirement under Biological Diversity Act",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert res.confidence == "HIGH"
    assert "Biological Diversity Act" in res.answer
    assert "Section 6" in res.answer
    assert "Form III" in res.answer
    assert "Access and Benefit Sharing" in res.answer or "ABS" in res.answer
    assert "2023" in res.answer
    assert len(res.nextSteps) >= 3

def test_phase2_case_botanical_polyherbal_depth():
    """Verify Case Botanical produces detailed polyherbal IP dossier for Ashwagandha + Curcumin."""
    cits = _make_mock_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="Can I patent a formulation of Ashwagandha and Curcumin?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert res.confidence == "HIGH"
    assert "Ashwagandha" in res.answer
    assert "Curcumin" in res.answer
    assert "Section 3(p)" in res.answer
    assert "Section 3(e)" in res.answer
    assert "Polyherbal" in res.detectedProductType

def test_phase2_case_botanical_single_herb_depth():
    """Verify Case Botanical produces detailed single-herb IP dossier for Ashwagandha."""
    cits = _make_mock_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="Patent protection options for Ashwagandha extract",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert res.confidence == "HIGH"
    assert "Ashwagandha" in res.answer
    assert "Section 3(p)" in res.answer
    assert "Withania somnifera" in res.answer
    assert "Novel Extraction" in res.answer or "NDDS" in res.answer or "Section 48" in res.answer

def test_phase2_case_f_general_fallback_depth():
    """Verify Case F dynamic fallback creates multi-citation synthesis without 1-line stubs."""
    cits = _make_mock_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What are the patent claim guidelines for Ayurvedic clinical trials?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert res.confidence == "HIGH"
    assert "Patents Act, 1970" in res.answer
    assert "Section 3(p)" in res.answer
    assert "Section 3(e)" in res.answer
    assert "Biological Diversity Act" in res.answer
    assert len(res.considerations) >= 4
    assert len(res.nextSteps) >= 3
