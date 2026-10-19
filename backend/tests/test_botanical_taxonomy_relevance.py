"""
Test Suite: Intent-Driven Botanical Classification & Query Intent Precision
Validates:
1. Strict query intent detection before retrieval (Botanical Classification / Taxonomy).
2. Authoritative taxonomic hierarchy and plant morphology output from PostgreSQL.
3. Strict Negative Constraints: 0% patentability analysis, Section 3(p)/3(e), Rule 158B, Form 25D, Schedule T, BDA Form III, or cancer research papers.
4. Authoritative botanical source citations (Ayurvedic Pharmacopoeia of India, BSI Flora of India, Kew POWO).
"""

import os
import sys
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.intent_classifier import IntentClassifier
from app.services.botanical_service import BotanicalService
from app.services.rag_engine import AyushRAGEngine
from app.models.schemas import StructuredAIAnswer


def test_intent_classifier_detects_botanical_classification():
    """Verify that botanical taxonomy and classification inquiries are classified correctly."""
    queries = [
        "What is the botanical classification of Withania somnifera?",
        "Botanical classification of Ashwagandha",
        "What is the family and genus of Curcuma longa?",
        "Taxonomic classification of Azadirachta indica",
        "Scientific classification of Tulsi plant",
        "What is the plant taxonomy of Bacopa monnieri?"
    ]

    for q in queries:
        res = IntentClassifier.classify_intent(q)
        assert res["intent"] == "Botanical Classification / Taxonomy", (
            f"Query '{q}' was classified as '{res['intent']}', expected 'Botanical Classification / Taxonomy'"
        )
        assert res["complexity"] == "SIMPLE"
        assert res["archetype"] == "STANDARD_USER_FIRST"
        assert res["needs_deep_agent"] is False
        tools = res.get("recommended_tools", [])
        assert any("Kew" in t or "Botanical Survey of India" in t or "API" in t for t in tools)


def test_botanical_service_database_taxonomy():
    """Verify BotanicalService returns authoritative taxonomy from PostgreSQL doc_metadata."""
    # Lookup for Withania somnifera
    ashwa_tax = BotanicalService.get_botanical_taxonomy("Withania somnifera")
    assert ashwa_tax is not None
    assert "Plantae" in ashwa_tax["kingdom"]
    assert "Solanaceae" in ashwa_tax["family"]
    assert "Withania" in ashwa_tax["genus"]
    assert "Withania somnifera" in ashwa_tax["species"]
    assert "Dunal" in ashwa_tax.get("authority", "") or "Dunal" in ashwa_tax.get("species", "")

    # Lookup for Curcuma longa
    curcuma_tax = BotanicalService.get_botanical_taxonomy("Curcuma longa")
    assert curcuma_tax is not None
    assert "Zingiberaceae" in curcuma_tax["family"]
    assert "Curcuma" in curcuma_tax["genus"]


def test_botanical_classification_direct_answer_content():
    """Verify the Direct Answer contains the taxonomic table and morphology without patent bloat."""
    query = "What is the botanical classification of Withania somnifera?"
    res = AyushRAGEngine.process_chat_query(query)

    assert isinstance(res, StructuredAIAnswer)
    assert res.intent == "Botanical Classification / Taxonomy"
    ans_text = res.answer

    # 1. Must contain Direct Answer header
    assert "### Direct Answer" in ans_text

    # 2. Must contain Taxonomic Hierarchy table
    assert "| Taxonomic Rank | Classification |" in ans_text
    assert "**Kingdom**" in ans_text and "Plantae" in ans_text
    assert "**Family**" in ans_text and "Solanaceae" in ans_text
    assert "**Genus**" in ans_text and "Withania" in ans_text
    assert "**Species**" in ans_text and "Withania somnifera" in ans_text

    # 3. Must contain Relevant Evidence & Verified Facts
    assert "### Relevant Evidence & Verified Facts" in ans_text
    assert "Botanical Morphology" in ans_text or "Morphology" in ans_text

    # 4. Must contain Next Steps & Official Botanical Portals
    assert "### Next Steps & Official Botanical Portals" in ans_text
    assert "powo.science.kew.org" in ans_text
    assert "bsi.gov.in" in ans_text


def test_strict_negative_constraints_no_patent_or_cancer_bloat():
    """
    STRICT NEGATIVE TEST:
    Verify that answers to botanical classification queries contain ZERO occurrences
    of unsolicited patentability, legal sections, regulatory manufacturing licensing,
    or cancer research papers.
    """
    query = "What is the botanical classification of Withania somnifera?"
    res = AyushRAGEngine.process_chat_query(query)

    combined_text = (
        f"{res.answer} {res.assessment} {' '.join(res.considerations)} "
        f"{' '.join(res.regulatory)} {res.risks} {' '.join(res.nextSteps)}"
    ).lower()

    unsolicited_terms = [
        "section 3(p)",
        "section 3(e)",
        "rule 158b",
        "form 25d",
        "form 24d",
        "schedule t",
        "form iii application",
        "chou-talalay",
        "paclitaxel",
        "lung cancer",
        "lung carcinoma",
        "chemotherapeutic",
        "tumor",
        "preclinical mice"
    ]

    for term in unsolicited_terms:
        assert term not in combined_text, (
            f"Forbidden unsolicited term '{term}' found in botanical classification answer!"
        )


def test_authoritative_botanical_sources():
    """Verify that cited sources point to botanical and pharmacopoeial authorities."""
    query = "What is the botanical classification of Withania somnifera?"
    res = AyushRAGEngine.process_chat_query(query)

    assert len(res.sources) >= 2
    authorities = [s.authority for s in res.sources]
    titles = [s.title for s in res.sources]

    # Must cite Botanical Pharmacopoeia, BSI, or Kew
    assert any("Pharmacopoeia" in a or "PCIM&H" in a for a in authorities), "Must cite Pharmacopoeia monograph"
    assert any("Botanical Survey of India" in a or "MoEFCC" in a or "Kew" in a for a in authorities), "Must cite botanical survey or Kew"

    # Must NOT cite oncology or chemotherapy papers
    assert not any("pharmaceutics" in t.lower() and "cancer" in t.lower() for t in titles)
