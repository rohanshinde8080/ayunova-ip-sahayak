"""
Phase 2 Test Suite: Knowledge Graph Ingestion & Entity-Relation Extraction
Validates:
1. GraphExtractorService correctly detects canonical botanical herbs, statutes, sections, treatises, formulations, and patent IDs.
2. GraphExtractorService generates semantic graph relationship specifications (edges).
3. GraphService safely handles graph stats and multi-hop subgraph extraction.
4. IngestionService dual-persistence: includes graph_sync in returns and executes cleanly.
"""

import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.graph_extractor import GraphExtractorService
from app.services.graph_service import GraphService
from app.services.ingestion_service import IngestionService


def test_entity_extraction_botanicals_and_statutes():
    """Verify botanical herbs, statutes, and patent numbers are extracted from complex legal text."""
    sample_text = (
        "Under Section 3(p) of The Patents Act, 1970, an application claiming a synergistic "
        "formulation of Ashwagandha (Withania somnifera) and Curcumin (Curcuma longa) is barred "
        "as traditional knowledge documented in Charaka Samhita. Sourcing from India triggers "
        "mandatory National Biodiversity Authority approval under Biological Diversity Act. "
        "Compare with US Patent 11992510."
    )

    entities = GraphExtractorService.extract_entities(sample_text)

    # Check Herbs
    herb_names = [h["canonical_name"] for h in entities["herbs"]]
    assert "Ashwagandha" in herb_names
    assert "Curcumin" in herb_names

    # Check Statutes
    statute_names = [s["name"] for s in entities["statutes"]]
    assert any("Patents Act" in s for s in statute_names)
    assert any("Biological Diversity" in s for s in statute_names)

    # Check Sections
    section_codes = [sec["code"] for sec in entities["sections"]]
    assert "Section 3(p)" in section_codes

    # Check Treatises
    treatise_names = [t["name"] for t in entities["treatises"]]
    assert "Charaka Samhita" in treatise_names

    # Check Patent numbers
    pat_nums = [p["number"] for p in entities["patents"]]
    assert "US 11992510" in pat_nums


def test_relationship_derivation():
    """Verify semantic edges are correctly constructed between chunks, herbs, treatises, and sections."""
    sample_text = (
        "Triphala Churna containing Haritaki and Amalaki is documented in Charaka Samhita "
        "and is excluded from direct patents under Section 3(p)."
    )

    relations = GraphExtractorService.extract_relations(
        doc_id="doc-test-1",
        chunk_id="doc-test-1-chk-0",
        text=sample_text
    )

    assert len(relations) > 0
    rel_types = [r["rel_type"] for r in relations]
    
    # Must have chunk mentions
    assert "MENTIONS_HERB" in rel_types or "MENTIONS_TREATISE" in rel_types
    # Must establish traditional knowledge / treatise / compliance links
    assert any(r["rel_type"] in ["DOCUMENTED_IN", "TRIGGERS_COMPLIANCE", "BARRED_BY", "CONTAINS_HERB"] for r in relations)


def test_graph_service_stats_and_subgraph_safety():
    """Verify GraphService stats and subgraph query execute safely without throwing unhandled exceptions."""
    stats = GraphService.get_graph_stats()
    assert isinstance(stats, dict)
    assert "connected" in stats
    assert "status" in stats
    assert "total_nodes" in stats
    assert "total_relationships" in stats

    subgraph = GraphService.get_subgraph_for_entities(["Ashwagandha", "Triphala"])
    assert isinstance(subgraph, dict)
    assert "nodes" in subgraph
    assert "edges" in subgraph
    assert "triples" in subgraph


def test_dual_persistence_manual_entry():
    """Verify IngestionService.ingest_manual_entry synchronizes to both Postgres and graph layer."""
    result = IngestionService.ingest_manual_entry(
        title="Test Statutory Provision for Ashwagandha",
        authority="Indian Patent Office (IPO)",
        official_act="The Patents Act, 1970",
        section="Section 3(p)",
        content_text="Novel extraction methods for Ashwagandha are evaluated against Traditional Knowledge bars.",
        jurisdiction="India",
        category="Patents Act",
        admin_email="tester@ipsakti.ai"
    )

    assert result["success"] is True
    assert "document_id" in result
    assert "graph_sync" in result
    doc_id = result["document_id"]

    # Test toggle and delete dual-persistence safely
    toggle_res = IngestionService.toggle_document_status(doc_id)
    assert toggle_res["success"] is True

    delete_res = IngestionService.delete_document(doc_id)
    assert delete_res["success"] is True
