from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.stt import transcribe_audio
from app.services.question_generator import (
    generate_questions,
    generate_questions_with_context,
    generate_questions_with_relationship
)
from app.services.summary_generator import generate_meeting_summary
from app.services.personalized_questions import generate_personalized_questions
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


class RelationshipContext(BaseModel):
    """관계 객체 맥락 정보"""
    name: str
    type: str  # STARTUP, CLIENT, PARTNER
    industry: Optional[str] = None
    stage: Optional[str] = None
    notes: Optional[str] = None
    structured_data: Optional[dict] = None  # MRR, CAC, LTV 등
    meeting_number: int = 1
    recent_meetings: Optional[List[dict]] = None  # 이전 미팅 요약


class RelationshipAwareQuestionRequest(BaseModel):
    """관계 맥락 기반 질문 생성 요청"""
    transcript: str
    relationship: Optional[RelationshipContext] = None


class PersonalizationContext(BaseModel):
    """Phase 3: 개인화 맥락 정보"""
    user_id: str
    domain: str  # INVESTMENT_SCREENING, MENTORING, etc.
    level: int = 1  # 1-5
    persona: str = "ANALYST"  # ANALYST, BUDDY, GUARDIAN, VISIONARY
    features: List[str] = []  # 해금된 기능들
    preferences: Optional[Dict[str, Any]] = None  # 선호도 정보


class PersonalizedQuestionRequest(BaseModel):
    """Phase 3: 개인화된 질문 생성 요청"""
    transcript: str
    relationship: Optional[RelationshipContext] = None
    personalization: Optional[PersonalizationContext] = None


class TranscriptItem(BaseModel):
    """전사 항목"""
    text: str
    speaker: Optional[str] = None
    speaker_role: Optional[str] = None
    start_time: Optional[float] = None


class QuestionItem(BaseModel):
    """질문 항목"""
    text: str
    category: Optional[str] = None
    is_used: bool = False


class SummaryRequest(BaseModel):
    """회의 요약 생성 요청"""
    transcripts: List[TranscriptItem]
    questions: List[QuestionItem] = []
    relationship_context: Optional[Dict[str, Any]] = None


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


@app.post("/api/questions/generate-with-relationship")
async def generate_questions_with_relationship_endpoint(request: RelationshipAwareQuestionRequest):
    """
    관계 객체 맥락을 활용한 AI 질문 생성 (Phase 2 핵심)

    - 관계 객체 정보 (이름, 유형, 산업, 단계)
    - 이전 미팅 히스토리
    - 구조화 데이터 (MRR, CAC, LTV 등)
    - 메모/노트

    이 정보를 활용하여 맥락에 맞는 질문을 생성합니다.
    """
    try:
        logger.info(f"Generating relationship-aware questions (Mock: {MOCK_MODE})")
        logger.info(f"Transcript length: {len(request.transcript)}")

        if request.relationship:
            logger.info(f"Relationship: {request.relationship.name} ({request.relationship.type})")
            logger.info(f"Meeting number: {request.relationship.meeting_number}")

        if MOCK_MODE:
            result = await mock_generate_questions(request.transcript)
            logger.info(f"[MOCK] Generated {len(result['questions'])} questions")
        else:
            # 관계 정보를 dict로 변환
            relationship_dict = None
            if request.relationship:
                relationship_dict = {
                    "name": request.relationship.name,
                    "type": request.relationship.type,
                    "industry": request.relationship.industry,
                    "stage": request.relationship.stage,
                    "notes": request.relationship.notes,
                    "structured_data": request.relationship.structured_data,
                    "meeting_number": request.relationship.meeting_number,
                    "recent_meetings": request.relationship.recent_meetings,
                }

            result = await generate_questions_with_relationship(
                request.transcript,
                relationship_dict
            )
            logger.info(f"Generated {len(result['questions'])} relationship-aware questions")

        return result

    except Exception as e:
        logger.error(f"Relationship-aware question generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/questions/generate-personalized")
async def generate_personalized_questions_endpoint(request: PersonalizedQuestionRequest):
    """
    Phase 3: 개인화된 AI 질문 생성

    - 사용자 레벨에 따른 질문 복잡도 조절
    - 페르소나에 따른 질문 스타일 변경
    - 선호도에 따른 카테고리 우선순위 조정
    - 해금된 기능에 따른 추가 인사이트 제공
    """
    try:
        logger.info(f"Generating personalized questions (Mock: {MOCK_MODE})")
        logger.info(f"Transcript length: {len(request.transcript)}")

        if request.personalization:
            logger.info(f"User: {request.personalization.user_id}")
            logger.info(f"Level: {request.personalization.level}, Persona: {request.personalization.persona}")

        if MOCK_MODE:
            result = await mock_generate_questions(request.transcript)
            logger.info(f"[MOCK] Generated {len(result['questions'])} questions")
        else:
            # 관계 정보 변환
            relationship_dict = None
            if request.relationship:
                relationship_dict = {
                    "name": request.relationship.name,
                    "type": request.relationship.type,
                    "industry": request.relationship.industry,
                    "stage": request.relationship.stage,
                    "notes": request.relationship.notes,
                    "structured_data": request.relationship.structured_data,
                    "meeting_number": request.relationship.meeting_number,
                    "recent_meetings": request.relationship.recent_meetings,
                }

            # 개인화 정보 변환
            personalization_dict = None
            if request.personalization:
                personalization_dict = {
                    "user_id": request.personalization.user_id,
                    "domain": request.personalization.domain,
                    "level": request.personalization.level,
                    "persona": request.personalization.persona,
                    "features": request.personalization.features,
                    "preferences": request.personalization.preferences,
                }

            result = await generate_personalized_questions(
                request.transcript,
                relationship_dict,
                personalization_dict
            )
            logger.info(f"Generated {len(result['questions'])} personalized questions")

        return result

    except Exception as e:
        logger.error(f"Personalized question generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/summary/generate")
async def generate_summary_endpoint(request: SummaryRequest):
    """
    Phase 3: 회의 자동 요약 생성

    - 전체 요약
    - 핵심 포인트
    - 결정 사항
    - 후속 조치 (Action Items)
    - 주요 질문
    - 놓친 질문
    - 데이터 업데이트 제안
    - 다음 회의 아젠다 제안
    """
    try:
        logger.info(f"Generating meeting summary (Mock: {MOCK_MODE})")
        logger.info(f"Transcripts: {len(request.transcripts)}, Questions: {len(request.questions)}")

        if MOCK_MODE:
            # Mock 요약 반환
            result = {
                "success": True,
                "data": {
                    "summary": f"회의가 {len(request.transcripts)}개의 발화로 진행되었습니다.",
                    "key_points": ["주요 논의 사항 1", "주요 논의 사항 2"],
                    "decisions": [],
                    "action_items": [],
                    "key_questions": [q.text for q in request.questions if q.is_used][:3],
                    "missed_questions": [q.text for q in request.questions if not q.is_used][:3],
                    "suggested_data_updates": {},
                    "next_meeting_agenda": [],
                }
            }
            logger.info("[MOCK] Generated summary")
        else:
            # 전사 데이터 변환
            transcripts = [
                {
                    "text": t.text,
                    "speaker": t.speaker,
                    "speaker_role": t.speaker_role,
                    "start_time": t.start_time,
                }
                for t in request.transcripts
            ]

            # 질문 데이터 변환
            questions = [
                {
                    "text": q.text,
                    "category": q.category,
                    "is_used": q.is_used,
                }
                for q in request.questions
            ]

            summary = await generate_meeting_summary(
                transcripts,
                questions,
                request.relationship_context
            )

            result = {
                "success": True,
                "data": summary
            }
            logger.info("Generated meeting summary")

        return result

    except Exception as e:
        logger.error(f"Summary generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
