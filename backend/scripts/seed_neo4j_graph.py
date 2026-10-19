"""
AYUNOVA Neo4j Knowledge Graph Seeding Script
Initializes the Ayush IP Knowledge Graph with:
1. Canonical Botanical Herbs & Phytochemicals
2. Statutory Acts (Patents Act 1970, DCA 1940, BDA 2002/2023, WIPO GRATK)
3. Statutory Sections & Rules (Section 3(p), Section 3(e), Rule 158B, BDA Form III)
4. Authoritative Classical Treatises (Charaka, Sushruta, Ashtanga Hridaya, AFI, TKDL)
5. Traditional Formulations (Triphala Churna, Chyawanprash, Yogaraj Guggulu)
6. Granted Patent Prior Art (US Patent 11992510)
7. Semantic Relationships (CONTAINS_HERB, DOCUMENTED_IN, BARRED_BY, PART_OF, TRIGGERS_COMPLIANCE)
"""

import os
import sys
import logging

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.neo4j_client import Neo4jClient, check_neo4j_health, init_neo4j_schema
from app.services.graph_extractor import (
    BOTANICAL_HERBS,
    STATUTES_LEXICON,
    SECTIONS_LEXICON,
    TREATISES_LEXICON,
    FORMULATIONS_LEXICON
)
from app.data import OFFICIAL_SOURCES, PRIOR_ART_RECORDS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_neo4j_graph")


def seed_knowledge_graph():
    logger.info("Starting AYUNOVA Neo4j Knowledge Graph Seeding...")

    # 1. Health check
    health = check_neo4j_health()
    if not health.get("connected", False):
        logger.error(f"Cannot seed Neo4j: {health.get('status')} - {health.get('error')}")
        logger.error("Please ensure Neo4j Desktop is running and password is correct in backend/.env")
        return False

    logger.info(f"Connected to Neo4j: {health.get('server_name', 'Neo4j')} {health.get('server_version', '')} on {health.get('uri')}")

    # 2. Schema constraints & indexes
    logger.info("Initializing schema constraints and indexes...")
    schema_res = init_neo4j_schema()
    logger.info(f"Schema initialized: {schema_res.get('constraints_applied', 0)} constraints, {schema_res.get('indexes_applied', 0)} indexes.")

    # 3. Seed Statutes
    logger.info("Seeding Statutory Acts...")
    for stat_name, data in STATUTES_LEXICON.items():
        cypher = """
        MERGE (s:Statute {name: $name})
        ON CREATE SET 
            s.jurisdiction = $jurisdiction,
            s.authority = $authority,
            s.created_at = datetime()
        ON MATCH SET
            s.jurisdiction = $jurisdiction,
            s.authority = $authority
        """
        Neo4jClient.execute_write(cypher, {
            "name": stat_name,
            "jurisdiction": data["jurisdiction"],
            "authority": data["authority"]
        })

    # 4. Seed Sections & link to Statutes
    logger.info("Seeding Statutory Sections & linking to Statutes...")
    for sec_code, data in SECTIONS_LEXICON.items():
        sec_cypher = """
        MERGE (sec:Section {code: $code})
        ON CREATE SET
            sec.title = $title,
            sec.legal_effect = $legal_effect,
            sec.created_at = datetime()
        ON MATCH SET
            sec.title = $title,
            sec.legal_effect = $legal_effect
        WITH sec
        MATCH (s:Statute {name: $statute_name})
        MERGE (sec)-[:PART_OF]->(s)
        """
        Neo4jClient.execute_write(sec_cypher, {
            "code": sec_code,
            "title": data["title"],
            "legal_effect": data["legal_effect"],
            "statute_name": data["statute"]
        })

    # 5. Seed Treatises
    logger.info("Seeding Classical Treatises & TKDL...")
    for tr_name, data in TREATISES_LEXICON.items():
        tr_cypher = """
        MERGE (t:Treatise {name: $name})
        ON CREATE SET
            t.author = $author,
            t.tradition = $tradition,
            t.created_at = datetime()
        ON MATCH SET
            t.author = $author,
            t.tradition = $tradition
        """
        Neo4jClient.execute_write(tr_cypher, {
            "name": tr_name,
            "author": data["author"],
            "tradition": data["tradition"]
        })

    # 6. Seed Botanical Herbs
    logger.info("Seeding Botanical Herbs & linking to Treatises and Compliance...")
    for herb_name, data in BOTANICAL_HERBS.items():
        herb_cypher = """
        MERGE (h:Herb {name: $name})
        ON CREATE SET
            h.botanical_name = $botanical_name,
            h.sanskrit_name = $sanskrit_name,
            h.family = $family,
            h.phytochemicals = $phytochemicals,
            h.created_at = datetime()
        ON MATCH SET
            h.botanical_name = $botanical_name,
            h.sanskrit_name = $sanskrit_name,
            h.family = $family,
            h.phytochemicals = $phytochemicals
        """
        Neo4jClient.execute_write(herb_cypher, {
            "name": data["canonical_name"],
            "botanical_name": data.get("botanical_name", ""),
            "sanskrit_name": data.get("sanskrit_name", ""),
            "family": data.get("family", ""),
            "phytochemicals": data.get("phytochemicals", [])
        })

        # Link Herb -> DOCUMENTED_IN -> Treatise
        for tr in data.get("treatises", []):
            rel_cypher = """
            MATCH (h:Herb {name: $herb_name})
            MATCH (t:Treatise {name: $tr_name})
            MERGE (h)-[r:DOCUMENTED_IN]->(t)
            ON CREATE SET r.source = 'Classical Materia Medica'
            """
            Neo4jClient.execute_write(rel_cypher, {"herb_name": data["canonical_name"], "tr_name": tr})

        # Link Herb -> TRIGGERS_COMPLIANCE -> Section 3 BDA
        bda_rel = """
        MATCH (h:Herb {name: $herb_name})
        MATCH (sec:Section {code: 'Section 3 BDA (Form III)'})
        MERGE (h)-[r:TRIGGERS_COMPLIANCE]->(sec)
        ON CREATE SET r.compliance_rule = 'Commercial use of Indian biological resource requires NBA Form III clearance'
        """
        Neo4jClient.execute_write(bda_rel, {"herb_name": data["canonical_name"]})

    # 7. Seed Classical Formulations & TKDL Monographs
    logger.info("Seeding Classical Formulations from TKDL...")
    for record in PRIOR_ART_RECORDS:
        form_name = record["formulation_name"]
        treatise_text = record["classical_treatise"]
        ref_code = record["reference_code"]
        ingredients = record.get("ingredients", [])

        # Merge formulation
        form_cypher = """
        MERGE (f:Formulation {name: $name})
        ON CREATE SET
            f.tkdl_code = $ref_code,
            f.treatise_citation = $treatise_text,
            f.status = $status,
            f.created_at = datetime()
        ON MATCH SET
            f.tkdl_code = $ref_code,
            f.treatise_citation = $treatise_text
        """
        Neo4jClient.execute_write(form_cypher, {
            "name": form_name,
            "ref_code": ref_code,
            "treatise_text": treatise_text,
            "status": record.get("tkdl_status", "Protected Prior Art")
        })

        # Link Formulation -> BARRED_BY -> Section 3(p)
        bar_cypher = """
        MATCH (f:Formulation {name: $name})
        MATCH (sec:Section {code: 'Section 3(p)'})
        MERGE (f)-[r:BARRED_BY]->(sec)
        ON CREATE SET r.legal_ground = 'Traditional Knowledge exclusion under Patents Act 1970'
        """
        Neo4jClient.execute_write(bar_cypher, {"name": form_name})

        # Link Formulation -> BARRED_BY -> Section 3(e)
        bar_3e = """
        MATCH (f:Formulation {name: $name})
        MATCH (sec:Section {code: 'Section 3(e)'})
        MERGE (f)-[r:BARRED_BY]->(sec)
        ON CREATE SET r.legal_ground = 'Mere aggregation of herbal properties barred unless synergism is experimentally proven'
        """
        Neo4jClient.execute_write(bar_3e, {"name": form_name})

        # Link Formulation -> DOCUMENTED_IN -> Treatises mentioned
        for tr_candidate in ["Charaka Samhita", "Sushruta Samhita", "Bhavaprakasha Nighantu", "Bhaishajya Ratnavali", "TKDL Database"]:
            if tr_candidate.lower() in treatise_text.lower():
                tr_rel = """
                MATCH (f:Formulation {name: $name})
                MATCH (t:Treatise {name: $tr_name})
                MERGE (f)-[r:DOCUMENTED_IN]->(t)
                ON CREATE SET r.tkdl_ref = $ref_code
                """
                Neo4jClient.execute_write(tr_rel, {"name": form_name, "tr_name": tr_candidate, "ref_code": ref_code})

        # Link Formulation -> CONTAINS_HERB
        for ingr in ingredients:
            for canonical_herb in BOTANICAL_HERBS.keys():
                if canonical_herb.lower() in ingr.lower():
                    ingr_rel = """
                    MATCH (f:Formulation {name: $name})
                    MATCH (h:Herb {name: $herb_name})
                    MERGE (f)-[:CONTAINS_HERB]->(h)
                    """
                    Neo4jClient.execute_write(ingr_rel, {"name": form_name, "herb_name": canonical_herb})

    # 8. Seed Key Patent Reference (US Patent 11992510)
    logger.info("Seeding US Patent 11992510 prior art reference...")
    pat_cypher = """
    MERGE (p:Patent {number: 'US 11992510'})
    ON CREATE SET
        p.title = 'Compositions comprising Triphala and Bacillus coagulans and methods of use thereof',
        p.country = 'USA',
        p.jurisdiction = 'USPTO',
        p.priority_date = '2020-04-14',
        p.grant_date = '2024-05-28',
        p.created_at = datetime()
    WITH p
    MATCH (f:Formulation {name: 'Triphala Churna'})
    MERGE (p)-[r:CLAIMS_OR_CITES]->(f)
    ON CREATE SET r.context = 'Synergistic formulation combining classical Triphala with probiotic strains'
    """
    Neo4jClient.execute_write(pat_cypher)

    # 9. Verify Graph Seeding Summary
    nodes_cnt = Neo4jClient.execute_read("MATCH (n) RETURN count(n) AS cnt")[0]["cnt"]
    rels_cnt = Neo4jClient.execute_read("MATCH ()-[r]->() RETURN count(r) AS cnt")[0]["cnt"]

    logger.info(f"AYUNOVA Knowledge Graph Seeding COMPLETED successfully!")
    logger.info(f"Total Nodes in Neo4j: {nodes_cnt}")
    logger.info(f"Total Relationships in Neo4j: {rels_cnt}")

    return True


if __name__ == "__main__":
    success = seed_knowledge_graph()
    if not success:
        sys.exit(1)
