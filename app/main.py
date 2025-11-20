from fastapi import FastAPI
from app.routes.stt_routes import router as stt_router
from app.routes.tts_routes import router as tts_router
from app.routes.interview_routes import router as interview_router
import uvicorn
import speech_recognition as sr
import pyttsx3

app = FastAPI()

app.include_router(stt_router)
app.include_router(tts_router)
app.include_router(interview_router)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/stt")
def stt():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        audio = recognizer.listen(source)
    text = recognizer.recognize_google(audio)
    return {"text": text}

@app.post("/tts")
def tts(text: str):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()
    return {"message": "TTS completed"}
    
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8081, reload=True)