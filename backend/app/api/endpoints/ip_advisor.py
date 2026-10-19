from fastapi import APIRouter
from app.models.schemas import IPAdvisorInput, IPAdvisorResult
from app.services.rag_engine import AyushRAGEngine

router = APIRouter()

@router.post("/advise", response_model=IPAdvisorResult)
async def advise_ip(payload: IPAdvisorInput):
    """
    Generate multi-track IP protection recommendations (Patent vs TM vs Trade Secret vs GI).
    """
    return AyushRAGEngine.advise_ip(payload)
