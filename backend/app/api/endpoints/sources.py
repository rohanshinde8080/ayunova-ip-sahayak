from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Any
from app.models.schemas import SourceCitation
from app.services.vector_service import VectorService
from app.core.database import SessionLocal
from app.models.db_models import AyushKnowledgeVector, Regulation

router = APIRouter()


def _citation_from_knowledge(s: Any) -> SourceCitation:
    return SourceCitation(
        id=str(s.id),
        title=str(s.title),
        authority=str(s.authority),
        section=str(s.section),
        page=str(s.page_reference) if s.page_reference else "",
        jurisdiction=str(s.jurisdiction),
        verified=bool(s.verified),
        summary=str(s.content_text or ""),
        gazetteExcerpt=str(s.gazette_excerpt) if s.gazette_excerpt else "",
        officialAct=str(s.official_act) if s.official_act else None,
    )


def _citation_from_regulation(r: Any) -> SourceCitation:
    return SourceCitation(
        id=str(r.id),
        title=str(r.title),
        authority=str(r.authority),
        section=str(r.section),
        page=str(r.page_reference) if r.page_reference else "",
        jurisdiction=str(r.jurisdiction),
        verified=bool(r.verified),
        summary=str(r.legal_summary or ""),
        gazetteExcerpt=str(r.gazette_excerpt) if r.gazette_excerpt else "",
        officialAct=str(r.official_act) if r.official_act else None,
    )


@router.get("", response_model=List[SourceCitation])
async def list_sources():
    """Retrieve all official gazettes, Acts, and TKDL references from Neon Postgres."""
    db = SessionLocal()
    try:
        db_sources = db.query(AyushKnowledgeVector).filter(AyushKnowledgeVector.is_active == True).all()
        if db_sources:
            return [_citation_from_knowledge(s) for s in db_sources]
        
        # Fallback to regulations table if AyushKnowledgeVector has not been populated
        regs = db.query(Regulation).filter(Regulation.is_active == True).all()
        return [_citation_from_regulation(r) for r in regs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
    finally:
        db.close()


@router.get("/vector-search")
async def search_sources_by_vector(
    q: str = Query(..., description="Semantic search query for legal citations"),
    limit: int = Query(4, ge=1, le=10)
):
    """Semantic vector search across official sources using Neon pgvector."""
    results = VectorService.search_knowledge_base(query=q, limit=limit)
    return {"query": q, "count": len(results), "results": results}


@router.get("/{source_id}", response_model=SourceCitation)
async def get_source(source_id: str):
    """Retrieve details and excerpt of a specific official gazette or act from PostgreSQL."""
    db = SessionLocal()
    try:
        s = db.query(AyushKnowledgeVector).filter(AyushKnowledgeVector.id == source_id).first()
        if s:
            return _citation_from_knowledge(s)
            
        r = db.query(Regulation).filter(Regulation.id == source_id).first()
        if r:
            return _citation_from_regulation(r)
            
        raise HTTPException(status_code=404, detail=f"Citation source '{source_id}' not found in database.")
    finally:
        db.close()

