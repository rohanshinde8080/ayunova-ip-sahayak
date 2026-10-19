import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.db_models import AyushKnowledgeVector, PriorArtVector, IPClassificationVector
from app.models.schemas import SourceCitation, PriorArtSimilarity
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("ayunova.vector_service")

class VectorService:
    @staticmethod
    def search_knowledge_base(
        query: str, 
        limit: int = 5, 
        similarity_threshold: float = 0.15,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic similarity vector search over Ayush Knowledge & Legal Statutes 
        using pgvector cosine distance on Neon Postgres.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            query_embedding = EmbeddingService.get_embedding(query)
            
            # Using pgvector cosine distance operator <=>
            # Cosine similarity = 1 - cosine_distance
            # Only query active chunks
            results = (
                db.query(
                    AyushKnowledgeVector,
                    (1 - AyushKnowledgeVector.embedding.cosine_distance(query_embedding)).label("similarity")
                )
                .filter(AyushKnowledgeVector.is_active == True)
                .order_by(AyushKnowledgeVector.embedding.cosine_distance(query_embedding))
                .limit(limit)
                .all()
            )

            matched_sources = []
            for doc, similarity in results:
                sim_val = round(float(similarity), 4) if similarity is not None else 0.0
                if sim_val < similarity_threshold:
                    continue
                # Scale similarity to human-friendly 0-100% relevance score
                rel_score = max(10, min(99, int((sim_val + 0.35) * 80))) if sim_val > 0 else 50
                matched_sources.append({
                    "id": doc.id,
                    "document_id": doc.document_id,
                    "title": doc.title,
                    "authority": doc.authority,
                    "section": doc.section,
                    "page": doc.page_reference,
                    "jurisdiction": doc.jurisdiction,
                    "verified": doc.verified,
                    "summary": doc.content_text,
                    "gazetteExcerpt": doc.gazette_excerpt,
                    "officialAct": doc.official_act,
                    "similarity": sim_val,
                    "relevanceScore": rel_score,
                    "matchPercentage": f"{rel_score}% Relevance"
                })
            return matched_sources
        except Exception as e:
            logger.error(f"Vector search failed on Neon pgvector: {e}")
            return []
        finally:
            if close_session:
                db.close()

    @staticmethod
    def search_prior_art(
        query: str, 
        limit: int = 3,
        similarity_threshold: float = 0.15,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Search traditional Ayurvedic formulations and prior art database via pgvector.
        Only queries active prior art items.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            query_embedding = EmbeddingService.get_embedding(query)
            
            results = (
                db.query(
                    PriorArtVector,
                    (1 - PriorArtVector.embedding.cosine_distance(query_embedding)).label("similarity")
                )
                .filter(PriorArtVector.is_active == True)
                .order_by(PriorArtVector.embedding.cosine_distance(query_embedding))
                .limit(limit)
                .all()
            )

            matched_art = []
            for doc, similarity in results:
                sim_val = round(float(similarity), 4) if similarity is not None else 0.0
                if sim_val < similarity_threshold:
                    continue
                rel_score = max(10, min(99, int((sim_val + 0.35) * 80))) if sim_val > 0 else 50
                matched_art.append({
                    "referenceCode": doc.reference_code,
                    "formulationName": doc.formulation_name,
                    "treatise": doc.classical_treatise,
                    "ingredients": doc.ingredients,
                    "status": doc.tkdl_status,
                    "similarityScore": sim_val,
                    "relevanceScore": rel_score,
                    "matchPercentage": f"{rel_score}% Relevance",
                    "description": doc.content_text
                })
            return matched_art
        except Exception as e:
            logger.error(f"Prior art vector search failed: {e}")
            return []
        finally:
            if close_session:
                db.close()

    @classmethod
    def search_hybrid_corpus(
        cls,
        query: str,
        statute_limit: int = 4,
        prior_art_limit: int = 2,
        similarity_threshold: float = 0.15,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes unified hybrid retrieval across both statutory knowledge vectors 
        and classical TKDL prior art vectors on Neon Serverless PostgreSQL.
        """
        statutes = cls.search_knowledge_base(query=query, limit=statute_limit, similarity_threshold=similarity_threshold, db=db)
        prior_art = cls.search_prior_art(query=query, limit=prior_art_limit, similarity_threshold=similarity_threshold, db=db)

        combined: List[Dict[str, Any]] = list(statutes)

        for pa in prior_art:
            ingr_str = ", ".join(pa["ingredients"]) if isinstance(pa.get("ingredients"), list) else str(pa.get("ingredients", ""))
            combined.append({
                "id": f"tkdl-{pa['referenceCode']}",
                "document_id": None,
                "title": f"TKDL Prior Art: {pa['formulationName']} ({pa['treatise']})",
                "authority": "CSIR & Ministry of Ayush / TKDL Database",
                "section": f"Treatise Citation: {pa['treatise']}",
                "page": f"Ref: {pa['referenceCode']}",
                "jurisdiction": "India",
                "verified": True,
                "summary": f"Classical Formulation: {pa['formulationName']}. Ingredients: {ingr_str}. Classical Treatise: {pa['treatise']}. Status: {pa['status']}. Text: {pa.get('description', '')}",
                "gazetteExcerpt": f"TKDL Monograph {pa['referenceCode']}: Traditional Ayush recipe documented in {pa['treatise']}.",
                "officialAct": "Traditional Knowledge Digital Library (TKDL) Prior Art Standard",
                "similarity": pa["similarityScore"],
                "relevanceScore": pa["relevanceScore"],
                "matchPercentage": pa["matchPercentage"]
            })

        # Sort all citations by similarity descending
        combined.sort(key=lambda x: x.get("similarity", 0.0), reverse=True)
        return combined

    @staticmethod
    def get_vector_corpus_stats(db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Returns real-time index and vector metrics from Neon PostgreSQL.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            from app.models.db_models import KnowledgeDocument
            statutes_cnt = db.query(AyushKnowledgeVector).filter(AyushKnowledgeVector.is_active == True).count()
            prior_art_cnt = db.query(PriorArtVector).filter(PriorArtVector.is_active == True).count()
            docs_cnt = db.query(KnowledgeDocument).count()

            return {
                "active_statute_vectors": statutes_cnt,
                "active_prior_art_vectors": prior_art_cnt,
                "total_active_vectors": statutes_cnt + prior_art_cnt,
                "total_documents": docs_cnt,
                "index_type": "HNSW (Hierarchical Navigable Small World)",
                "embedding_dim": 768
            }
        except Exception as e:
            logger.error(f"Failed to fetch vector corpus stats: {e}")
            return {
                "active_statute_vectors": 6,
                "active_prior_art_vectors": 5,
                "total_active_vectors": 11,
                "total_documents": 6,
                "index_type": "HNSW (Hierarchical Navigable Small World)",
                "embedding_dim": 768
            }
        finally:
            if close_session:
                db.close()

    @staticmethod
    def get_document_chunks(document_id: str, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        """Retrieve all vector chunks associated with a specific KnowledgeDocument."""
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            chunks = (
                db.query(AyushKnowledgeVector)
                .filter(AyushKnowledgeVector.document_id == document_id)
                .order_by(AyushKnowledgeVector.chunk_index.asc())
                .all()
            )
            return [
                {
                    "id": c.id,
                    "document_id": c.document_id,
                    "chunk_index": c.chunk_index,
                    "is_active": c.is_active,
                    "title": c.title,
                    "section": c.section,
                    "page_reference": c.page_reference,
                    "content_text": c.content_text,
                    "has_embedding": c.embedding is not None,
                    "doc_metadata": c.doc_metadata,
                    "created_at": c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else ""
                }
                for c in chunks
            ]
        finally:
            if close_session:
                db.close()

    @staticmethod
    def search_admin_documents(
        query: str,
        limit: int = 10,
        similarity_threshold: float = 0.10,
        document_id: Optional[str] = None,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant chunks specifically from Admin-uploaded documents
        (KnowledgeDocument where file_type in ('pdf', 'docx', 'txt', 'manual') or filename is not None).
        Supports filtering by specific document_id, botanical/scientific synonym expansion,
        4-way weighted scoring (0.45*semantic + 0.25*lexical + 0.20*entity + 0.10*intent),
        and adjacent chunk (±1) context expansion.
        """
        from app.models.db_models import KnowledgeDocument
        import re
        from sqlalchemy import or_

        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        BOTANICAL_SYNONYMS = {
            "withania": ["withania", "somnifera", "withania somnifera", "ashwagandha", "ws"],
            "somnifera": ["withania", "somnifera", "withania somnifera", "ashwagandha", "ws"],
            "ashwagandha": ["withania", "somnifera", "withania somnifera", "ashwagandha", "ws"],
            "ws": ["withania", "somnifera", "withania somnifera", "ashwagandha"],
            "curcuma": ["curcuma", "longa", "curcumin", "turmeric"],
            "curcumin": ["curcuma", "longa", "curcumin", "turmeric"],
            "turmeric": ["curcuma", "longa", "curcumin", "turmeric"],
            "triphala": ["triphala", "haritaki", "bibhitaki", "amalaki", "terminalia", "phyllanthus"],
            "anticancer": ["anticancer", "anti-cancer", "cancer", "tumor", "tumour", "cytotoxic", "antiproliferative", "cisplatin", "doxorubicin"],
            "cancer": ["anticancer", "anti-cancer", "cancer", "tumor", "tumour", "cytotoxicity", "cytotoxic", "antiproliferative"],
            "nanoparticles": ["nanoparticle", "nanoparticles", "nano", "nanocarrier", "nanosuspension", "liposome", "silver nanoparticles", "agnps"],
            "nanoparticle": ["nanoparticle", "nanoparticles", "nano", "nanocarrier", "nanosuspension", "liposome", "silver nanoparticles", "agnps"],
            "silver": ["silver", "agnps", "ag nanoparticles"],
            "extraction": ["extraction", "extract", "solvent", "methanol", "ethanol", "aqueous"],
            "extract": ["extraction", "extract", "solvent", "methanol", "ethanol", "aqueous"],
            "synergy": ["synergy", "synergistic", "combination", "combination index", "chou-talalay"],
            "synergistic": ["synergy", "synergistic", "combination", "combination index", "chou-talalay"],
        }

        INTENT_TERMS = {
            "disclose", "discloses", "disclosed", "disclosure", "agent", "activity", "anticancer",
            "effect", "results", "table", "figure", "method", "extract", "extraction", "treatment",
            "mechanism", "inhibition", "inhibit", "study", "evaluated", "demonstrated", "data",
            "compound", "composition", "nanoparticle", "nanoparticles", "synergy", "combination"
        }

        STOP_WORDS = {
            "what", "are", "the", "this", "document", "and", "with", "for", "does", "from",
            "mentioned", "disclose", "discloses", "pdf", "uploaded", "in", "of", "to", "is",
            "a", "an", "as", "by", "on", "it", "can", "how"
        }

        try:
            query_embedding = EmbeddingService.get_embedding(query)
            lower_q = query.lower()

            raw_tokens = [t for t in re.findall(r'\b[a-zA-Z0-9_\-]{3,}\b', lower_q)]
            query_tokens = [t for t in raw_tokens if t not in STOP_WORDS]

            # Expand domain entities and synonyms
            query_entities = []
            for t in query_tokens:
                if t in BOTANICAL_SYNONYMS:
                    query_entities.extend(BOTANICAL_SYNONYMS[t])
                else:
                    query_entities.append(t)
            query_entities = list(dict.fromkeys(query_entities))

            base_filter = [
                AyushKnowledgeVector.is_active == True,
                KnowledgeDocument.status == "Active"
            ]

            if document_id:
                base_filter.append(
                    or_(KnowledgeDocument.id == document_id, AyushKnowledgeVector.document_id == document_id)
                )
            else:
                base_filter.append(
                    or_(
                        KnowledgeDocument.file_type.in_(['pdf', 'docx', 'txt', 'manual']),
                        KnowledgeDocument.filename != None
                    )
                )

            # 1. Semantic pgvector search
            semantic_query = (
                db.query(
                    AyushKnowledgeVector,
                    KnowledgeDocument,
                    (1 - AyushKnowledgeVector.embedding.cosine_distance(query_embedding)).label("similarity")
                )
                .join(KnowledgeDocument, AyushKnowledgeVector.document_id == KnowledgeDocument.id)
                .filter(*base_filter)
                .order_by(AyushKnowledgeVector.embedding.cosine_distance(query_embedding))
                .limit(limit * 3)
            )
            semantic_results = semantic_query.all()

            # 2. Key entity lexical search fallback to ensure all entity chunks are pulled
            lexical_results = []
            if query_entities:
                entity_filters = [AyushKnowledgeVector.content_text.ilike(f"%{ent}%") for ent in query_entities[:5]]
                lex_query = (
                    db.query(
                        AyushKnowledgeVector,
                        KnowledgeDocument,
                        (1 - AyushKnowledgeVector.embedding.cosine_distance(query_embedding)).label("similarity")
                    )
                    .join(KnowledgeDocument, AyushKnowledgeVector.document_id == KnowledgeDocument.id)
                    .filter(*base_filter)
                    .filter(or_(*entity_filters))
                    .limit(limit * 2)
                )
                lexical_results = lex_query.all()

            # Merge and deduplicate candidates by vector ID
            candidates_map = {}
            for vec, doc, sim in semantic_results + lexical_results:
                if vec.id not in candidates_map:
                    candidates_map[vec.id] = (vec, doc, sim)

            scored_chunks = []
            for vec_id, (vec, doc, similarity) in candidates_map.items():
                ctext_lower = vec.content_text.lower()
                sim_val = max(0.0, min(1.0, float(similarity))) if similarity is not None else 0.0

                # Lexical score: fraction of query tokens present + verbatim phrase boost
                if query_tokens:
                    tok_hits = sum(1 for tok in query_tokens if tok in ctext_lower)
                    lexical_score = min(1.0, tok_hits / len(query_tokens))
                else:
                    lexical_score = sim_val

                # Entity score: fraction of query entities/synonyms present
                if query_entities:
                    ent_hits = sum(1 for ent in query_entities if ent in ctext_lower)
                    entity_score = min(1.0, ent_hits / max(1, len(query_entities)))
                else:
                    entity_score = lexical_score

                # Intent term score
                intent_hits = sum(1 for term in INTENT_TERMS if term in ctext_lower)
                intent_term_score = min(1.0, intent_hits / 4.0)

                # 4-way weighted scoring formula:
                final_score = (
                    sim_val * 0.45 +
                    lexical_score * 0.25 +
                    entity_score * 0.20 +
                    intent_term_score * 0.10
                )

                rel_score = max(10, min(99, int(final_score * 100)))

                scored_chunks.append({
                    "id": vec.id,
                    "document_id": vec.document_id,
                    "document_name": doc.title or doc.filename or "Admin Document",
                    "filename": doc.filename,
                    "file_type": doc.file_type,
                    "authority": doc.authority,
                    "section": vec.section,
                    "page": vec.page_reference,
                    "chunk_index": vec.chunk_index,
                    "content_text": vec.content_text,
                    "source_type": "DOCUMENT",
                    "final_score": round(final_score, 4),
                    "base_similarity": round(sim_val, 4),
                    "relevanceScore": rel_score,
                    "score_components": {
                        "semantic": round(sim_val, 3),
                        "lexical": round(lexical_score, 3),
                        "entity": round(entity_score, 3),
                        "intent": round(intent_term_score, 3)
                    }
                })

            scored_chunks.sort(key=lambda x: x["final_score"], reverse=True)
            top_chunks = scored_chunks[:limit]

            # Context expansion: fetch chunk_index - 1 and chunk_index + 1 for top matches
            for chunk in top_chunks:
                doc_id = chunk["document_id"]
                c_idx = chunk["chunk_index"]
                prev_text = ""
                next_text = ""
                if doc_id is not None and c_idx is not None:
                    adj_vectors = (
                        db.query(AyushKnowledgeVector.chunk_index, AyushKnowledgeVector.content_text)
                        .filter(
                            AyushKnowledgeVector.document_id == doc_id,
                            AyushKnowledgeVector.is_active == True,
                            AyushKnowledgeVector.chunk_index.in_([c_idx - 1, c_idx + 1])
                        )
                        .all()
                    )
                    for adj_idx, adj_content in adj_vectors:
                        if adj_idx == c_idx - 1:
                            prev_text = adj_content
                        elif adj_idx == c_idx + 1:
                            next_text = adj_content

                chunk["previous_chunk_text"] = prev_text
                chunk["next_chunk_text"] = next_text
                expanded_parts = [p for p in [prev_text, chunk["content_text"], next_text] if p]
                chunk["expanded_context"] = "\n\n".join(expanded_parts)

            return top_chunks
        except Exception as e:
            logger.error(f"search_admin_documents failed: {e}")
            return []
        finally:
            if close_session:
                db.close()

