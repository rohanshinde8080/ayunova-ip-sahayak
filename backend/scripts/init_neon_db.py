import sys
import os
import logging
from datetime import datetime

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, SessionLocal, Base
from app.models.db_models import (
    KnowledgeDocument,
    AyushKnowledgeVector,
    PriorArtVector,
    IPClassificationVector,
    AdminAuditLog,
    IngestionJob
)
from app.services.embedding_service import EmbeddingService
from app.data import OFFICIAL_SOURCES, PRIOR_ART_RECORDS, IPC_CLASSIFICATIONS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("neon_init")

def get_category_for_source(key: str) -> str:
    if "patents" in key:
        return "Patents Act"
    elif "bda" in key:
        return "Biodiversity (BDA)"
    elif "dca" in key:
        return "Ayush / Drugs & Cosmetics"
    elif "wipo" in key or "fda" in key:
        return "International (WIPO/Nagoya/FDA)"
    elif "tkdl" in key:
        return "TKDL Prior Art"
    return "Pharmacopoeia"

def init_neon_database():
    logger.info("Connecting to Neon Serverless PostgreSQL...")
    
    # 1. Enable pgvector extension
    with engine.connect() as conn:
        logger.info("Enabling pgvector extension on Neon Postgres...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
        logger.info("pgvector extension successfully verified!")

    # 2. Add columns to existing tables safely if they already exist
    with engine.connect() as conn:
        logger.info("Verifying and applying schema column extensions...")
        migrations = [
            "ALTER TABLE ayush_knowledge_vectors ADD COLUMN IF NOT EXISTS document_id VARCHAR(64);",
            "ALTER TABLE ayush_knowledge_vectors ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0;",
            "ALTER TABLE ayush_knowledge_vectors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE prior_art_vectors ADD COLUMN IF NOT EXISTS document_id VARCHAR(64);",
            "ALTER TABLE prior_art_vectors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE ip_classification_vectors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"
        ]
        for m in migrations:
            try:
                conn.execute(text(m))
            except Exception as e:
                logger.warning(f"Column migration warning (ignorable if table newly created): {e}")
        conn.commit()
        logger.info("Schema column extensions verified!")

    # 3. Create all tables (including knowledge_documents, admin_audit_logs, ingestion_jobs)
    logger.info("Creating all missing database tables via SQLAlchemy metadata...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully!")

    # 4. Create HNSW Vector Indexes & relational indexes
    with engine.connect() as conn:
        logger.info("Building HNSW vector indexes & lookup indexes...")
        index_stmts = [
            """
            CREATE INDEX IF NOT EXISTS ayush_knowledge_embedding_hnsw_idx 
            ON ayush_knowledge_vectors 
            USING hnsw (embedding vector_cosine_ops);
            """,
            """
            CREATE INDEX IF NOT EXISTS prior_art_embedding_hnsw_idx 
            ON prior_art_vectors 
            USING hnsw (embedding vector_cosine_ops);
            """,
            "CREATE INDEX IF NOT EXISTS idx_ayush_doc_id ON ayush_knowledge_vectors(document_id);",
            "CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);",
            "CREATE INDEX IF NOT EXISTS idx_doc_content_hash ON knowledge_documents(content_hash);"
        ]
        for stmt in index_stmts:
            try:
                conn.execute(text(stmt))
            except Exception as e:
                logger.warning(f"Index creation note: {e}")
        conn.commit()
        logger.info("HNSW & relational indexes verified successfully!")

    db = SessionLocal()
    try:
        # 5. Seed / Sync Parent KnowledgeDocument records & Ayush Knowledge Base Vectors
        logger.info("Seeding Parent Knowledge Documents & Ayush Knowledge Base Vectors...")
        for key, source in OFFICIAL_SOURCES.items():
            doc_id = f"doc-{key}"
            cat = get_category_for_source(key)
            
            # Upsert KnowledgeDocument
            parent_doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
            if not parent_doc:
                parent_doc = KnowledgeDocument(
                    id=doc_id,
                    title=source.title,
                    filename=f"{key}.pdf",
                    file_type="statutory_act",
                    category=cat,
                    authority=source.authority,
                    jurisdiction=source.jurisdiction,
                    status="Active",
                    total_chunks=1,
                    uploaded_by="system@ayunova.gov.in",
                    doc_metadata={"act": source.officialAct, "section": source.section, "source_key": key}
                )
                db.add(parent_doc)
            else:
                parent_doc.title = source.title
                parent_doc.authority = source.authority
                parent_doc.category = cat
                parent_doc.jurisdiction = source.jurisdiction
                parent_doc.status = "Active"

            # Upsert AyushKnowledgeVector chunk
            existing = db.query(AyushKnowledgeVector).filter(AyushKnowledgeVector.id == key).first()
            content_to_embed = f"{source.title}. {source.section}. Authority: {source.authority}. Summary: {source.summary}. Act: {source.officialAct}. Gazette: {source.gazetteExcerpt}"
            embedding = EmbeddingService.get_embedding(content_to_embed)

            if existing:
                existing.document_id = doc_id
                existing.chunk_index = 0
                existing.is_active = True
                existing.title = source.title
                existing.authority = source.authority
                existing.section = source.section
                existing.official_act = source.officialAct
                existing.page_reference = source.page
                existing.jurisdiction = source.jurisdiction
                existing.content_text = source.summary
                existing.gazette_excerpt = source.gazetteExcerpt
                existing.verified = source.verified
                existing.embedding = embedding
            else:
                db_item = AyushKnowledgeVector(
                    id=key,
                    document_id=doc_id,
                    chunk_index=0,
                    is_active=True,
                    title=source.title,
                    authority=source.authority,
                    section=source.section,
                    official_act=source.officialAct,
                    page_reference=source.page,
                    jurisdiction=source.jurisdiction,
                    content_text=source.summary,
                    gazette_excerpt=source.gazetteExcerpt,
                    verified=source.verified,
                    embedding=embedding,
                    doc_metadata={"source_key": key}
                )
                db.add(db_item)
        db.commit()
        logger.info(f"Synchronized {len(OFFICIAL_SOURCES)} KnowledgeDocument parent records and vector chunks.")

        # 6. Seed Prior Art Vectors
        logger.info("Seeding TKDL Prior Art database into Neon Postgres...")
        for art in PRIOR_ART_RECORDS:
            existing = db.query(PriorArtVector).filter(PriorArtVector.reference_code == art["reference_code"]).first()
            content_to_embed = f"{art['formulation_name']} ({art['classical_treatise']}). Ingredients: {', '.join(art['ingredients'])}. Indications: {', '.join(art['therapeutic_indications'])}. {art['content_text']}"
            embedding = EmbeddingService.get_embedding(content_to_embed)

            if existing:
                existing.formulation_name = art["formulation_name"]
                existing.classical_treatise = art["classical_treatise"]
                existing.ingredients = art["ingredients"]
                existing.therapeutic_indications = art["therapeutic_indications"]
                existing.tkdl_status = art["tkdl_status"]
                existing.content_text = art["content_text"]
                existing.embedding = embedding
                existing.is_active = True
            else:
                db_art = PriorArtVector(
                    reference_code=art["reference_code"],
                    formulation_name=art["formulation_name"],
                    classical_treatise=art["classical_treatise"],
                    ingredients=art["ingredients"],
                    therapeutic_indications=art["therapeutic_indications"],
                    tkdl_status=art["tkdl_status"],
                    content_text=art["content_text"],
                    embedding=embedding,
                    is_active=True
                )
                db.add(db_art)
        db.commit()
        logger.info(f"Seeded {len(PRIOR_ART_RECORDS)} prior art formulation vectors.")

        # 7. Seed IP Classifications
        logger.info("Seeding IP Classification vectors into Neon Postgres...")
        for ipc in IPC_CLASSIFICATIONS:
            existing = db.query(IPClassificationVector).filter(IPClassificationVector.ipc_code == ipc["ipc_code"]).first()
            content_to_embed = f"IPC {ipc['ipc_code']}: {ipc['category']}. {ipc['description']}. Guideline: {ipc['patentability_guideline']}"
            embedding = EmbeddingService.get_embedding(content_to_embed)

            if existing:
                existing.category = ipc["category"]
                existing.description = ipc["description"]
                existing.patentability_guideline = ipc["patentability_guideline"]
                existing.embedding = embedding
                existing.is_active = True
            else:
                db_ipc = IPClassificationVector(
                    ipc_code=ipc["ipc_code"],
                    category=ipc["category"],
                    description=ipc["description"],
                    patentability_guideline=ipc["patentability_guideline"],
                    embedding=embedding,
                    is_active=True
                )
                db.add(db_ipc)
        db.commit()
        logger.info(f"Seeded {len(IPC_CLASSIFICATIONS)} IPC classification vectors.")

        # 8. Record Audit Log for initialization
        audit_entry = AdminAuditLog(
            action="SYSTEM_MIGRATION_PHASE1",
            target_type="Corpus",
            target_id="all_tables",
            details={
                "message": "Phase 1 Database Layer & Schema Migration applied successfully.",
                "knowledge_documents_count": len(OFFICIAL_SOURCES),
                "prior_art_count": len(PRIOR_ART_RECORDS),
                "ipc_count": len(IPC_CLASSIFICATIONS)
            },
            admin_email="admin@ipsakti.ai"
        )
        db.add(audit_entry)
        db.commit()
        logger.info("Audit log entry recorded for Phase 1 migration.")

        logger.info("[SUCCESS] Neon PostgreSQL with pgvector and Phase 1 models fully initialized!")
    except Exception as e:
        db.rollback()
        logger.error(f"Database initialization failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_neon_database()
