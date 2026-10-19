from fastapi import APIRouter
from app.api.endpoints import chat, classification, ip_advisor, sources, admin, graph, research

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["AI Copilot & RAG Chat"])
api_router.include_router(classification.router, prefix="/classification", tags=["Product Classification"])
api_router.include_router(ip_advisor.router, prefix="/ip-advisor", tags=["IP Advisor"])
api_router.include_router(sources.router, prefix="/sources", tags=["Official Sources & Gazettes"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & Audit Logs"])
api_router.include_router(graph.router, prefix="/graph", tags=["Knowledge Graph (Neo4j)"])
api_router.include_router(research.router, prefix="/research", tags=["Research Paper Intelligence"])
