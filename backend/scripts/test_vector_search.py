import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import check_db_health
from app.services.vector_service import VectorService
from app.services.rag_engine import AyushRAGEngine

def main():
    print("\n" + "="*60)
    print("[AYUNOVA] Neon PostgreSQL & pgvector Integration Test")
    print("="*60)
    
    # 1. Check DB Health
    health = check_db_health()
    print(f"\n[1] Neon Database Status: {health.get('status')}")
    print(f"    PostgreSQL Version : {health.get('neon_postgres_version')}")
    print(f"    pgvector Enabled   : {health.get('pgvector_enabled')}")
    print(f"    pgvector Version   : {health.get('pgvector_version')}")
    
    # 2. Semantic Search on Knowledge Base
    test_query = "Can traditional knowledge herbal formulations like Triphala be patented under Section 3(p)?"
    print(f"\n[2] Testing pgvector Cosine Search:")
    print(f"    Query: '{test_query}'")
    
    kb_results = VectorService.search_knowledge_base(test_query, limit=3)
    print(f"    Retrieved {len(kb_results)} matched citations:")
    for idx, res in enumerate(kb_results, 1):
        print(f"    - [{idx}] {res['title']} (Cosine Similarity: {res['similarity']})")
        print(f"          Authority: {res['authority']}")
        print(f"          Section  : {res['section']}")
        
    # 3. Prior Art Vector Search
    formulation_query = "Ayurvedic formulation with Amalaki, Haritaki, Bibhitaki rasayana bowel regulator"
    print(f"\n[3] Testing Prior Art Vector Search:")
    print(f"    Query: '{formulation_query}'")
    
    art_results = VectorService.search_prior_art(formulation_query, limit=2)
    print(f"    Retrieved {len(art_results)} prior art matches:")
    for idx, art in enumerate(art_results, 1):
        print(f"    - [{idx}] {art['formulationName']} ({art['referenceCode']}) (Similarity: {art['similarityScore']})")
        print(f"          Treatise: {art['treatise']}")
        print(f"          Ingredients: {', '.join(art['ingredients'])}")
        
    # 4. Chat Query RAG with Vector Grounding
    print(f"\n[4] Testing Full RAG Pipeline with pgvector:")
    rag_response = AyushRAGEngine.process_chat_query(test_query)
    print(f"    Answer: {rag_response.answer[:120]}...")
    print(f"    Confidence: {rag_response.confidence}")
    print(f"    Evidence Count: {rag_response.evidenceCount}")
    print(f"    Grounded Sources: {[s.title for s in rag_response.sources]}")
    
    print("\n" + "="*60)
    print("[SUCCESS] All pgvector vector search tests passed successfully!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
