import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Ensure .env is discovered whether running from root, backend, or subfolders
_backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
_root_env = _backend_env.parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env, override=False)
if _root_env.exists():
    load_dotenv(dotenv_path=_root_env, override=False)
load_dotenv()

class Settings:
    PROJECT_NAME: str = "AYUNOVA (IP-SAKTI Sahayak)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    DEEP_AGENTS_ENABLED: bool = os.getenv("DEEP_AGENTS_ENABLED", "true").lower() in ("true", "1", "yes")

    @property
    def TAVILY_API_KEY(self) -> str:
        return os.getenv("TAVILY_API_KEY", "").strip()

    @property
    def is_tavily_configured(self) -> bool:
        return bool(self.TAVILY_API_KEY)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://neondb_owner:npg_g5QUc3fLabEh@ep-bitter-butterfly-b3dgelzn-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    )
    
    # Neo4j Graph Database
    NEO4J_URI: str = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password")
    NEO4J_DATABASE: str = os.getenv("NEO4J_DATABASE", "neo4j")
    NEO4J_DBMS_ID: str = os.getenv("NEO4J_DBMS_ID", "ffddfc71-94df-4a41-9c96-cab5cd510087")
    
    CORS_ORIGINS_RAW: str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000"
    )
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

settings = Settings()
