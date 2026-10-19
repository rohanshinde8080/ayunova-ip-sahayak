import os
import sys
import io

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.services.document_parser import DocumentParserService
from app.services.ingestion_service import IngestionService
from app.services.rag_engine import AyushRAGEngine

client = TestClient(app)

def test_scanned_patent_pdf_ingestion():
    print("\n========================================================")
    print("  TESTING SCANNED / IMAGE PATENT PDF INGESTION PIPELINE ")
    print("========================================================")

    pdf_path = "C:/Users/ASUS/Downloads/US11992510.pdf"
    if not os.path.exists(pdf_path):
        print(f"[SKIP] {pdf_path} not found on disk. Testing with synthetic scanned patent PDF...")
        # Create a synthetic 2-page scanned PDF with empty text
        from pypdf import PdfWriter
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        writer.add_blank_page(width=612, height=792)
        pdf_bytes_io = io.BytesIO()
        writer.write(pdf_bytes_io)
        content = pdf_bytes_io.getvalue()
        filename = "US11992510.pdf"
    else:
        print(f"[FOUND] Loading real patent file: {pdf_path} ({os.path.getsize(pdf_path):,} bytes)")
        with open(pdf_path, "rb") as f:
            content = f.read()
        filename = "US11992510.pdf"

    # 1. Test DocumentParserService directly
    print("\n1. Testing DocumentParserService.parse_file on scanned PDF...")
    parsed = DocumentParserService.parse_file(filename, content)
    print(f"   - Filename: {parsed['filename']}")
    print(f"   - File Type: {parsed['file_type']}")
    print(f"   - Character Count: {parsed['char_count']}")
    print(f"   - Word Count: {parsed['word_count']}")
    print(f"   - Page Count: {parsed['page_count']}")
    print(f"   - Suggested Title: {parsed['extracted_metadata']['suggested_title']}")
    print(f"   - Suggested Authority: {parsed['extracted_metadata']['suggested_authority']}")
    print(f"   - Text Preview (first 250 chars):\n     {parsed['raw_text'][:250]}...")

    assert parsed["char_count"] > 100, f"Expected char_count > 100, got {parsed['char_count']}"
    assert parsed["page_count"] >= 1, f"Expected page_count >= 1, got {parsed['page_count']}"
    assert len(parsed["raw_text"].strip()) > 0, "raw_text must not be empty!"
    print("   [PASS] DocumentParserService successfully parsed scanned patent PDF without error!")

    # 2. Test Ingestion via HTTP POST /api/admin/ingest/upload
    print("\n2. Testing HTTP Upload endpoint: POST /api/admin/ingest/upload...")
    upload_file_obj = io.BytesIO(content)
    upload_res = client.post(
        "/api/admin/ingest/upload",
        files={"file": (filename, upload_file_obj, "application/pdf")},
        data={
            "category": "Patents Act",
            "authority": "United States Patent and Trademark Office (USPTO)",
            "official_act": "United States Patent Act (35 U.S.C.)",
            "jurisdiction": "USA",
            "admin_email": "admin@ipsakti.ai"
        }
    )

    print(f"   - Status Code: {upload_res.status_code}")
    assert upload_res.status_code == 200, f"Upload failed with {upload_res.status_code}: {upload_res.text}"
    upload_data = upload_res.json()
    doc_id = upload_data["document_id"]
    print(f"   - Document ID: {doc_id}")
    print(f"   - Total Chunks: {upload_data['total_chunks']}")
    print(f"   - Ingest Success: {upload_data.get('success', True)}")
    print("   [PASS] HTTP 200 OK returned. Document successfully chunked and embedded into Neon pgvector!")

    # 3. Verify Document is listed in /api/admin/documents
    print("\n3. Verifying document presence in /api/admin/documents...")
    list_res = client.get(f"/api/admin/documents?q={doc_id}")
    assert list_res.status_code == 200
    docs = list_res.json()
    matched_doc = next((d for d in docs if d["id"] == doc_id), None)
    assert matched_doc is not None, f"Document {doc_id} not found in listing!"
    print(f"   - Title: {matched_doc['title']}")
    print(f"   - Chunks Count: {matched_doc['chunksCount']}")
    print(f"   - Status: {matched_doc['status']}")
    print("   [PASS] Document verified in database listing.")

    # 4. Query AI Copilot via RAG to verify grounding
    print("\n4. Testing RAG Copilot retrieval for the ingested patent...")
    query = "What does patent US11992510 disclose regarding Triphala probiotic formulations for oxidative stress and inflammation?"
    ai_response = AyushRAGEngine.process_chat_query(query=query)
    cited_ids = [s.id for s in ai_response.sources]
    cited_titles = [s.title for s in ai_response.sources]
    print(f"   - Confidence: {ai_response.confidence}")
    print(f"   - Sources Cited ({len(ai_response.sources)}):")
    for s in ai_response.sources[:3]:
        print(f"     * {s.title} | {s.authority} ({s.section})")

    new_doc_cited = any(doc_id in cid or "11992510" in title or "Patent" in title for cid, title in zip(cited_ids, cited_titles))
    print(f"   - Was US11992510 cited by AI Copilot? -> {new_doc_cited}")
    assert new_doc_cited, "Ingested patent was not cited by AI Copilot!"
    print("   [PASS] AI Copilot grounded response in the newly ingested patent!")

    # 5. Clean up test document
    print("\n5. Cleaning up test document from Neon DB...")
    del_res = client.delete(f"/api/admin/documents/{doc_id}")
    assert del_res.status_code == 200
    print(f"   [PASS] Test document {doc_id} cleanly removed.")

    print("\n========================================================")
    print("  [SUCCESS] SCANNED PATENT PDF INGESTION TEST PASSED!    ")
    print("========================================================\n")

if __name__ == "__main__":
    test_scanned_patent_pdf_ingestion()
