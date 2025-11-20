from fastapi import APIRouter
from app.schemas.interview_schema import InterviewRequest

router = APIRouter()

@router.post("/interview")
async def evaluate_interview_answer(payload: InterviewRequest):
    return {
        "feedbackText": "placeholder feedback",
        "score": 0,
        "audio_base64": None
    }
