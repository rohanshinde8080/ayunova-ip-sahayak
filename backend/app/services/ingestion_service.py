import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.db_models import (
    KnowledgeDocument,
    AyushKnowledgeVector,
    PriorArtVector,
    IPClassificationVector,
    AdminAuditLog,
    IngestionJob
)
from app.services.document_parser import DocumentParserService
from app.services.chunking_service import LegalChunkingService
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("ayunova.ingestion_service")

class IngestionService:
    """
    Central orchestration service for administrative data ingestion.
    Coordinates parsing, legal chunking, vector embedding, database persistence,
    and audit logging across Neon Postgres pgvector tables.
    """

    @classmethod
    def ingest_file(
        cls,
        filename: str,
        content: bytes,
        target_corpus: str = "statutory",
        category: Optional[str] = None,
        authority: Optional[str] = None,
        official_act: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        admin_email: str = "admin@ipsakti.ai",
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Parses an uploaded file, creates parent document, generates legal chunks,
        embeds vector representations, and inserts into Neon PostgreSQL.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            # 1. Parse file
            parsed = DocumentParserService.parse_file(filename, content)
            raw_text = parsed["raw_text"]
            content_hash = parsed["content_hash"]
            meta = parsed["extracted_metadata"]

            if not raw_text.strip():
                raise ValueError("Parsed document yielded no readable text.")

            doc_title = meta.get("suggested_title", filename)
            doc_category = category or meta.get("suggested_category", "Patents Act")
            doc_authority = authority or meta.get("suggested_authority", "Ministry of Ayush / AIIA")
            doc_act = official_act or meta.get("suggested_act", "Ayush Statutory Directive")
            doc_jurisdiction = jurisdiction or meta.get("suggested_jurisdiction", "India")
            doc_section = meta.get("suggested_section", "General Provisions")

            # Check if document with same hash already exists
            existing_doc: Any = db.query(KnowledgeDocument).filter(KnowledgeDocument.content_hash == content_hash).first()
            doc_id = str(existing_doc.id) if existing_doc else f"doc-{uuid.uuid4().hex[:12]}"

            # 2. Chunk document using statutory chunker
            chunks = LegalChunkingService.chunk_document(
                text=raw_text,
                doc_title=doc_title,
                authority=doc_authority,
                official_act=doc_act,
                default_section=doc_section,
                jurisdiction=doc_jurisdiction
            )

            if not chunks:
                raise ValueError("Document could not be segmented into semantic chunks.")

            # 3. Create or update parent KnowledgeDocument
            if existing_doc:
                parent_doc: Any = existing_doc
                parent_doc.title = str(doc_title)
                parent_doc.category = str(doc_category)
                parent_doc.authority = str(doc_authority)
                parent_doc.jurisdiction = str(doc_jurisdiction)
                parent_doc.total_chunks = int(len(chunks))
                parent_doc.status = "Active"
                parent_doc.updated_at = datetime.now(timezone.utc)
                # Remove existing chunks for re-injection
                db.query(AyushKnowledgeVector).filter(AyushKnowledgeVector.document_id == doc_id).delete()
            else:
                parent_doc = KnowledgeDocument(
                    id=doc_id,
                    title=doc_title,
                    filename=filename,
                    file_type=parsed["file_type"],
                    category=doc_category,
                    authority=doc_authority,
                    jurisdiction=doc_jurisdiction,
                    status="Active",
                    total_chunks=len(chunks),
                    content_hash=content_hash,
                    uploaded_by=admin_email,
                    doc_metadata={
                        "char_count": parsed["char_count"],
                        "word_count": parsed["word_count"],
                        "page_count": parsed["page_count"],
                        "official_act": doc_act,
                        "initial_section": doc_section
                    }
                )
                db.add(parent_doc)

            db.flush()

            # 4. Generate embeddings and store chunks
            chunks_created: List[Dict[str, Any]] = []
            for chunk in chunks:
                chunk_id = f"{doc_id}-chk-{chunk['chunk_index']}"
                embed_text = chunk["embed_text"]
                embedding = EmbeddingService.get_embedding(embed_text)

                vector_item = AyushKnowledgeVector(
                    id=chunk_id,
                    document_id=doc_id,
                    chunk_index=chunk["chunk_index"],
                    is_active=True,
                    title=f"{doc_title} ({chunk['section']})",
                    authority=doc_authority,
                    section=chunk["section"],
                    official_act=doc_act,
                    page_reference=chunk["page"],
                    jurisdiction=doc_jurisdiction,
                    content_text=chunk["content_text"],
                    gazette_excerpt=chunk["content_text"][:300] + "..." if len(chunk["content_text"]) > 300 else chunk["content_text"],
                    verified=True,
                    embedding=embedding,
                    doc_metadata={
                        "parent_id": doc_id,
                        "estimated_tokens": chunk["estimated_tokens"],
                        "char_length": chunk["char_length"]
                    }
                )
                db.add(vector_item)
                chunks_created.append({
                    "id": chunk_id,
                    "chunk_index": chunk["chunk_index"],
                    "section": chunk["section"],
                    "page": chunk["page"],
                    "preview": chunk["content_text"][:120]
                })

            # 5. Record Audit Log
            audit_log = AdminAuditLog(
                action="INGEST_FILE",
                target_type="KnowledgeDocument",
                target_id=doc_id,
                details={
                    "filename": filename,
                    "file_type": parsed["file_type"],
                    "category": doc_category,
                    "chunks_count": len(chunks),
                    "char_count": parsed["char_count"],
                    "jurisdiction": doc_jurisdiction
                },
                admin_email=admin_email
            )
            db.add(audit_log)
            db.commit()

            # Dual-Persistence: Ingest into Neo4j Knowledge Graph
            graph_result = {"success": False, "nodes_created": 0, "edges_created": 0}
            try:
                from app.services.graph_service import GraphService
                doc_payload = {
                    "id": doc_id,
                    "title": doc_title,
                    "category": doc_category,
                    "authority": doc_authority,
                    "jurisdiction": doc_jurisdiction,
                    "is_active": True
                }
                graph_chunks = [
                    {
                        "id": f"{doc_id}-chk-{c['chunk_index']}",
                        "chunk_index": c["chunk_index"],
                        "section": c["section"],
                        "page": c.get("page", ""),
                        "content_text": c["content_text"]
                    }
                    for c in chunks
                ]
                graph_result = GraphService.ingest_document_to_graph(doc_payload, graph_chunks)
            except Exception as ge:
                logger.warning(f"Neo4j graph ingestion skipped or failed: {ge}")

            logger.info(f"[SUCCESS] Ingested document '{filename}' with {len(chunks)} chunks into Neon pgvector.")
            return {
                "success": True,
                "document_id": doc_id,
                "title": doc_title,
                "filename": filename,
                "file_type": parsed["file_type"],
                "category": doc_category,
                "authority": doc_authority,
                "jurisdiction": doc_jurisdiction,
                "total_chunks": len(chunks),
                "chunks_sample": chunks_created[:3],
                "audit_log_id": audit_log.id,
                "graph_sync": graph_result
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to ingest file '{filename}': {e}")
            raise e
        finally:
            if close_session:
                db.close()

    @classmethod
    def ingest_manual_entry(
        cls,
        title: str,
        authority: str,
        official_act: str,
        section: str,
        content_text: str,
        jurisdiction: str = "India",
        category: str = "Patents Act",
        page_reference: Optional[str] = None,
        gazette_excerpt: Optional[str] = None,
        target_corpus: str = "statutory",
        admin_email: str = "admin@ipsakti.ai",
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Inserts a single statutory rule, gazette notification, or prior art record 
        submitted manually via the Admin Console.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            doc_id = f"doc-manual-{uuid.uuid4().hex[:8]}"
            chunk_id = f"chk-{uuid.uuid4().hex[:10]}"

            # Embed content with contextual prefix
            embed_text = f"[Statute: {title} | Authority: {authority} | Section: {section} | Act: {official_act}] {content_text}"
            embedding = EmbeddingService.get_embedding(embed_text)

            # Create KnowledgeDocument parent
            parent_doc = KnowledgeDocument(
                id=doc_id,
                title=title,
                filename=f"manual_{section.replace(' ', '_').lower()}.txt",
                file_type="manual",
                category=category,
                authority=authority,
                jurisdiction=jurisdiction,
                status="Active",
                total_chunks=1,
                uploaded_by=admin_email,
                doc_metadata={"section": section, "official_act": official_act}
            )
            db.add(parent_doc)

            # Create AyushKnowledgeVector child
            vector_item = AyushKnowledgeVector(
                id=chunk_id,
                document_id=doc_id,
                chunk_index=0,
                is_active=True,
                title=title,
                authority=authority,
                section=section,
                official_act=official_act,
                page_reference=page_reference or "",
                jurisdiction=jurisdiction,
                content_text=content_text,
                gazette_excerpt=gazette_excerpt or (content_text[:250] + "..."),
                verified=True,
                embedding=embedding,
                doc_metadata={"source": "Admin Manual Entry", "parent_id": doc_id}
            )
            db.add(vector_item)

            audit_log = AdminAuditLog(
                action="MANUAL_ENTRY",
                target_type="KnowledgeDocument",
                target_id=doc_id,
                details={"title": title, "section": section, "authority": authority},
                admin_email=admin_email
            )
            db.add(audit_log)
            db.commit()

            # Dual-Persistence: Ingest into Neo4j Knowledge Graph
            graph_result = {"success": False}
            try:
                from app.services.graph_service import GraphService
                graph_result = GraphService.ingest_manual_entry_to_graph(
                    doc_id=doc_id,
                    chunk_id=chunk_id,
                    title=title,
                    authority=authority,
                    official_act=official_act,
                    section=section,
                    content_text=content_text,
                    jurisdiction=jurisdiction,
                    category=category
                )
            except Exception as ge:
                logger.warning(f"Neo4j manual entry graph ingestion skipped or failed: {ge}")

            return {
                "success": True,
                "document_id": doc_id,
                "chunk_id": chunk_id,
                "title": title,
                "section": section,
                "audit_log_id": audit_log.id,
                "graph_sync": graph_result
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Manual entry injection failed: {e}")
            raise e
        finally:
            if close_session:
                db.close()

    @classmethod
    def toggle_document_status(
        cls,
        document_id: str,
        admin_email: str = "admin@ipsakti.ai",
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Toggles document status between 'Active' and 'Inactive' and synchronizes 
        all child vector chunks so deactivated provisions are instantly excluded from RAG retrieval.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            doc: Any = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
            if not doc:
                raise ValueError(f"Document with ID '{document_id}' not found.")

            new_status = "Inactive" if doc.status == "Active" else "Active"
            new_is_active = (new_status == "Active")

            doc.status = new_status
            doc.updated_at = datetime.now(timezone.utc)

            # Synchronize all child chunks
            db.query(AyushKnowledgeVector).filter(
                AyushKnowledgeVector.document_id == document_id
            ).update({"is_active": new_is_active})

            audit_log = AdminAuditLog(
                action="TOGGLE_STATUS",
                target_type="KnowledgeDocument",
                target_id=document_id,
                details={"new_status": new_status, "title": doc.title},
                admin_email=admin_email
            )
            db.add(audit_log)
            db.commit()

            # Dual-Persistence: Toggle in Neo4j Knowledge Graph
            try:
                from app.services.graph_service import GraphService
                GraphService.toggle_document_graph_status(document_id, is_active=new_is_active)
            except Exception as ge:
                logger.warning(f"Neo4j status toggle failed: {ge}")

            return {
                "success": True,
                "document_id": document_id,
                "status": new_status,
                "is_active": new_is_active
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to toggle document status: {e}")
            raise e
        finally:
            if close_session:
                db.close()

    @classmethod
    def delete_document(
        cls,
        document_id: str,
        admin_email: str = "admin@ipsakti.ai",
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Permanently deletes a KnowledgeDocument and cascades removal of all associated 
        vector chunks from Neon Postgres.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
            if not doc:
                raise ValueError(f"Document with ID '{document_id}' not found.")

            doc_title = doc.title

            # Delete child vector chunks
            deleted_chunks = db.query(AyushKnowledgeVector).filter(
                AyushKnowledgeVector.document_id == document_id
            ).delete()

            # Delete parent document
            db.delete(doc)

            audit_log = AdminAuditLog(
                action="DELETE_DOCUMENT",
                target_type="KnowledgeDocument",
                target_id=document_id,
                details={"deleted_title": doc_title, "deleted_chunks_count": deleted_chunks},
                admin_email=admin_email
            )
            db.add(audit_log)
            db.commit()

            # Dual-Persistence: Delete from Neo4j Knowledge Graph
            try:
                from app.services.graph_service import GraphService
                GraphService.delete_document_from_graph(document_id)
            except Exception as ge:
                logger.warning(f"Neo4j document deletion failed: {ge}")

            return {
                "success": True,
                "document_id": document_id,
                "deleted_title": doc_title,
                "deleted_chunks": deleted_chunks
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete document '{document_id}': {e}")
            raise e
        finally:
            if close_session:
                db.close()
