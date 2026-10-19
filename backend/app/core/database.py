import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings

logger = logging.getLogger("ayunova.db")

# Normalize database URL for psycopg2 compatibility across environments
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

# Configure SQLAlchemy Engine for Neon Serverless Postgres
engine = create_engine(
    db_url,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
    connect_args={
        "sslmode": "require"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_health() -> dict:
    """Verify connectivity to Neon Postgres and pgvector extension status."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();")).fetchone()
            vector_check = connection.execute(
                text("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
            ).fetchone()
            
            return {
                "status": "connected",
                "neon_postgres_version": result[0] if result else "unknown",
                "pgvector_enabled": vector_check is not None,
                "pgvector_version": vector_check[1] if vector_check else None
            }
    except Exception as e:
        logger.error(f"Neon database health check failed: {e}")
        return {
            "status": "disconnected",
            "error": str(e),
            "pgvector_enabled": False
        }
