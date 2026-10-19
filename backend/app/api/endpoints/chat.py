from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import asyncio
from app.models.schemas import ChatQueryRequest, StructuredAIAnswer, RAGTelemetryResponse
from app.services.rag_engine import AyushRAGEngine
from app.services.vector_service import VectorService
from app.core.config import settings
from app.core.database import get_db

from app.services.deep_agent_service import AyushDeepAgentService

router = APIRouter()

@router.post("", response_model=StructuredAIAnswer)
@router.post("/process-query", response_model=StructuredAIAnswer)
async def process_chat_query(payload: ChatQueryRequest):
    """
    RAG-grounded legal and patent analysis for Ayurvedic queries.
    Supports either Fast Hybrid RAG or DeepAgent (Tri-Modal Research + SubAgents).
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    history_list = [(h.model_dump() if hasattr(h, 'model_dump') else h.dict()) for h in payload.history] if payload.history else None
    doc_id = payload.document_id or payload.source_document_id
    
    if payload.use_deep_agent:
        return AyushDeepAgentService.process_deep_agent_query(
            query=payload.query,
            jurisdiction=payload.jurisdiction or "India",
            language=payload.language or "English",
            history=history_list,
            enable_rubric=payload.enable_rubric if payload.enable_rubric is not None else True,
            document_id=doc_id
        )

    return AyushRAGEngine.process_chat_query(
        query=payload.query,
        jurisdiction=payload.jurisdiction or "India",
        language=payload.language or "English",
        history=history_list,
        document_id=doc_id
    )

@router.post("/stream")
async def stream_chat_query(payload: ChatQueryRequest):
    """
    Server-Sent Events (SSE) streaming endpoint for live progressive pipeline steps
    and streaming grounded answers. Supports use_deep_agent for multi-agent reasoning.
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    history_list = [(h.model_dump() if hasattr(h, 'model_dump') else h.dict()) for h in payload.history] if payload.history else None
    doc_id = payload.document_id or payload.source_document_id

    # Route to DeepAgent real-time SSE stream if requested
    if payload.use_deep_agent:
        return StreamingResponse(
            AyushDeepAgentService.stream_deep_agent_query(
                query=payload.query,
                jurisdiction=payload.jurisdiction or "India",
                language=payload.language or "English",
                history=history_list,
                enable_rubric=payload.enable_rubric if payload.enable_rubric is not None else True,
                document_id=doc_id
            ),
            media_type="text/event-stream"
        )

    async def event_generator():
        lang = payload.language or "English"
        juris = payload.jurisdiction or "India"
        
        # Step 1: Language & statutory jurisdiction resolution
        step1 = {"id": "step-1", "label": f"Language detected: {lang} | Jurisdiction: {juris}", "status": "completed"}
        yield f"event: step\ndata: {json.dumps(step1)}\n\n"
        await asyncio.sleep(0.06)

        # Step 2: Semantic vector search across Neon pgvector
        step2 = {"id": "step-2", "label": "Querying Neon pgvector Knowledge Base (HNSW Index: TKDL, Patents Act, DCA, BDA)", "status": "completed"}
        yield f"event: step\ndata: {json.dumps(step2)}\n\n"
        await asyncio.sleep(0.05)

        # Step 2b: Multi-hop Knowledge Graph traversal across Neo4j
        step2b = {"id": "step-2b", "label": "Traversing Neo4j Knowledge Graph (multi-hop legal bars & entity relations)", "status": "completed"}
        yield f"event: step\ndata: {json.dumps(step2b)}\n\n"
        await asyncio.sleep(0.05)

        # Step 3: Synthesize grounded response
        answer_obj = AyushRAGEngine.process_chat_query(
            query=payload.query,
            jurisdiction=juris,
            language=lang,
            history=history_list,
            document_id=doc_id
        )

        # Step 2c: If live web search was triggered, emit real-time web search step
        has_web_sources = any(s.id.startswith("web-") for s in answer_obj.sources) or "Tavily" in (answer_obj.generationSource or "")
        if has_web_sources:
            step_web = {
                "id": "step-web-live",
                "label": "Searched Live Web via Tavily for latest clinical trials, research & global patent records",
                "status": "completed"
            }
            yield f"event: step\ndata: {json.dumps(step_web)}\n\n"
            await asyncio.sleep(0.04)

        step3 = {"id": "step-3", "label": f"Grounded against {len(answer_obj.sources)} official gazette citations & {len(answer_obj.graphContext or [])} graph facts", "status": "completed"}
        yield f"event: step\ndata: {json.dumps(step3)}\n\n"
        await asyncio.sleep(0.04)

        # Emit live Subgraph event if available
        if answer_obj.subgraph and answer_obj.subgraph.nodes:
            sg_dump = answer_obj.subgraph.model_dump() if hasattr(answer_obj.subgraph, 'model_dump') else answer_obj.subgraph.dict()
            yield f"event: subgraph\ndata: {json.dumps(sg_dump)}\n\n"
            await asyncio.sleep(0.02)

        # Stream words as live tokens for dynamic UI typing effect
        words = answer_obj.answer.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3]) + (" " if i + 3 < len(words) else "")
            yield f"event: token\ndata: {json.dumps({'token': chunk})}\n\n"
            await asyncio.sleep(0.02)

        # Emit full structured answer
        answer_dump = answer_obj.model_dump() if hasattr(answer_obj, 'model_dump') else answer_obj.dict()
        yield f"event: final_answer\ndata: {json.dumps(answer_dump)}\n\n"
        yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/telemetry", response_model=RAGTelemetryResponse)
async def get_rag_telemetry(db: Session = Depends(get_db)):
    """
    Live RAG pipeline telemetry, Neon pgvector status, Neo4j graph metrics, and DeepAgent capabilities.
    """
    stats = VectorService.get_vector_corpus_stats(db=db)
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_tavily = bool(settings.is_tavily_configured)
    tavily_status = "ONLINE (Live Web Patent & Gazette Search)" if has_tavily else "OFFLINE (API Key Missing)"
    
    from app.services.graph_service import GraphService
    graph_stats = GraphService.get_graph_stats()
    
    return RAGTelemetryResponse(
        status="ONLINE",
        database="Neon Serverless PostgreSQL (pgvector 0.8.6 / HNSW)",
        activeVectorsCount=stats.get("total_active_vectors", 0),
        activeStatutesCount=stats.get("active_statute_vectors", 0),
        activePriorArtCount=stats.get("active_prior_art_vectors", 0),
        indexType=stats.get("index_type", "HNSW"),
        synthesisEngine="Gemini 2.5 Flash + Hybrid GraphRAG (Neo4j + pgvector)" if has_gemini else "Hybrid GraphRAG Synthesizer (Neo4j + pgvector Grounded)",
        geminiConfigured=has_gemini,
        graphDatabase=f"Neo4j Desktop ({graph_stats.get('server_version', '5.x+')})",
        graphConnected=graph_stats.get("connected", False),
        graphNodesCount=graph_stats.get("total_nodes", 0),
        graphRelationshipsCount=graph_stats.get("total_relationships", 0),
        tavilyConfigured=has_tavily,
        tavilyStatus=tavily_status,
        deepAgentAvailable=True,
        deepAgentTools=[
            "search_vector_database",
            "execute_graph_cypher",
            "extract_graph_subgraph",
            "search_web_tavily",
            "lookup_statutory_section"
        ],
        deepAgentSubagents=[
            "patent-examiner",
            "biodiversity-compliance",
            "ayush-tkdl-specialist",
            "trademark-brand-strategist"
        ],
        deepAgentSkills=[
            "section-3p-defense",
            "synergy-experimental-protocol",
            "nba-form-iii-filing",
            "live-prior-art-invalidation"
        ]
    )

@router.get("/presets")
async def get_preset_queries():
    return {
        "presets": [
            {
                "id": "triphala-patent",
                "label": "🌿 Can I patent a Triphala + Curcumin Formulation?",
                "query": "Can I patent an Ayurvedic Triphala and Curcumin synergistic blend in India?",
                "category": "Patent Bar & TKDL"
            },
            {
                "id": "us-triphala-probiotics",
                "label": "🇺🇸 US Patent 11992510: Triphala + Probiotic Compositions",
                "query": "What are the key claims of US Patent 11992510 regarding Triphala with Bacillus coagulans and probiotics?",
                "category": "Prior Art & Claims Analysis"
            },
            {
                "id": "brand-exclusivity",
                "label": "🏷️ Brand Exclusivity & Trademark Strategies",
                "query": "How do I secure brand protection and trademark exclusivity for classical Ayurvedic formulations?",
                "category": "Trademarks"
            },
            {
                "id": "bda-compliance",
                "label": "⚖️ Biological Diversity Act (BDA 2023) Compliances",
                "query": "What are the mandatory approvals needed under Biological Diversity Act 2023 for commercializing Ayush formulations?",
                "category": "Biodiversity Compliance"
            },
            {
                "id": "synthetic-hybrid",
                "label": "🧪 Synthetic Peptide Hybrid (Low Confidence Test)",
                "query": "Can I patent a synthetic peptide hybrid unknown chemical formulation as an Ayurvedic drug?",
                "category": "Low Confidence Warning"
            }
        ]
    }

