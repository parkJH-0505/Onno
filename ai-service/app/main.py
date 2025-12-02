from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.services.stt import transcribe_audio
from app.services.question_generator import generate_questions
from app.services.mock_data import mock_transcribe_audio, mock_generate_questions
import logging
import os
from dotenv import load_dotenv

load_dotenv()

# Mock 모드 설정
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

app = FastAPI(title="Onno AI Service", version="0.1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class QuestionRequest(BaseModel):
    transcript: str


@app.get("/health")
async def health():
    """서비스 Health Check"""
    return {
        "status": "ok",
        "service": "onno-ai",
        "mock_mode": MOCK_MODE
    }


@app.post("/api/stt/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """
    음성 파일을 받아 텍스트로 전사
    """
    try:
        logger.info(f"Transcribing audio: {audio.filename} (Mock: {MOCK_MODE})")

        if MOCK_MODE:
            result = await mock_transcribe_audio(audio.file)
            logger.info(f"[MOCK] Transcription complete: {result['latency']:.2f}s")
        else:
            result = await transcribe_audio(audio.file)
            logger.info(f"Transcription complete: {result['latency']:.2f}s")

        return result

    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/questions/generate")
async def generate_questions_endpoint(request: QuestionRequest):
    """
    대화 전사를 받아 AI 질문 생성
    """
    try:
        logger.info(f"Generating questions for transcript length: {len(request.transcript)} (Mock: {MOCK_MODE})")

        if MOCK_MODE:
            result = await mock_generate_questions(request.transcript)
            logger.info(f"[MOCK] Generated {len(result['questions'])} questions")
        else:
            result = await generate_questions(request.transcript)
            logger.info(f"Generated {len(result['questions'])} questions")

        return result

    except Exception as e:
        logger.error(f"Question generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
