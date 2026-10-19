import pytest
from unittest.mock import patch, MagicMock
from app.services.rag_engine import AyushRAGEngine
from app.models.schemas import SourceCitation

def test_should_trigger_live_web_search_detection():
    """Verify criteria for triggering live web search."""
    # Recency / clinical trial triggers
    assert AyushRAGEngine._should_trigger_live_web_search("What are latest clinical trials on Bacopa in 2024?", 0.85) is True
    assert AyushRAGEngine._should_trigger_live_web_search("Recent patents on Ashwagandha nanoparticles", 0.90) is True
    assert AyushRAGEngine._should_trigger_live_web_search("New US patent applications for curcumin", 0.70) is True

    # Low similarity trigger for domain queries
    assert AyushRAGEngine._should_trigger_live_web_search("Can I patent Sutherlandia frutescens formulation?", 0.32) is True
    assert AyushRAGEngine._should_trigger_live_web_search("Regulatory approval for novel Guduchi extract", None) is True

    # Should not trigger for well-matched static queries
    assert AyushRAGEngine._should_trigger_live_web_search("What is Section 3(p)?", 0.78) is False

def test_process_chat_query_with_web_search_augmentation():
    """Test process_chat_query incorporating Tavily live web results."""
    mock_tavily_result = {
        "query": "clinical trials on Bacopa monnieri 2024",
        "answer": "Clinical trials in 2024 show Bacopa monnieri significantly enhances cognitive processing and memory consolidation.",
        "results": [
            {
                "title": "WO2024208561A1 - Bacopa monnieri complexes with phosphatidylserine",
                "url": "https://patents.google.com/patent/WO2024208561A1/en",
                "content": "A novel synergistic complex of Bacopa monnieri extract with phosphatidylserine exhibiting high blood-brain barrier permeability.",
                "score": 0.95
            },
            {
                "title": "Clinical evaluation of Bacopa monnieri in mild cognitive impairment (PubMed)",
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12158153",
                "content": "Randomized double-blind trial demonstrating neuroprotective biomarkers and acetylcholinesterase inhibition.",
                "score": 0.91
            }
        ]
    }

    with patch("app.services.rag_engine.search_web_tavily_structured", return_value=mock_tavily_result):
        res = AyushRAGEngine.process_chat_query(
            query="What are latest clinical trials and patents on Bacopa monnieri in 2024?",
            jurisdiction="India"
        )

        assert res is not None
        assert res.confidence == "HIGH"
        # Assert web citation is present
        web_citations = [s for s in res.sources if s.id.startswith("web-")]
        assert len(web_citations) >= 2
        assert "patents.google.com" in web_citations[0].url
        assert "Google Patents" in web_citations[0].authority
        # Assert considerations include web intelligence
        assert any("Latest" in c or "Real-Time" in c or "WO2024208561A1" in c for c in res.considerations)

def test_guardrail_still_blocks_out_of_scope():
    """Verify Guardrail 3 still protects against completely non-Ayush queries."""
    res = AyushRAGEngine.process_chat_query(
        query="Who won the cricket match yesterday?",
        jurisdiction="India"
    )
    assert res.detectedProductType == "Out-of-Scope Query"
    assert "outside the statutory scope" in res.answer
