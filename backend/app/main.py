from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AYUNOVA (IP-SAKTI Sahayak) - AI Assistant for Ayurveda IP & Regulatory Guidance (SIH 2026 - PS SIH26045)"
)

# CORS configuration for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "hackathon": "Smart India Hackathon 2026",
        "problemStatement": "SIH26045",
        "docsUrl": "/docs"
    }

from app.core.database import check_db_health
from app.core.neo4j_client import check_neo4j_health

@app.get("/api/health")
async def health_check():
    db_status = check_db_health()
    neo4j_status = check_neo4j_health()
    return {
        "status": "healthy",
        "knowledgeBase": "Loaded",
        "ragEngine": "Active",
        "database": db_status,
        "graphDatabase": neo4j_status
    }
