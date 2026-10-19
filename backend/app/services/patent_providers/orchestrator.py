"""
Multi-Source Patent Research Orchestrator.
Coordinates search across approved authoritative patent sources strictly adhering to:
Priority 1: Admin-uploaded documents (pre-screened in RAG engine)
Priority 2: IP India official patent sources (IPIndiaProvider)
Priority 3: WIPO PATENTSCOPE (WIPOPatentscopeProvider)
Priority 4: EPO Espacenet / OPS (EPOProvider)

Prohibits unverified blogs, Wikipedia, or commercial scrape websites.
"""

import logging
from typing import List, Dict, Any, Tuple
from app.services.patent_providers.base import PatentSearchResult
from app.services.patent_providers.ip_india_provider import IPIndiaProvider
from app.services.patent_providers.wipo_provider import WIPOPatentscopeProvider
from app.services.patent_providers.epo_provider import EPOProvider

logger = logging.getLogger("ayunova.patent_providers.orchestrator")


class PatentResearchOrchestrator:
    """Orchestrates structured searches across approved official patent providers."""

    def __init__(self):
        self.ip_india = IPIndiaProvider()
        self.wipo = WIPOPatentscopeProvider()
        self.epo = EPOProvider()

    def search_authoritative_patent_sources(
        self,
        query: str,
        query_entities: Dict[str, Any],
        max_results_per_source: int = 3
    ) -> Tuple[List[PatentSearchResult], List[str]]:
        """
        Executes search across Priority 2 (IP India), Priority 3 (WIPO), and Priority 4 (EPO).
        Returns (verified_results, sources_used).
        """
        all_results: List[PatentSearchResult] = []
        sources_used: List[str] = []

        # Priority 2: IP India
        try:
            ip_results = self.ip_india.search(query, query_entities, max_results=max_results_per_source)
            if ip_results:
                all_results.extend(ip_results)
                sources_used.append("IP India")
        except Exception as e:
            logger.error(f"Error querying IP India provider: {e}")

        # Priority 3: WIPO PATENTSCOPE
        try:
            wipo_results = self.wipo.search(query, query_entities, max_results=max_results_per_source)
            if wipo_results:
                all_results.extend(wipo_results)
                sources_used.append("WIPO PATENTSCOPE")
        except Exception as e:
            logger.error(f"Error querying WIPO PATENTSCOPE provider: {e}")

        # Priority 4: EPO Espacenet
        try:
            epo_results = self.epo.search(query, query_entities, max_results=max_results_per_source)
            if epo_results:
                all_results.extend(epo_results)
                sources_used.append("EPO Espacenet")
        except Exception as e:
            logger.error(f"Error querying EPO Espacenet provider: {e}")

        # Deduplicate results by publication number
        seen_pubs = set()
        deduped: List[PatentSearchResult] = []
        for r in all_results:
            if r.publication_number not in seen_pubs:
                seen_pubs.add(r.publication_number)
                deduped.append(r)

        return deduped, sources_used
