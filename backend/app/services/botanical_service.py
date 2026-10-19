"""
Botanical Knowledge Service.
Provides dynamic database-driven retrieval of Ayurvedic medicinal plants, classical treatises,
active markers, Section 3(p) status, and synergy partners from Neon PostgreSQL (ayurveda_knowledge).
Completely replaces all hardcoded botanical dictionaries in code.
"""

import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.db_models import AyurvedaKnowledge
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("ayunova.botanical_service")


class BotanicalService:
    DEV_BOTANICAL_MAP = {
        'त्रिफला': 'triphala',
        'अश्वगंधा': 'ashwagandha',
        'हल्दी': 'curcumin',
        'नीम': 'neem',
        'तुलसी': 'tulsi',
        'ब्राह्मी': 'brahmi',
        'गुग्गुलु': 'guggulu',
        'गिलोय': 'giloy',
        'आंवला': 'amla',
        'हरितकी': 'haritaki',
        'बिभीतकी': 'bibhitaki',
        'काली मिर्च': 'piperine',
        'पिप्पली': 'piperine',
        'शतावरी': 'shatavari',
        'मुलेठी': 'licorice',
        'यष्टिमधु': 'licorice',
        'अदरक': 'ginger',
        'सोंठ': 'ginger',
        'शिलाजीत': 'shilajit',
        'अर्जुन': 'arjuna'
    }

    @staticmethod
    def get_botanical_by_name(name: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        """
        Lookup botanical record by common name, botanical name, or Sanskrit name from PostgreSQL.
        """
        if not name or not name.strip():
            return None
            
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            clean_name = name.strip().lower()
            if clean_name in BotanicalService.DEV_BOTANICAL_MAP:
                clean_name = BotanicalService.DEV_BOTANICAL_MAP[clean_name]
            pattern = f"%{clean_name}%"
            record = (
                db.query(AyurvedaKnowledge)
                .filter(
                    AyurvedaKnowledge.is_active == True,
                    (
                        AyurvedaKnowledge.common_name.ilike(pattern) |
                        AyurvedaKnowledge.botanical_name.ilike(pattern) |
                        AyurvedaKnowledge.sanskrit_name.ilike(pattern) |
                        AyurvedaKnowledge.id.ilike(f"%{clean_name}%")
                    )
                )
                .first()
            )
            if record:
                return BotanicalService._to_dict(record)
            return None
        except Exception as e:
            logger.error(f"Error querying botanical by name '{name}': {e}")
            return None
        finally:
            if close_session:
                db.close()

    @staticmethod
    def detect_botanicals_in_query(query: str, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        """
        Identifies any botanical herbs referenced in user query by matching against
        the active PostgreSQL ayurveda_knowledge table.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            all_botanicals = db.query(AyurvedaKnowledge).filter(AyurvedaKnowledge.is_active == True).all()
            matched = []
            lower_q = query.lower()
            expanded_q = lower_q
            for dev_k, en_v in BotanicalService.DEV_BOTANICAL_MAP.items():
                if dev_k in query:
                    expanded_q += f" {en_v.lower()}"

            for b in all_botanicals:
                c_name = b.common_name.lower()
                b_name = b.botanical_name.lower()
                s_name = b.sanskrit_name.lower() if b.sanskrit_name else ""
                
                # Check for word or phrase matches
                tokens = [part.strip() for part in c_name.replace("(", " ").replace(")", " ").replace("/", " ").split() if len(part.strip()) > 3]
                if any(tok in expanded_q for tok in tokens) or b_name in expanded_q or (s_name and s_name in expanded_q) or b.id in expanded_q:
                    matched.append(BotanicalService._to_dict(b))
            return matched
        except Exception as e:
            logger.error(f"Error detecting botanicals in query '{query}': {e}")
            return []
        finally:
            if close_session:
                db.close()

    @staticmethod
    def search_botanicals_by_vector(
        query: str, 
        limit: int = 3, 
        similarity_threshold: float = 0.15,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Semantic vector search over Ayurvedic botanicals using pgvector cosine distance.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            q_emb = EmbeddingService.get_embedding(query)
            results = (
                db.query(
                    AyurvedaKnowledge,
                    (1 - AyurvedaKnowledge.embedding.cosine_distance(q_emb)).label("similarity")
                )
                .filter(AyurvedaKnowledge.is_active == True)
                .order_by(AyurvedaKnowledge.embedding.cosine_distance(q_emb))
                .limit(limit)
                .all()
            )
            matched = []
            for item, sim in results:
                sim_val = round(float(sim), 4) if sim is not None else 0.0
                if sim_val < similarity_threshold:
                    continue
                d = BotanicalService._to_dict(item)
                d["similarity"] = sim_val
                matched.append(d)
            return matched
        except Exception as e:
            logger.error(f"Vector search on botanicals failed: {e}")
            return []
        finally:
            if close_session:
                db.close()

    @staticmethod
    def list_all_botanicals(db: Optional[Session] = None) -> List[Dict[str, Any]]:
        """List all active botanical knowledge records from PostgreSQL."""
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            records = db.query(AyurvedaKnowledge).filter(AyurvedaKnowledge.is_active == True).all()
            return [BotanicalService._to_dict(r) for r in records]
        except Exception as e:
            logger.error(f"Error listing botanicals: {e}")
            return []
        finally:
            if close_session:
                db.close()

    @staticmethod
    def get_botanical_taxonomy(name_or_query: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        """
        Retrieves authoritative botanical classification and taxonomic hierarchy
        from PostgreSQL ayurveda_knowledge.doc_metadata.
        Returns detailed taxonomic ranks: Kingdom, Division, Class, Order, Family, Genus, Species, Binomial Name, Vernacular Names, Morphology, Habit, Official Sources.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            # 1. Try direct name lookup
            herb = BotanicalService.get_botanical_by_name(name_or_query, db=db)
            if not herb:
                # 2. Try detection in natural query text
                detected = BotanicalService.detect_botanicals_in_query(name_or_query, db=db)
                if detected:
                    herb = detected[0]

            if herb:
                doc_meta = herb.get("doc_metadata") or {}
                tax_data = doc_meta.get("taxonomy")
                if tax_data:
                    result = dict(tax_data)
                    result["common_name"] = herb["common_name"]
                    result["botanical_name"] = herb["botanical_name"]
                    result["sanskrit_name"] = herb.get("sanskrit_name", "")
                    result["treatises"] = herb.get("treatises", [])
                    return result

                # In strict source-grounded mode: if doc_metadata lacks verified taxonomy,
                # do NOT fabricate Kingdom/Division/Class/Order/Family. Return None.
                return None

            return None
        except Exception as e:
            logger.error(f"Error retrieving botanical taxonomy for '{name_or_query}': {e}")
            return None
        finally:
            if close_session:
                db.close()

    @staticmethod
    def _to_dict(record: AyurvedaKnowledge) -> Dict[str, Any]:
        return {
            "id": record.id,
            "common_name": record.common_name,
            "botanical_name": record.botanical_name,
            "sanskrit_name": record.sanskrit_name,
            "active_markers": record.active_markers,
            "treatises": record.treatises or [],
            "indications": record.indications,
            "sec3p_status": record.sec3p_status,
            "patentable_avenues": record.patentable_avenues,
            "synergy_partners": record.synergy_partners or [],
            "class": record.category_class,
            "color": record.color_code,
            "doc_metadata": record.doc_metadata or {}
        }
