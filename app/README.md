cat > AI-SERVICE-README.md <<'EOF'

# AI Service (STT + TTS) — plan

## Purpose

This microservice will run speech-to-text (Whisper) and text-to-speech (Coqui or pyttsx3 fallback) and provide endpoints for the Next.js frontend:

- `/stt` → upload/stream audio → returns transcription
- `/tts` → send text → returns audio (base64 or file stream)
- `/interview` → evaluate candidate text → returns feedback + audio

## Location

Folder: `/ai-service`

## Run (dev)

- Python + FastAPI + uvicorn
- Dev port: `8000` (example)

## Models

- Models will be stored in `/ai-service/models`
- Do **not** commit model binaries to git. Use Git LFS or mount models in CI/CD.

## Env vars (create `.env` in /ai-service)

- `AI_SERVICE_HOST=0.0.0.0`
- `AI_SERVICE_PORT=8000`
- `WHISPER_MODEL=whisper-base` # or path to local model
- `TTS_VOICE=default` # coqui voice name or local voice
- `TEMP_AUDIO_DIR=/tmp/ai_service_audio`
- `MAX_AUDIO_SECONDS=120`

## API contract (high-level)

- `POST /stt` — multipart/form-data: `file` or base64 chunk → `{ text, confidence }`
- `POST /tts` — json `{ text, voice? }` → `{ audio_base64 }` or audio stream
- `POST /interview` — json `{ questionId, candidateText, meta? }` → `{ feedbackText, score, audio_base64? }`

## Dev notes

- Keep audio format 16kHz mono WAV for consistency.
- Fallback: if Coqui TTS fails, frontend uses browser speechSynthesis or pyttsx3.
- Use `ngrok` or `localtunnel` for cross-machine testing.

## Testing

- Add curl examples in `/ai-service/TESTING.md`
- Add simple health endpoint: `GET /health` returns 200.

## Large files

- Use Git LFS for model files:
  - `git lfs install`
  - `git lfs track "ai-service/models/**"`
  - commit `.gitattributes`

EOF
