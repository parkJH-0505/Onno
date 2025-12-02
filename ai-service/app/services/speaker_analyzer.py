"""
Speaker Role Analyzer - 발화 패턴 기반 화자 역할 추정
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# 투자자 발화 패턴
INVESTOR_PATTERNS = [
    # 질문 패턴
    r"어떻게\s*되나요",
    r"얼마인가요",
    r"있나요\?",
    r"인가요\?",
    r"뭔가요",
    r"무엇인가요",
    r"어떤가요",
    r"계신가요",
    r"하셨나요",
    r"있으신가요",
    # 지표 질문
    r"MRR|ARR|CAC|LTV|Churn|NPS|MAU|DAU|GMV",
    r"매출|수익|이익|비용|투자",
    r"성장률|증가율|감소율",
    r"고객.*(수|획득|유지)",
    r"경쟁사|시장|규모",
]

# 창업자 발화 패턴
FOUNDER_PATTERNS = [
    # 설명 패턴
    r"저희(는|가|의|도)?",
    r"우리(는|가|의|도)?",
    r"현재.*(있습니다|입니다)",
    r"계획.*(있습니다|입니다)",
    r"목표.*(있습니다|입니다)",
    # 수치 제시
    r"\d+%",
    r"\d+(만|억|천)",
    r"약\s*\d+",
    # 설명/답변 패턴
    r"말씀드리",
    r"설명드리",
    r"소개드리",
]


def estimate_speaker_role(text: str) -> Optional[str]:
    """
    발화 텍스트를 분석하여 화자 역할 추정

    Args:
        text: 발화 텍스트

    Returns:
        'investor' | 'founder' | 'unknown'
    """
    if not text or len(text.strip()) < 5:
        return "unknown"

    text_lower = text.lower()

    # 투자자 패턴 매칭
    investor_score = 0
    for pattern in INVESTOR_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            investor_score += 1

    # 창업자 패턴 매칭
    founder_score = 0
    for pattern in FOUNDER_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            founder_score += 1

    # 질문 여부 확인 (? 포함)
    if "?" in text:
        investor_score += 2

    # 점수 비교
    if investor_score > founder_score and investor_score >= 2:
        return "investor"
    elif founder_score > investor_score and founder_score >= 2:
        return "founder"
    else:
        return "unknown"


def analyze_conversation_roles(segments: list) -> list:
    """
    전체 대화 세그먼트를 분석하여 화자 역할 추정

    Args:
        segments: [{speaker, text, startTime}, ...]

    Returns:
        segments with speakerRole added
    """
    if not segments:
        return segments

    # 각 세그먼트에 역할 추정
    for segment in segments:
        role = estimate_speaker_role(segment.get("text", ""))
        segment["speakerRole"] = role

    # 화자별 역할 통계
    speaker_roles = {}
    for segment in segments:
        speaker = segment.get("speaker", "")
        role = segment.get("speakerRole", "unknown")

        if speaker not in speaker_roles:
            speaker_roles[speaker] = {"investor": 0, "founder": 0, "unknown": 0}

        speaker_roles[speaker][role] += 1

    # 화자별 최종 역할 결정
    speaker_final_role = {}
    for speaker, counts in speaker_roles.items():
        if counts["investor"] > counts["founder"]:
            speaker_final_role[speaker] = "investor"
        elif counts["founder"] > counts["investor"]:
            speaker_final_role[speaker] = "founder"
        else:
            speaker_final_role[speaker] = "unknown"

    # 세그먼트에 최종 역할 적용
    for segment in segments:
        speaker = segment.get("speaker", "")
        segment["speakerRole"] = speaker_final_role.get(speaker, "unknown")

    logger.info(f"Speaker roles analyzed: {speaker_final_role}")

    return segments


def estimate_single_utterance_role(
    text: str,
    previous_context: list = None
) -> str:
    """
    단일 발화에 대한 역할 추정 (실시간용)

    이전 맥락을 고려하여 더 정확한 추정
    """
    # 기본 추정
    role = estimate_speaker_role(text)

    # 이전 맥락 활용 (선택적)
    if previous_context and role == "unknown":
        # 이전 발화가 질문이었다면 현재는 답변(창업자)
        for prev in reversed(previous_context[-3:]):
            if "?" in prev.get("text", ""):
                return "founder"

    return role
