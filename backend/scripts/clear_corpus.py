import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.db_models import KnowledgeDocument, AyushKnowledgeVector
from app.services.ingestion_service import IngestionService

def clear_all_corpus_data():
    db = SessionLocal()
    try:
        docs = db.query(KnowledgeDocument).all()
        print(f"Total documents found: {len(docs)}")
        
        deleted_count = 0
        for doc in docs:
            doc_id = doc.id
            doc_title = doc.title
            print(f"Deleting [{doc_id}] - {doc_title}...")
            IngestionService.delete_document(doc_id, admin_email="admin@ayunova.gov.in", db=db)
            deleted_count += 1
            
        remaining_docs = db.query(KnowledgeDocument).count()
        remaining_vecs = db.query(AyushKnowledgeVector).count()
        
        print("\n--- Deletion Summary ---")
        print(f"Successfully deleted {deleted_count} documents.")
        print(f"Remaining KnowledgeDocument records: {remaining_docs}")
        print(f"Remaining AyushKnowledgeVector chunks: {remaining_vecs}")
        print("Database is now clean and ready for your new dataset!")
    except Exception as e:
        print(f"Error during deletion: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_corpus_data()
