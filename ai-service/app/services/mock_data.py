"""
Mock 데이터 서비스
API 크레딧이 없거나 테스트 목적으로 사용하는 가짜 데이터 생성기
"""

import time
import random
import asyncio
from typing import Dict, Any


# Mock 전사 데이터 (화자 분리 포함)
MOCK_TRANSCRIPT_SEGMENTS = [
    {
        "segments": [
            {"speaker": "투자자", "text": "안녕하세요, 오늘 피칭 기대됩니다.", "startTime": 0},
            {"speaker": "대표", "text": "감사합니다. 저희 서비스는 AI 기반 B2B SaaS 솔루션입니다.", "startTime": 5},
            {"speaker": "대표", "text": "현재 월간 활성 사용자는 약 5만명 수준이고요.", "startTime": 15},
            {"speaker": "투자자", "text": "성장률은 어떻게 되나요?", "startTime": 25},
            {"speaker": "대표", "text": "매출은 지난달 기준으로 3억원 정도이며, 전월 대비 약 20% 성장하고 있습니다.", "startTime": 30},
            {"speaker": "투자자", "text": "주요 타겟 고객은 누구인가요?", "startTime": 45},
            {"speaker": "대표", "text": "주요 타겟 고객은 중소기업이며 ARPU는 월 5만원입니다.", "startTime": 50},
        ],
        "full_text": "안녕하세요, 오늘 피칭 기대됩니다. 감사합니다. 저희 서비스는 AI 기반 B2B SaaS 솔루션입니다. 현재 월간 활성 사용자는 약 5만명 수준이고요. 성장률은 어떻게 되나요? 매출은 지난달 기준으로 3억원 정도이며, 전월 대비 약 20% 성장하고 있습니다. 주요 타겟 고객은 누구인가요? 주요 타겟 고객은 중소기업이며 ARPU는 월 5만원입니다."
    },
    {
        "segments": [
            {"speaker": "화자1", "text": "팀 구성에 대해 설명해주세요.", "startTime": 0},
            {"speaker": "화자2", "text": "저희 팀은 총 15명으로 구성되어 있습니다.", "startTime": 8},
            {"speaker": "화자2", "text": "개발팀 8명, 비즈팀 5명, 운영팀 2명입니다.", "startTime": 15},
            {"speaker": "화자1", "text": "기술 스택은요?", "startTime": 25},
            {"speaker": "화자2", "text": "백엔드는 Python과 FastAPI, 프론트엔드는 React를 사용합니다.", "startTime": 30},
        ],
        "full_text": "팀 구성에 대해 설명해주세요. 저희 팀은 총 15명으로 구성되어 있습니다. 개발팀 8명, 비즈팀 5명, 운영팀 2명입니다. 기술 스택은요? 백엔드는 Python과 FastAPI, 프론트엔드는 React를 사용합니다."
    }
]


def format_mock_transcript(segments: list) -> str:
    """Mock 세그먼트를 클로바노트 스타일로 포맷"""
    lines = []
    for seg in segments:
        speaker = seg.get("speaker", "화자")
        start_time = seg.get("startTime", 0)
        text = seg.get("text", "")

        minutes = int(start_time // 60)
        seconds = int(start_time % 60)
        timestamp = f"{minutes:02d}:{seconds:02d}"

        lines.append(f"{speaker} {timestamp}")
        lines.append(text)
        lines.append("")

    return "\n".join(lines)


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
    실제 API 대신 랜덤 Mock 데이터 반환 (화자 분리 포함)

    Args:
        audio_file: 오디오 파일 (사용하지 않음)

    Returns:
        dict: {
            "text": str,              # 원본 전사 텍스트
            "formatted_text": str,    # 화자/타임스탬프 포함 텍스트
            "segments": list,         # 화자별 세그먼트
            "duration": float,        # 오디오 길이 (초)
            "latency": float,         # 처리 시간 (초)
            "provider": str           # mock
        }
    """
    # 랜덤 대기 시간 (0.5~1.5초)
    latency = random.uniform(0.5, 1.5)
    await asyncio.sleep(latency)

    # 랜덤 Mock 전사 데이터 선택
    mock_data = random.choice(MOCK_TRANSCRIPT_SEGMENTS)
    segments = mock_data["segments"]
    full_text = mock_data["full_text"]

    # 포맷된 텍스트 생성
    formatted_text = format_mock_transcript(segments)

    # Mock 오디오 길이 (마지막 세그먼트 시간 + 10초)
    last_time = segments[-1]["startTime"] if segments else 0
    audio_duration = last_time + 10

    return {
        "text": full_text,
        "formatted_text": formatted_text,
        "segments": segments,
        "duration": audio_duration,
        "latency": latency,
        "provider": "mock"
    }


async def mock_generate_questions(transcript: str) -> Dict[str, Any]:
    """
    Mock Question Generation 서비스
    실제 Claude API 대신 미리 정의된 Mock 질문 반환

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
    await asyncio.sleep(latency)

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
