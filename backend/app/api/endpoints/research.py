"""
Research Paper Intelligence API Endpoints.
Provides search, filtering, summary analytics, admin statistics,
and AI research synthesis for Ayurvedic medicinal plants.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.research_service import ResearchService
from app.services.herb_service import HerbService

router = APIRouter()


class SynthesisRequest(BaseModel):
    herb_name: str
    papers: Optional[List[Dict[str, Any]]] = None


@router.get("/search")
async def search_research(
    query: str = Query(..., description="Medicinal plant name or botanical query (e.g. Ashwagandha, Tulsi)"),
    force_refresh: bool = Query(False, description="Force live scholarly repository refresh"),
    db: Session = Depends(get_db)
):
    """
    Primary endpoint: Resolves botanical query, retrieves scholarly papers across
    PubMed, Europe PMC, OpenAlex, and Crossref, applies deduplication, categorization,
    and returns comprehensive analytics.
    """
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    
    result = ResearchService.search_and_analyze(
        herb_query=query.strip(),
        force_refresh=force_refresh,
        db=db
    )
    return result


@router.get("/summary/{herb}")
async def get_herb_summary(
    herb: str,
    db: Session = Depends(get_db)
):
    """Returns scientific profile, dynamic paper count, and category distributions for a herb."""
    result = ResearchService.search_and_analyze(
        herb_query=herb.strip(),
        force_refresh=False,
        db=db
    )
    return {
        "herb_profile": result.get("herb_profile"),
        "total_unique_papers": result.get("total_unique_papers"),
        "coverage_statement": result.get("coverage_statement"),
        "last_synced_at": result.get("last_synced_at"),
        "analytics": result.get("analytics")
    }


@router.get("/papers/{herb}")
async def get_herb_papers(
    herb: str,
    year: Optional[int] = Query(None, description="Filter by publication year (e.g. 2025)"),
    category: Optional[str] = Query(None, description="Filter by scientific category (e.g. Clinical Studies)"),
    source: Optional[str] = Query(None, description="Filter by source repository (PubMed, Europe PMC, OpenAlex, Crossref)"),
    open_access: Optional[bool] = Query(None, description="Filter by open-access status"),
    sort_by: str = Query("relevance", description="Sorting criteria: relevance, newest, oldest, citations"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Records per page"),
    db: Session = Depends(get_db)
):
    """Returns paginated, filtered, and sorted research papers for a herb."""
    return ResearchService.get_filtered_papers(
        herb=herb,
        year=year,
        category=category,
        source=source,
        open_access=open_access,
        sort_by=sort_by,
        page=page,
        limit=limit,
        db=db
    )


@router.get("/stats")
async def get_research_stats(
    db: Session = Depends(get_db)
):
    """Admin endpoint: Provides system-wide research paper index statistics and connected database health."""
    return ResearchService.get_admin_stats(db=db)


@router.post("/sync/{herb}")
async def sync_herb_research(
    herb: str,
    db: Session = Depends(get_db)
):
    """Triggers forced live synchronization with scholarly repositories for the specified plant."""
    return ResearchService.search_and_analyze(
        herb_query=herb.strip(),
        force_refresh=True,
        db=db
    )


@router.post("/synthesize")
async def synthesize_research_ai(
    req: SynthesisRequest
):
    """
    RAG Integration: Uses Gemini to synthesize peer-reviewed papers into an authoritative,
    evidence-graded research report with verified inline DOI citations.
    """
    return ResearchService.synthesize_research(
        herb_name=req.herb_name,
        papers=req.papers
    )


@router.get("/herbs")
async def get_popular_herbs():
    """Returns list of curated Ayurvedic medicinal plants for quick selection."""
    return HerbService.get_supported_herbs()
