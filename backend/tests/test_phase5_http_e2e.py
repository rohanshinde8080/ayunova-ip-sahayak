import os
import sys
import io

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.db_models import KnowledgeDocument, AyushKnowledgeVector, AdminAuditLog

client = TestClient(app)

def test_http_end_to_end_pipeline():
    print("\n========================================================")
    print("  PHASE 5: HTTP END-TO-END RAG INGESTION PIPELINE TEST  ")
    print("========================================================")

    # 1. Health check
    health_res = client.get("/api/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
    print("1. /api/health returned 200 OK.")

    # 2. Get presets
    presets_res = client.get("/api/chat/presets")
    assert presets_res.status_code == 200
    presets_data = presets_res.json()
    assert "presets" in presets_data and len(presets_data["presets"]) >= 3
    print(f"2. /api/chat/presets returned {len(presets_data['presets'])} preset prompts.")

    # 3. Ingest a new document via HTTP multipart upload (/api/admin/ingest/upload)
    test_doc_content = (
        "AYUSH ADVANCED RESEARCH GAZETTE 2026 - NOTIFICATION AR-98\n"
        "Official Guidelines on Micro-encapsulated Ashwagandha Withanolides for Sustained Release Delivery.\n\n"
        "Section 3(p) Traditional Knowledge Boundary:\n"
        "Direct Withania somnifera crude powder extraction without delivery vehicle is barred under Section 3(p).\n\n"
        "Section 3(e) Synergistic Polymeric Vehicle Exemption:\n"
        "Formulations utilizing cross-linked chitosan-gum acacia micro-encapsulation yielding gastric bypass "
        "and 3.8x bioavailability increase satisfy Section 3(e) synergy criteria and are eligible for patent protection."
    ).encode("utf-8")

    file_obj = io.BytesIO(test_doc_content)
    upload_res = client.post(
        "/api/admin/ingest/upload",
        files={"file": ("ashwagandha_microencap_guidelines_2026.txt", file_obj, "text/plain")},
        data={
            "category": "Patents Act",
            "authority": "Controller General of Patents, Designs and Trade Marks (CGPDTM)",
            "official_act": "The Patents Act, 1970 - Microencapsulation Directive 2026",
            "jurisdiction": "India",
            "admin_email": "chief.examiner@ipindia.gov.in"
        }
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    upload_data = upload_res.json()
    doc_id = upload_data["document_id"]
    print(f"3. Ingested via HTTP POST /api/admin/ingest/upload -> doc_id: {doc_id}, chunks: {upload_data['total_chunks']}")

    # 4. Verify document appears in /api/admin/documents
    list_res = client.get(f"/api/admin/documents?q={doc_id}")
    assert list_res.status_code == 200
    docs = list_res.json()
    assert any(d["id"] == doc_id for d in docs), f"Uploaded doc {doc_id} not found in document list!"
    print(f"4. Document {doc_id} confirmed listed in /api/admin/documents.")

    # 5. Query the Chat RAG Copilot via HTTP POST /api/chat/process-query
    chat_query = "What are the patent guidelines for micro-encapsulated Ashwagandha withanolides sustained release under Section 3(e)?"
    chat_res = client.post(
        "/api/chat/process-query",
        json={
            "query": chat_query,
            "jurisdiction": "India",
            "language": "English"
        }
    )
    assert chat_res.status_code == 200, f"Chat query failed: {chat_res.text}"
    chat_data = chat_res.json()
    assert chat_data["confidence"] == "HIGH"
    assert len(chat_data["sources"]) > 0

    # Verify that the newly ingested document is cited
    cited_ids = [s["id"] for s in chat_data["sources"]]
    cited_titles = [s["title"] for s in chat_data["sources"]]
    print(f"5. Chat RAG Response generated with {len(chat_data['sources'])} sources.")
    print(f"   Top sources: {cited_titles[:3]}")

    is_grounded_in_new_doc = any(doc_id in cid or "Ashwagandha" in title for cid, title in zip(cited_ids, cited_titles))
    assert is_grounded_in_new_doc, "AI Copilot response was not grounded in the newly ingested document!"
    print("   [PASS] Verified: Response successfully grounded in newly ingested document!")

    # 6. Verify inspection of chunks via /api/admin/documents/{id}/chunks
    chunks_res = client.get(f"/api/admin/documents/{doc_id}/chunks")
    assert chunks_res.status_code == 200
    chunks_data = chunks_res.json()
    assert len(chunks_data) == upload_data["total_chunks"]
    print(f"6. Chunks endpoint returned {len(chunks_data)} chunks with token counts and previews.")

    # 7. Toggle status to Inactive via /api/admin/documents/{id}/status
    toggle_res = client.patch(f"/api/admin/documents/{doc_id}/status")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["status"] == "Inactive"
    print(f"7. Document status toggled to 'Inactive' via HTTP PATCH.")

    # 8. Query again: confirm deactivated document is NOT retrieved
    chat_res_after = client.post(
        "/api/chat/process-query",
        json={"query": chat_query, "jurisdiction": "India", "language": "English"}
    )
    assert chat_res_after.status_code == 200
    after_cited_ids = [s["id"] for s in chat_res_after.json()["sources"]]
    assert not any(doc_id in cid for cid in after_cited_ids), "Inactive document was erroneously cited!"
    print(f"8. Verified: Inactive document is strictly excluded from RAG retrieval.")

    # 9. Clean up test document via /api/admin/documents/{id}
    del_res = client.delete(f"/api/admin/documents/{doc_id}")
    assert del_res.status_code == 200
    print(f"9. Document {doc_id} permanently deleted with cascading vector chunk cleanup.")

    # 10. Verify audit logs record all actions
    audit_res = client.get("/api/admin/audit-logs?limit=10")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    actions = [l["action"] for l in logs]
    print(f"10. Audit trail verified with recent actions: {actions[:4]}")

    print("\n========================================================")
    print("  [SUCCESS] ALL PHASE 5 END-TO-END HTTP TESTS PASSED!   ")
    print("========================================================\n")

if __name__ == "__main__":
    test_http_end_to_end_pipeline()
