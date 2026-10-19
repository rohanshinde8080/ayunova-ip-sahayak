import os
import sys
import io

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_api_endpoints():
    print("\n--- Testing Phase 3 Admin REST APIs ---")

    # 1. Test GET /api/admin/metrics
    res = client.get("/api/admin/metrics")
    assert res.status_code == 200, f"Metrics failed: {res.text}"
    metrics = res.json()
    print("1. Metrics API:", metrics["systemStatus"], "| Docs:", metrics["totalDocuments"], "| Chunks:", metrics["totalChunks"])
    assert metrics["databaseConnected"] is True

    # 2. Test GET /api/admin/documents
    res = client.get("/api/admin/documents")
    assert res.status_code == 200, f"List documents failed: {res.text}"
    docs = res.json()
    print("2. List Documents API: Found", len(docs), "documents.")
    assert len(docs) >= 6

    # 3. Test POST /api/admin/ingest/manual
    manual_payload = {
        "title": "API Test Manual Statute 2026",
        "authority": "Ministry of Ayush",
        "officialAct": "Patents Act, 1970",
        "section": "Section 3(p) Amendment",
        "jurisdiction": "India",
        "category": "Patents Act",
        "contentText": "Novel polyherbal formulations with synergistic bioavailability enhancement are patentable if backed by pharmacokinetic trial data.",
        "adminEmail": "admin_test@ipsakti.ai"
    }
    res = client.post("/api/admin/ingest/manual", json=manual_payload)
    assert res.status_code == 200, f"Manual ingest failed: {res.text}"
    manual_res = res.json()
    manual_doc_id = manual_res["document_id"]
    print("3. Manual Ingest API: Created Doc ID:", manual_doc_id)

    # 4. Test GET /api/admin/documents/{doc_id}
    res = client.get(f"/api/admin/documents/{manual_doc_id}")
    assert res.status_code == 200, f"Get document details failed: {res.text}"
    detail = res.json()
    print("4. Document Details API: Chunks found:", len(detail["chunks"]))
    assert len(detail["chunks"]) == 1

    # 5. Test PATCH /api/admin/documents/{doc_id}/status
    res = client.patch(f"/api/admin/documents/{manual_doc_id}/status")
    assert res.status_code == 200, f"Status toggle failed: {res.text}"
    toggle_res = res.json()
    print("5. Toggle Status API: New status is:", toggle_res["status"], "| is_active:", toggle_res["is_active"])
    assert toggle_res["status"] == "Inactive"
    assert toggle_res["is_active"] is False

    # 6. Test POST /api/admin/ingest/upload (multipart)
    file_content = b"""
    MINISTRY OF AYUSH NOTIFICATION 2026
    Guideline 12 on Synergistic Ayush Formulations.
    Evidence of synergistic interaction must be provided using the Chou-Talalay combination index method.
    """
    files = {"file": ("ayush_synergy_notice.txt", io.BytesIO(file_content), "text/plain")}
    data = {
        "category": "Patents Act",
        "authority": "Ministry of Ayush & AIIA",
        "official_act": "Ayush Guidelines 2026",
        "jurisdiction": "India",
        "admin_email": "admin_upload@ipsakti.ai"
    }
    res = client.post("/api/admin/ingest/upload", data=data, files=files)
    assert res.status_code == 200, f"Upload ingest failed: {res.text}"
    upload_res = res.json()
    uploaded_doc_id = upload_res["document_id"]
    print("6. Upload File API: Created Doc ID:", uploaded_doc_id, "| Chunks:", upload_res["total_chunks"])

    # 7. Test GET /api/admin/audit-logs
    res = client.get("/api/admin/audit-logs")
    assert res.status_code == 200, f"Audit logs failed: {res.text}"
    logs = res.json()
    print("7. Audit Logs API: Retrieved", len(logs), "audit log entries.")
    assert len(logs) >= 3

    # 8. Clean up test documents
    client.delete(f"/api/admin/documents/{manual_doc_id}")
    client.delete(f"/api/admin/documents/{uploaded_doc_id}")
    print("8. Cleanup: Test documents successfully deleted.")

    print("\n>>> ALL PHASE 3 API TESTS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_admin_api_endpoints()
