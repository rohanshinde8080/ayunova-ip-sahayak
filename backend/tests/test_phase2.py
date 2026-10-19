import os
import sys

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ingestion_service import IngestionService
from app.services.vector_service import VectorService
from app.services.reindex_service import ReindexService

def test_file_ingestion_and_search():
    print("\n--- Running Multi-Chunk Ingestion Test ---")
    content = b"""
THE PATENTS (AMENDMENT) GUIDELINES FOR AYUSH 2026
Ministry of Ayush & Indian Patent Office

Section 3(p) Guidelines:
Where a patent application claims a synergistic combination of classical herbal ingredients, 
the applicant must submit comparative experimental data showing unexpected therapeutic activity.

Rule 158B Requirements:
Any patent and proprietary medicine derived from classical textual references must provide 
standardized chromatographic fingerprinting (HPTLC/HPLC) and acute toxicity testing data.

National Biodiversity Authority Clearances:
Section 6 Form III mandatory approval must be obtained prior to the grant of the patent.
"""

    res = IngestionService.ingest_file(
        filename="ayush_guidelines_2026.txt",
        content=content,
        category="Patents Act",
        authority="Indian Patent Office & Ministry of Ayush",
        official_act="Patents Act 1970",
        admin_email="admin@ipsakti.ai"
    )
    doc_id = res["document_id"]
    print(f"Ingested Doc ID: {doc_id} with {res['total_chunks']} chunks.")

    # 1. Verify chunks
    chunks = VectorService.get_document_chunks(doc_id)
    print(f"Retrieved {len(chunks)} chunks from Neon Postgres.")
    assert len(chunks) > 0, "No chunks found!"

    # 2. Vector search
    search_query = "chromatographic fingerprinting HPTLC Rule 158B"
    matches = VectorService.search_knowledge_base(search_query, limit=3)
    print(f"Vector search for '{search_query}' returned {len(matches)} matches.")
    assert len(matches) > 0, "Vector search failed to match!"
    top = matches[0]
    print(f"Top Match: {top['title']} (similarity: {top['similarity']})")

    # 3. Test Reindex service
    print("\n--- Testing Reindex Service ---")
    reindex_res = ReindexService.reindex_all(admin_email="admin@ipsakti.ai")
    print(f"Re-indexed {reindex_res['total_items']} items in {reindex_res['duration_seconds']}s.")
    assert reindex_res["success"] is True, "Reindex service failed!"

    # 4. Cleanup
    del_res = IngestionService.delete_document(doc_id, admin_email="admin@ipsakti.ai")
    print(f"Cleaned up test document: {del_res['deleted_title']}")
    print("\n>>> ALL PHASE 2 TESTS PASSED! <<<")

if __name__ == "__main__":
    test_file_ingestion_and_search()
