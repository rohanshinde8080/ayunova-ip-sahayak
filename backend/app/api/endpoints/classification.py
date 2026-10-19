from fastapi import APIRouter
from app.models.schemas import ProductClassificationInput, ProductClassificationResult
from app.services.rag_engine import AyushRAGEngine

router = APIRouter()

@router.post("/classify", response_model=ProductClassificationResult)
async def classify_product(payload: ProductClassificationInput):
    """
    Classify an Ayurvedic formulation into Classical vs Patent & Proprietary vs Cosmetic.
    """
    return AyushRAGEngine.classify_product(payload)
