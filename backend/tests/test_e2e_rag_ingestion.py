import os
import sys

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ingestion_service import IngestionService
from app.services.rag_engine import AyushRAGEngine

def test_end_to_end_rag_grounding():
    print("\n--- Testing End-to-End RAG Ingestion & Copilot Grounding ---")

    test_content = b"""
    MINISTRY OF AYUSH GAZETTE NOTIFICATION S.O. 4501(E) - 2026
    Special Statutory Directive for Nano-curcuminoid Liposomal Formulations.
    
    Section 3(e) Synergism Exemption:
    Any polyherbal or bio-enhanced formulation combining Curcumin with Piperine or phospholipid 
    nanoparticles that demonstrates an in-vivo bioavailability enhancement exceeding 250% shall 
    be deemed to satisfy the synergistic non-obviousness test under Section 3(e) of the Patents Act, 1970.
    
    Rule 158B Fast-Track Licensing:
    Manufacturing licenses under Form 25D for bio-enhanced curcuminoids shall receive priority 
    scrutiny within 30 days upon submission of standardized HPLC fingerprinting data.
    """

    # 1. Ingest Document
    ingest_result = IngestionService.ingest_file(
        filename="gazette_so_4501e_2026.txt",
        content=test_content,
        category="Patents Act",
        authority="Ministry of Ayush & CGPDTM",
        official_act="The Patents Act, 1970 & Gazette S.O. 4501(E)",
        admin_email="officer@ayunova.gov.in"
    )
    doc_id = ingest_result["document_id"]
    print(f"1. Ingested document: {doc_id} with {ingest_result['total_chunks']} chunks.")

    # 2. Query Copilot through AyushRAGEngine
    query = "What is the new 2026 requirement for Curcumin with Piperine phospholipid nanoparticles bioavailability enhancement under Section 3(e)?"
    ai_response = AyushRAGEngine.process_chat_query(query=query)
    
    cited_ids = [s.id for s in ai_response.sources]
    print(f"2. Copilot Query executed. Retrieved {len(ai_response.sources)} citations: {cited_ids}")
    
    # Check if newly ingested chunk is cited
    newly_cited = any(doc_id in cid or "Gazette" in s.title or "Curcumin" in s.title for s, cid in zip(ai_response.sources, cited_ids))
    print(f"3. Was the newly injected gazette cited by the AI Copilot? -> {newly_cited}")
    assert newly_cited, "Newly ingested document was not cited by AI Copilot!"

    # 4. Toggle status to Inactive
    IngestionService.toggle_document_status(doc_id)
    print("4. Toggled document status to Inactive.")

    # 5. Query Copilot again
    ai_response_after = AyushRAGEngine.process_chat_query(query=query)
    cited_after = [s.id for s in ai_response_after.sources]
    still_cited = any(doc_id in cid for cid in cited_after)
    print(f"5. Is the deactivated document excluded from AI Copilot? -> {not still_cited}")
    assert not still_cited, "Deactivated document was still cited by AI Copilot!"

    # 6. Cleanup
    IngestionService.delete_document(doc_id)
    print(f"6. Cleaned up document {doc_id}.")
    print("\n>>> END-TO-END RAG DATA INGESTION PIPELINE VERIFIED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_end_to_end_rag_grounding()
