"""
Phase 3: 개인화된 질문 생성기
레벨과 페르소나에 따라 다른 스타일의 질문 생성
"""
import os
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
import json

# OpenAI 클라이언트
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 페르소나별 스타일 정의
PERSONA_STYLES = {
    "ANALYST": {
        "name": "분석가",
        "description": "숫자와 데이터 중심의 질문",
        "focus": ["지표", "숫자", "벤치마크", "논리적 검증"],
        "tone": "직접적이고 분석적인",
        "example": "MRR 성장률이 5%라고 하셨는데, 이는 MoM인가요 YoY인가요? 정확한 계산 방식을 확인해주세요."
    },
    "BUDDY": {
        "name": "동료",
        "description": "협력적이고 공감 중심의 질문",
        "focus": ["팀", "관계", "어려움", "지원"],
        "tone": "따뜻하고 협력적인",
        "example": "월 5% 성장 축하드립니다! 팀이 가장 어려워하는 부분은 무엇인가요?"
    },
    "GUARDIAN": {
        "name": "수호자",
        "description": "리스크 관리 중심의 질문",
        "focus": ["리스크", "검증", "지속가능성", "방어"],
        "tone": "신중하고 보수적인",
        "example": "5% 성장의 지속 가능성을 검증해야 합니다. Churn Rate와 비교했을 때 Net Growth는 얼마인가요?"
    },
    "VISIONARY": {
        "name": "비전가",
        "description": "기회와 미래 중심의 질문",
        "focus": ["성장", "기회", "혁신", "확장"],
        "tone": "긍정적이고 미래지향적인",
        "example": "5% 성장을 10%로 끌어올릴 수 있는 가장 큰 기회는 무엇이라고 보시나요?"
    }
}

# 레벨별 기능 정의
LEVEL_FEATURES = {
    1: {
        "name": "기본",
        "description": "범용 질문",
        "capabilities": ["기본 질문 생성"]
    },
    2: {
        "name": "나를 아는",
        "description": "과거 맥락 활용",
        "capabilities": ["과거 회의 맥락 로드", "사용자 스타일 반영"]
    },
    3: {
        "name": "깊이 있는",
        "description": "벤치마크 비교",
        "capabilities": ["벤치마크 비교", "리스크 감지", "심화 질문"]
    },
    4: {
        "name": "전문가",
        "description": "예측적 질문",
        "capabilities": ["예측적 질문", "패턴 분석", "자기 개선 코칭"]
    },
    5: {
        "name": "마스터",
        "description": "완전 개인화",
        "capabilities": ["커스텀 템플릿", "팀 지식 공유", "AI 튜닝"]
    }
}

# 기본 프롬프트 템플릿
PERSONALIZED_PROMPT = """당신은 {persona_name} 스타일의 AI 질문 생성기입니다.

## 당신의 스타일:
- 설명: {persona_description}
- 초점: {persona_focus}
- 톤: {persona_tone}
- 예시: {persona_example}

## 사용자 레벨: {level} ({level_name})
{level_description}
{level_capabilities}

## 사용자 선호도:
{preferences}

## 현재 대화:
{transcript}

{relationship_context}

## 질문 생성 지침:
1. {persona_name} 스타일로 질문을 생성하세요
2. 사용자 레벨에 맞는 복잡도의 질문을 생성하세요
3. 선호도가 높은 카테고리를 우선적으로 다루세요
4. 각 질문에 우선순위와 카테고리를 부여하세요

## 출력 형식 (JSON):
{{
    "questions": [
        {{
            "text": "질문 내용",
            "category": "BUSINESS_MODEL|TRACTION|TEAM|MARKET|TECHNOLOGY|FINANCIALS|RISKS",
            "priority": 1-10,
            "reasoning": "왜 이 질문이 중요한지",
            "insight": "관련 인사이트 (레벨 3+ 전용)"
        }}
    ],
    "stage": "대화 단계",
    "analysis": "대화 분석 요약"
}}

질문은 3-5개 생성하세요. JSON만 출력하세요."""


async def generate_personalized_questions(
    transcript: str,
    relationship: Optional[Dict[str, Any]] = None,
    personalization: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    개인화된 질문 생성

    Args:
        transcript: 현재 대화 전사
        relationship: 관계 객체 정보
        personalization: 개인화 정보 (레벨, 페르소나, 선호도)

    Returns:
        생성된 질문들
    """
    # 기본값 설정
    level = personalization.get("level", 1) if personalization else 1
    persona = personalization.get("persona", "ANALYST") if personalization else "ANALYST"
    preferences = personalization.get("preferences", {}) if personalization else {}

    # 페르소나 정보 가져오기
    persona_info = PERSONA_STYLES.get(persona, PERSONA_STYLES["ANALYST"])
    level_info = LEVEL_FEATURES.get(level, LEVEL_FEATURES[1])

    # 선호도 포맷팅
    pref_text = format_preferences(preferences)

    # 관계 맥락 포맷팅
    relationship_text = ""
    if relationship:
        relationship_text = format_relationship_context(relationship)

    # 프롬프트 생성
    prompt = PERSONALIZED_PROMPT.format(
        persona_name=persona_info["name"],
        persona_description=persona_info["description"],
        persona_focus=", ".join(persona_info["focus"]),
        persona_tone=persona_info["tone"],
        persona_example=persona_info["example"],
        level=level,
        level_name=level_info["name"],
        level_description=level_info["description"],
        level_capabilities="- " + "\n- ".join(level_info["capabilities"]),
        preferences=pref_text,
        transcript=transcript[:4000],
        relationship_context=relationship_text,
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a personalized question generation AI. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
        )

        content = response.choices[0].message.content.strip()

        # JSON 파싱
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        result = json.loads(content)

        # 선호도 기반 우선순위 조정
        questions = result.get("questions", [])
        adjusted_questions = adjust_priorities_by_preferences(questions, preferences)

        # 레벨 기반 추가 정보
        if level >= 3:
            # 레벨 3+: 인사이트 포함
            for q in adjusted_questions:
                if not q.get("insight"):
                    q["insight"] = None
        else:
            # 레벨 1-2: 인사이트 제거
            for q in adjusted_questions:
                q.pop("insight", None)

        return {
            "questions": adjusted_questions,
            "stage": result.get("stage", "unknown"),
            "analysis": result.get("analysis", ""),
            "personalization": {
                "level": level,
                "persona": persona,
                "appliedFeatures": level_info["capabilities"]
            }
        }

    except json.JSONDecodeError:
        return generate_fallback_questions(transcript, persona, level)
    except Exception as e:
        print(f"Personalized question generation error: {e}")
        return generate_fallback_questions(transcript, persona, level)


def format_preferences(preferences: Dict[str, Any]) -> str:
    """선호도 정보 포맷팅"""
    if not preferences:
        return "선호도 정보 없음 (기본값 사용)"

    pref_items = []

    # 카테고리별 선호도
    category_prefs = {
        "businessModelPref": "비즈니스 모델",
        "tractionPref": "트랙션/성과",
        "teamPref": "팀",
        "marketPref": "시장",
        "technologyPref": "기술",
        "financialsPref": "재무",
        "risksPref": "리스크",
    }

    for key, label in category_prefs.items():
        value = preferences.get(key, 0.5)
        if value > 0.6:
            pref_items.append(f"- {label}: 높음 ({value:.1%})")
        elif value < 0.4:
            pref_items.append(f"- {label}: 낮음 ({value:.1%})")

    # 톤 선호
    tone = preferences.get("tone", "FORMAL")
    tone_map = {"FORMAL": "격식체", "CASUAL": "비격식체", "DIRECT": "직접적"}
    pref_items.append(f"- 톤: {tone_map.get(tone, tone)}")

    # 용어 설명 포함 여부
    if preferences.get("includeExplanation"):
        pref_items.append("- 용어 설명 포함 선호")

    return "\n".join(pref_items) if pref_items else "선호도 정보 없음"


def format_relationship_context(relationship: Dict[str, Any]) -> str:
    """관계 맥락 포맷팅"""
    parts = ["\n## 관계 정보:"]
    parts.append(f"- 이름: {relationship.get('name', 'N/A')}")
    parts.append(f"- 유형: {relationship.get('type', 'N/A')}")

    if relationship.get('industry'):
        parts.append(f"- 산업: {relationship['industry']}")
    if relationship.get('stage'):
        parts.append(f"- 단계: {relationship['stage']}")
    if relationship.get('meeting_number', 1) > 1:
        parts.append(f"- 미팅 횟수: {relationship['meeting_number']}회차")

    # 구조화 데이터
    if relationship.get('structured_data'):
        parts.append(f"- 주요 지표: {json.dumps(relationship['structured_data'], ensure_ascii=False)}")

    # 최근 미팅
    if relationship.get('recent_meetings'):
        parts.append("- 최근 미팅:")
        for meeting in relationship['recent_meetings'][:3]:
            parts.append(f"  - {meeting.get('date', 'N/A')}: {meeting.get('summary', 'N/A')[:50]}")

    return "\n".join(parts)


def adjust_priorities_by_preferences(
    questions: List[Dict[str, Any]],
    preferences: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """선호도에 따라 우선순위 조정"""
    if not preferences:
        return questions

    # 카테고리별 선호도 매핑
    pref_map = {
        "BUSINESS_MODEL": preferences.get("businessModelPref", 0.5),
        "TRACTION": preferences.get("tractionPref", 0.5),
        "TEAM": preferences.get("teamPref", 0.5),
        "MARKET": preferences.get("marketPref", 0.5),
        "TECHNOLOGY": preferences.get("technologyPref", 0.5),
        "FINANCIALS": preferences.get("financialsPref", 0.5),
        "RISKS": preferences.get("risksPref", 0.5),
        "GENERAL": 0.5,
    }

    for q in questions:
        category = q.get("category", "GENERAL")
        pref_score = pref_map.get(category, 0.5)

        # 선호도에 따른 우선순위 조정
        original_priority = q.get("priority", 5)
        adjustment = (pref_score - 0.5) * 4  # -2 ~ +2 조정
        q["priority"] = max(1, min(10, int(original_priority + adjustment)))
        q["originalPriority"] = original_priority

    # 우선순위로 정렬
    questions.sort(key=lambda x: x["priority"], reverse=True)

    return questions


def generate_fallback_questions(
    transcript: str,
    persona: str,
    level: int
) -> Dict[str, Any]:
    """폴백 질문 생성"""
    persona_info = PERSONA_STYLES.get(persona, PERSONA_STYLES["ANALYST"])

    # 기본 질문들
    default_questions = [
        {
            "text": "이 부분에 대해 좀 더 자세히 설명해주시겠어요?",
            "category": "GENERAL",
            "priority": 5,
            "reasoning": "추가 정보 필요"
        },
        {
            "text": "구체적인 수치로 말씀해주실 수 있을까요?",
            "category": "FINANCIALS",
            "priority": 7,
            "reasoning": "정량적 데이터 확인"
        },
        {
            "text": "가장 큰 어려움은 무엇인가요?",
            "category": "RISKS",
            "priority": 6,
            "reasoning": "리스크 파악"
        }
    ]

    return {
        "questions": default_questions,
        "stage": "unknown",
        "analysis": "폴백 질문 생성됨",
        "personalization": {
            "level": level,
            "persona": persona,
            "appliedFeatures": []
        }
    }
