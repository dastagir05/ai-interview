from fastapi import APIRouter, UploadFile

router = APIRouter()

@router.post("/stt")
async def transcribe_audio(file: UploadFile):
    # placeholder STT
    return {"text": "placeholder", "confidence": 1.0}
