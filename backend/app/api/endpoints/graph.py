import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.neo4j_client import Neo4jClient, check_neo4j_health
from app.models.db_models import KnowledgeDocument, AyushKnowledgeVector
from app.models.schemas import GraphStatsResponse, CypherQueryRequest, GraphData
from app.services.graph_service import GraphService

logger = logging.getLogger("ayunova.graph_api")
router = APIRouter()


@router.get("/stats", response_model=GraphStatsResponse, summary="Get live Neo4j knowledge graph metrics")
async def get_graph_stats():
    """
    Returns real-time corpus statistics from the Neo4j Knowledge Graph:
    total nodes, total relationships, label counts, and relationship types.
    """
    stats = GraphService.get_graph_stats()
    return GraphStatsResponse(
        connected=stats.get("connected", False),
        status=stats.get("status", "OFFLINE"),
        total_nodes=stats.get("total_nodes", 0),
        total_relationships=stats.get("total_relationships", 0),
        labels=stats.get("labels", {}),
        relationship_types=stats.get("relationship_types", {}),
        server_version=stats.get("server_version"),
        dbms_id=stats.get("dbms_id")
    )


from app.services.botanical_service import BotanicalService

@router.get("/subgraph", summary="Retrieve multi-hop subgraph for entities or formulations")
async def get_entity_subgraph(
    entities: Optional[str] = Query(None, description="Comma-separated entity names (e.g. 'Ashwagandha,Triphala,Curcumin')"),
    entity: Optional[str] = Query(None, description="Single entity name"),
    query: Optional[str] = Query(None, description="Search query to extract entities from"),
    doc_id: Optional[str] = Query(None, description="Document ID"),
    max_hops: int = Query(2, ge=1, le=3),
    limit: int = Query(40, ge=5, le=100)
):
    """
    Traverses Neo4j for target entities and returns connected multi-hop nodes and edges
    for interactive graph visualization and relationship tracing.
    """
    names: List[str] = []
    if entities:
        names.extend([e.strip() for e in entities.split(",") if e.strip()])
    if entity and entity.strip():
        names.append(entity.strip())
    if query and query.strip():
        try:
            detected = BotanicalService.detect_botanicals_in_query(query)
            for b in detected:
                if b.get("common_name"):
                    names.append(b["common_name"])
        except Exception:
            pass
        if not names:
            # Use query words if no specific botanical matches
            clean_q = query.strip()
            if len(clean_q) <= 50:
                names.append(clean_q)

    if not names:
        names = ["Ashwagandha"]

    subgraph = GraphService.get_subgraph_for_entities(names, max_hops=max_hops, limit=limit)
    if not subgraph.get("nodes"):
        subgraph = GraphService._synthesize_fallback_subgraph(names, {})
    return subgraph


@router.post("/query", summary="Execute read-only Cypher query on Knowledge Graph")
async def execute_cypher_query(payload: CypherQueryRequest):
    """
    Safe read-only Cypher query runner for Administrative graph inspection and ad-hoc analysis.
    Restricts destructive write statements (DETACH DELETE, DROP).
    """
    if not GraphService.is_available():
        raise HTTPException(status_code=503, detail="Neo4j database is currently disconnected or unavailable.")

    clean_q = payload.query.strip().upper()
    disallowed = ["DETACH DELETE", "DROP CONSTRAINT", "DROP INDEX", "CREATE DATABASE", "DROP DATABASE"]
    if any(term in clean_q for term in disallowed):
        raise HTTPException(status_code=403, detail="Destructive schema modifications are prohibited via this endpoint.")

    try:
        records = Neo4jClient.execute_read(payload.query, payload.parameters or {})
        columns = list(records[0].keys()) if records and isinstance(records[0], dict) else []
        return {
            "success": True,
            "columns": columns,
            "data": records[:100],
            "count": len(records),
            "records": records[:100],
            "summary": {
                "nodes_returned": len(records),
                "relationships_returned": 0
            }
        }
    except Exception as e:
        logger.error(f"Cypher execution failed: {e}")
        raise HTTPException(status_code=400, detail=f"Cypher syntax or execution error: {str(e)}")


@router.post("/sync", summary="Synchronize all PostgreSQL documents to Neo4j Knowledge Graph")
async def sync_postgres_to_graph(db: Session = Depends(get_db)):
    """
    Batch synchronizes all statutory documents and vector chunks stored in Neon PostgreSQL
    into the Neo4j Knowledge Graph, creating entity nodes and semantic relationships.
    """
    if not GraphService.is_available():
        health = check_neo4j_health()
        raise HTTPException(status_code=503, detail=f"Neo4j database is offline: {health.get('error', 'Check connection')}")

    try:
        documents = db.query(KnowledgeDocument).all()
        synced_count = 0
        total_nodes = 0
        total_edges = 0
        errors = []

        for doc in documents:
            try:
                chunks = db.query(AyushKnowledgeVector).filter(
                    AyushKnowledgeVector.document_id == doc.id
                ).order_by(AyushKnowledgeVector.chunk_index.asc()).all()

                doc_data = {
                    "id": doc.id,
                    "title": doc.title,
                    "category": doc.category,
                    "authority": doc.authority,
                    "jurisdiction": doc.jurisdiction,
                    "is_active": (doc.status == "Active")
                }
                chunks_data = [
                    {
                        "id": c.id,
                        "chunk_index": c.chunk_index,
                        "section": c.section,
                        "page": c.page_reference or "",
                        "content_text": c.content_text
                    }
                    for c in chunks
                ]

                res = GraphService.ingest_document_to_graph(doc_data, chunks_data)
                if res.get("success"):
                    synced_count += 1
                    total_nodes += res.get("nodes_created", 0)
                    total_edges += res.get("edges_created", 0)
                else:
                    errors.append({"doc_id": doc.id, "error": res.get("error", "Unknown error")})
            except Exception as doc_err:
                errors.append({"doc_id": doc.id, "error": str(doc_err)})

        return {
            "success": True,
            "total_documents": len(documents),
            "synced_documents": synced_count,
            "nodes_created": total_nodes,
            "edges_created": total_edges,
            "errors": errors[:5]
        }
    except Exception as e:
        logger.error(f"Syncing PostgreSQL to Neo4j failed: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.post("/seed", summary="Seed baseline knowledge corpus and prior art monographs into Neo4j")
async def seed_graph():
    """
    Executes baseline seeding to populate statutory Acts, Sections, Treatises,
    TKDL Formulations, Botanical Herbs, and Patents in Neo4j.
    """
    from scripts.seed_neo4j_graph import seed_knowledge_graph
    try:
        success = seed_knowledge_graph()
        if success:
            stats = GraphService.get_graph_stats()
            return {
                "success": True,
                "message": "Baseline Ayush IP Knowledge Graph seeded successfully!",
                "stats": stats
            }
        else:
            health = check_neo4j_health()
            raise HTTPException(status_code=500, detail=f"Seeding failed: {health.get('error')}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seeding error: {str(e)}")
