from fastapi import APIRouter
from app.schemas.tts_schema import TTSRequest

router = APIRouter()

@router.post("/tts")
async def text_to_speech(payload: TTSRequest):
    # placeholder TTS
    return {"audio_base64": "placeholder"}
