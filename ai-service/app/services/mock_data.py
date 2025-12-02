"""
Mock 데이터 서비스
OpenAI API 크레딧이 없거나 테스트 목적으로 사용하는 가짜 데이터 생성기
"""

import time
import random
from typing import Dict, Any

# Mock 전사 데이터 (한국어 비즈니스 대화)
MOCK_TRANSCRIPTS = [
    "저희 서비스는 AI 기반 B2B SaaS 솔루션입니다",
    "현재 월간 활성 사용자는 약 5만명 수준이고요",
    "매출은 지난달 기준으로 3억원 정도입니다",
    "성장률은 전월 대비 약 20% 정도 나오고 있습니다",
    "주요 타겟 고객은 중소기업이며 ARPU는 월 5만원입니다",
]

# Mock 질문 데이터 템플릿
MOCK_QUESTIONS_TEMPLATES = [
    {
        "metrics": [
            {
                "text": "현재 CAC(고객 획득 비용)는 얼마이며, LTV 대비 비율은 어떻게 되나요?",
                "priority": "critical",
                "reason": "유닛 이코노믹스는 투자 의사결정의 핵심 지표이며, 비즈니스 지속 가능성을 판단하는 기준입니다",
                "category": "metrics"
            },
            {
                "text": "월간 리텐션율(Month Retention Rate)은 어느 수준인가요?",
                "priority": "important",
                "reason": "고객 유지율은 제품의 Product-Market Fit과 장기 성장 가능성을 보여주는 지표입니다",
                "category": "metrics"
            }
        ],
        "team": [
            {
                "text": "창업팀의 도메인 경험과 기술 역량은 어떻게 구성되어 있나요?",
                "priority": "important",
                "reason": "팀의 전문성은 실행 능력과 문제 해결 능력을 결정하는 핵심 요소입니다",
                "category": "team"
            }
        ],
        "strategy": [
            {
                "text": "주요 경쟁사 대비 차별화 포인트는 무엇인가요?",
                "priority": "critical",
                "reason": "경쟁 우위는 시장에서의 생존과 성장을 위한 필수 조건입니다",
                "category": "strategy"
            },
            {
                "text": "향후 12개월 내 주요 마일스톤과 KPI 목표는 무엇인가요?",
                "priority": "important",
                "reason": "명확한 실행 계획과 측정 가능한 목표는 투자 후 모니터링의 기준이 됩니다",
                "category": "strategy"
            }
        ],
        "risk": [
            {
                "text": "현재 직면한 가장 큰 리스크는 무엇이며, 어떻게 대응하고 있나요?",
                "priority": "critical",
                "reason": "리스크 인지와 대응 능력은 불확실성 관리 역량을 보여줍니다",
                "category": "risk"
            }
        ]
    }
]


async def mock_transcribe_audio(audio_file) -> Dict[str, Any]:
    """
    Mock STT (Speech-to-Text) 서비스
    실제 Whisper API 대신 랜덤 Mock 데이터 반환

    Args:
        audio_file: 오디오 파일 (사용하지 않음)

    Returns:
        dict: {
            "text": str,  # 전사 텍스트
            "duration": float,  # 오디오 길이 (초)
            "latency": float  # 처리 시간 (초)
        }
    """
    # 랜덤 대기 시간 (0.5~1.5초)
    latency = random.uniform(0.5, 1.5)
    await asyncio_sleep(latency)

    # 랜덤 Mock 전사 텍스트 선택
    transcript_text = random.choice(MOCK_TRANSCRIPTS)

    # Mock 오디오 길이 (2~8초)
    audio_duration = random.uniform(2.0, 8.0)

    return {
        "text": transcript_text,
        "duration": audio_duration,
        "latency": latency
    }


async def mock_generate_questions(transcript: str) -> Dict[str, Any]:
    """
    Mock Question Generation 서비스
    실제 GPT-4o API 대신 미리 정의된 Mock 질문 반환

    Args:
        transcript: 대화 전사 텍스트 (사용하지 않음)

    Returns:
        dict: {
            "questions": [
                {
                    "text": str,
                    "priority": str,
                    "reason": str,
                    "category": str
                }
            ]
        }
    """
    # 랜덤 대기 시간 (1~3초)
    latency = random.uniform(1.0, 3.0)
    await asyncio_sleep(latency)

    # Mock 질문 템플릿에서 랜덤 선택
    template = MOCK_QUESTIONS_TEMPLATES[0]

    # 각 카테고리에서 1-2개씩 랜덤 선택
    selected_questions = []

    # Metrics에서 1개
    if template.get("metrics"):
        selected_questions.append(random.choice(template["metrics"]))

    # Strategy에서 1개
    if template.get("strategy"):
        selected_questions.append(random.choice(template["strategy"]))

    # Risk에서 1개
    if template.get("risk"):
        selected_questions.append(random.choice(template["risk"]))

    # 랜덤으로 섞기
    random.shuffle(selected_questions)

    return {
        "questions": selected_questions[:3]  # 최대 3개
    }


# asyncio.sleep을 사용하기 위한 import
import asyncio

async def asyncio_sleep(seconds: float):
    """Helper function for async sleep"""
    await asyncio.sleep(seconds)
