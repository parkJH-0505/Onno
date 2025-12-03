from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from app.services.stt import transcribe_audio
from app.services.question_generator import generate_questions, generate_questions_with_context
from app.services.mock_data import mock_transcribe_audio, mock_generate_questions
import logging
import os
from dotenv import load_dotenv

load_dotenv()

# Mock 모드 설정
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

app = FastAPI(title="Onno AI Service", version="0.2.0")

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


class ContextAwareQuestionRequest(BaseModel):
    transcript: str
    previous_transcripts: Optional[List[str]] = None


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
        logger.info(f"Transcribing audio: {audio.filename}, size: {audio.size} (Mock: {MOCK_MODE})")

        if MOCK_MODE:
            result = await mock_transcribe_audio(audio.file)
            logger.info(f"[MOCK] Transcription complete: {result['latency']:.2f}s")
        else:
            result = await transcribe_audio(audio.file)
            logger.info(f"Transcription complete: {result['latency']:.2f}s, provider: {result.get('provider', 'unknown')}")

        return result

    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        # 에러 발생시에도 빈 결과 반환 (500 대신)
        return {
            "text": "",
            "formatted_text": "",
            "segments": [],
            "duration": 0,
            "latency": 0,
            "provider": "error",
            "error": str(e)
        }


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


@app.post("/api/questions/generate-with-context")
async def generate_questions_with_context_endpoint(request: ContextAwareQuestionRequest):
    """
    맥락을 고려한 AI 질문 생성

    - 이전 전사 내용을 분석하여 이미 언급된 내용 제외
    - 대화 단계에 적합한 질문 생성
    - 중복 질문 자동 필터링
    """
    try:
        logger.info(f"Generating context-aware questions (Mock: {MOCK_MODE})")
        logger.info(f"Current transcript length: {len(request.transcript)}")
        logger.info(f"Previous transcripts count: {len(request.previous_transcripts or [])}")

        if MOCK_MODE:
            # Mock 모드에서는 기본 질문 생성
            result = await mock_generate_questions(request.transcript)
            logger.info(f"[MOCK] Generated {len(result['questions'])} questions")
        else:
            result = await generate_questions_with_context(
                request.transcript,
                request.previous_transcripts
            )
            logger.info(f"Generated {len(result['questions'])} context-aware questions")

        return result

    except Exception as e:
        logger.error(f"Context-aware question generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
