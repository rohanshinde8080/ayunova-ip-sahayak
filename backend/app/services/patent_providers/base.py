"""
Patent Search Provider Abstraction.
Defines abstract base class and verified data structures for authoritative patent searches
across official patent authorities (IP India, WIPO PATENTSCOPE, EPO Espacenet).
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass, field


@dataclass
class PatentSearchResult:
    publication_number: str
    title: str
    authority: str  # "IP India", "WIPO PATENTSCOPE", "EPO Espacenet"
    url: str
    application_number: Optional[str] = None
    applicant: Optional[str] = None
    inventors: List[str] = field(default_factory=list)
    publication_date: Optional[str] = None
    abstract: Optional[str] = None
    claims_excerpt: Optional[str] = None
    relevant_passage: Optional[str] = None
    relevance_score: float = 0.0
    evidence_classification: Literal['DIRECT_EVIDENCE', 'PARTIAL_EVIDENCE', 'RELATED_ONLY', 'IRRELEVANT'] = 'RELATED_ONLY'
    matched_compounds: List[str] = field(default_factory=list)
    matched_relationship: Optional[str] = None


class PatentSearchProvider(ABC):
    """Abstract base class for official patent search providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the official authority."""
        pass

    @property
    @abstractmethod
    def official_url(self) -> str:
        """Base official URL."""
        pass

    @abstractmethod
    def search(
        self,
        query: str,
        query_entities: Dict[str, Any],
        max_results: int = 5
    ) -> List[PatentSearchResult]:
        """
        Executes a targeted search against official patent records.
        """
        pass
