import pytest
from app.services.rag_engine import AyushRAGEngine, OFFICIAL_PORTALS
from app.services.intent_classifier import IntentClassifier
from app.models.schemas import SourceCitation

def _mock_general_citations():
    return [
        SourceCitation(
            id="statute-3p",
            title="Patents Act 1970 - Section 3(p)",
            authority="CGPDTM (Indian Patent Office)",
            section="Section 3(p)",
            summary="Section 3(p) bars traditional knowledge from patentability. Inventions that duplicate known properties of traditional components are excluded.",
            gazetteExcerpt="Section 3(p): an invention which, in effect, is traditional knowledge is not an invention.",
            verified=True,
            similarity=0.88,
            relevanceScore=95
        ),
        SourceCitation(
            id="statute-3e",
            title="Patents Act 1970 - Section 3(e)",
            authority="CGPDTM (Indian Patent Office)",
            section="Section 3(e)",
            summary="Section 3(e) excludes mere admixtures resulting only in the aggregation of properties. Synergistic interaction (CI < 1.0) must be proven.",
            gazetteExcerpt="Section 3(e): a substance obtained by a mere admixture is not patentable.",
            verified=True,
            similarity=0.82,
            relevanceScore=90
        )
    ]

def test_official_portals_dictionary():
    """Verify official portals dictionary has all 4 required authoritative portals with markdown links."""
    assert "inpass" in OFFICIAL_PORTALS
    assert "ip_india" in OFFICIAL_PORTALS
    assert "wipo" in OFFICIAL_PORTALS
    assert "espacenet" in OFFICIAL_PORTALS
    
    assert "https://ipindia.gov.in/patents-before-you-apply-public-search" in OFFICIAL_PORTALS["inpass"]["url"]
    assert "https://ipindia.gov.in/" in OFFICIAL_PORTALS["ip_india"]["url"]
    assert "https://www.wipo.int/en/web/patentscope" in OFFICIAL_PORTALS["wipo"]["url"]
    assert "https://www.epo.org/en/searching-for-patents/technical/espacenet" in OFFICIAL_PORTALS["espacenet"]["url"]
    
    for key, portal in OFFICIAL_PORTALS.items():
        assert portal["markdown"].startswith("[")
        assert portal["url"] in portal["markdown"]

def test_intent_classifier_recommended_tools_have_official_links():
    """Verify get_recommended_tools returns active markdown links for official portals."""
    tools = IntentClassifier.get_recommended_tools("Patent Search")
    tools_str = " ".join(tools)
    
    assert "https://ipindia.gov.in/patents-before-you-apply-public-search" in tools_str
    assert "https://ipindia.gov.in/" in tools_str
    assert "https://www.wipo.int/en/web/patentscope" in tools_str
    assert "https://www.epo.org/en/searching-for-patents/technical/espacenet" in tools_str
    assert "[Indian Patent Public Search (InPASS)]" in tools_str
    assert "[WIPO PATENTSCOPE]" in tools_str
    assert "[EPO Espacenet]" in tools_str

def test_patent_search_query_direct_matching_and_no_regulatory_bloat():
    """Verify patent search queries get direct search answers with official links and NO Rule 158B / Schedule T bloat."""
    cits = _mock_general_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="How to search patents on InPASS and check prior art?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    # Direct Answer Structure
    assert res.answer.startswith("### Direct Answer")
    assert "### Relevant Evidence & Verified Facts" in res.answer
    assert "### Next Steps & Official Portals" in res.answer
    
    # Authoritative portal links MUST be present in answer and next steps
    assert "https://ipindia.gov.in/patents-before-you-apply-public-search" in res.answer
    assert "https://www.wipo.int/en/web/patentscope" in res.answer
    assert "https://www.epo.org/en/searching-for-patents/technical/espacenet" in res.answer
    assert "https://ipindia.gov.in/" in res.answer
    
    # MUST NOT dump unrelated regulatory licensing sections
    assert "Rule 158B" not in res.answer
    assert "Schedule T" not in res.answer
    assert "Form 25D" not in res.answer
    assert "Biological Diversity Act" not in res.answer

def test_section_3p_query_direct_matching_no_rule158b():
    """Verify Section 3(p) queries focus on Section 3(p) and TKDL, omitting Rule 158B manufacturing."""
    cits = _mock_general_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What is Section 3(p) and how does TKDL affect my patent?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert "Section 3(p)" in res.answer
    assert "Traditional Knowledge" in res.answer
    assert "TKDL" in res.answer
    # Unrelated manufacturing licensing should not be in regulatory
    for reg in res.regulatory:
        assert "Rule 158B" not in reg
        assert "Schedule T" not in reg

def test_section_3e_query_direct_matching_no_licensing():
    """Verify Section 3(e) queries focus on synergism, omitting manufacturing licenses."""
    cits = _mock_general_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What is the Section 3(e) synergism requirement and Chou-Talalay threshold?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert "Section 3(e)" in res.answer
    assert "Chou-Talalay" in res.answer
    assert "Combination Index" in res.answer or "CI < 0.8" in res.answer
    # Unrelated manufacturing licensing should not be in regulatory
    for reg in res.regulatory:
        assert "Rule 158B" not in reg
        assert "Schedule T" not in reg

def test_insufficient_evidence_gate_refuses_cleanly_without_hallucinating():
    """Verify ungrounded queries trigger clean refusal with INSUFFICIENT confidence instead of injecting fake DB rows."""
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What is the quantum computing algorithm for Ayush crypto tokens?",
        citations=[],
        jurisdiction="India",
        language="English"
    )
    
    assert res.confidence == "INSUFFICIENT"
    assert "Insufficient verified information is available" in res.answer
    assert len(res.sources) == 0

def test_case_f_general_fallback_has_direct_answer_and_official_links():
    """Verify general fallback produces direct answer first and links to official portals."""
    cits = _mock_general_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What are the patent claim guidelines for Ayurvedic clinical trials?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )
    
    assert "### Direct Answer" in res.answer
    assert "### Relevant Evidence & Verified Facts" in res.answer
    assert "### Next Steps & Official Portals" in res.answer
    assert "https://ipindia.gov.in/patents-before-you-apply-public-search" in res.answer
    assert "https://www.wipo.int/en/web/patentscope" in res.answer
    assert "https://www.epo.org/en/searching-for-patents/technical/espacenet" in res.answer
    # When manufacturing was not queried, Rule 158B should not be dumped
    assert "Rule 158B" not in res.answer
    assert "Schedule T" not in res.answer


def test_botanical_chemistry_query_direct_matching_no_patent_bloat():
    """Verify botanical chemistry and constituent queries return active markers and API monographs with NO patent bloat."""
    cits = _mock_general_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="What are the active chemical constituents and indications of Ashwagandha?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )

    assert res.answer.startswith("### Direct Answer")
    assert "Withanolides" in res.answer
    assert "Withania somnifera" in res.answer
    assert "Ayurvedic Pharmacopoeia of India" in res.answer
    assert "Charaka Samhita" in res.answer or "treatises" in res.answer.lower()
    
    # Strict negative constraints: Zero patent or licensing bloat
    assert "Section 3(p)" not in res.answer
    assert "Section 3(e)" not in res.answer
    assert "Rule 158B" not in res.answer
    assert "Form 25D" not in res.answer
    assert "Comprehensive IP, Patentability & Regulatory Dossier" not in res.answer


def test_patent_application_filing_procedure_forms():
    """Verify patent filing procedure queries return Forms 1, 2, 3, 5, 18 and official e-filing links."""
    cits = _mock_general_citations()
    res = AyushRAGEngine._synthesize_local_grounded_answer(
        query="How to file a patent application in India and what forms are required?",
        citations=cits,
        jurisdiction="India",
        language="English"
    )

    assert res.answer.startswith("### Direct Answer")
    assert "Form 1" in res.answer
    assert "Form 2" in res.answer
    assert "Form 3" in res.answer
    assert "Form 5" in res.answer
    assert "Form 18" in res.answer
    assert "12 months" in res.answer
    assert "https://ipindiaonline.gov.in/epatentfiling" in res.answer or "ipindia" in res.answer.lower()


def test_brand_trademark_direct_answer_structure():
    """Verify trademark queries return full structured Markdown Direct Answer with Class 5/3 guidance."""
    res = AyushRAGEngine.process_chat_query(
        query="How do I secure brand protection and trademark exclusivity for an Ayurvedic product?"
    )

    assert res.answer.startswith("### Direct Answer")
    assert "Trade Marks Act, 1999" in res.answer
    assert "Class 5" in res.answer
    assert "Class 3" in res.answer
    assert "Section 9" in res.answer
    assert "https://ipindiaonline.gov.in/eregister/eregister.aspx" in res.answer
    assert "### Relevant Evidence & Verified Facts" in res.answer
    assert "### Next Steps & Official Portals" in res.answer
