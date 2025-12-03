import os
import json
import re
import logging
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Claude 클라이언트는 필요할 때만 초기화 (Mock 모드에서는 사용 안 함)
_client = None

def get_client():
    global _client
    if _client is None:
        import anthropic
        _client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client

# 기본 프롬프트
QUESTION_GENERATION_PROMPT = """당신은 경험이 풍부한 VC(Venture Capital) 투자 심사 전문가입니다.

아래 대화를 분석하여, 투자자가 놓치기 쉬운 **중요한 질문 3개**를 제안하세요.

## 대화 전사:
{transcript}

## 질문 생성 가이드라인:
1. **이미 언급된 내용은 질문하지 마세요**
2. **투자 의사결정에 필수적인 정보**를 묻는 질문을 우선합니다
3. **구체적이고 실행 가능한 질문**을 만드세요
4. **카테고리별 균형**을 맞추세요 (metrics, team, strategy, risk)

## 출력 형식:
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{{
  "questions": [
    {{
      "text": "구체적인 질문 텍스트 (한국어)",
      "priority": "critical 또는 important 또는 follow_up",
      "reason": "이 질문이 왜 중요한지 간단히 설명 (1-2문장)",
      "category": "metrics 또는 team 또는 strategy 또는 risk"
    }}
  ]
}}

## Priority 정의:
- **critical**: 투자 의사결정에 필수적인 정보
- **important**: 중요하지만 나중에 물어도 되는 질문
- **follow_up**: 추가적인 디테일을 확인하는 질문"""


def extract_json_from_response(text: str) -> dict:
    """Claude 응답에서 JSON 추출"""
    # JSON 블록 찾기
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # 실패 시 기본 응답
    return {
        "questions": [
            {
                "text": "추가 정보가 필요합니다",
                "priority": "important",
                "reason": "응답 파싱 실패",
                "category": "strategy"
            }
        ]
    }


async def generate_questions(transcript: str):
    """
    대화 전사 내용을 분석하여 AI 질문 생성 (Claude API)

    Args:
        transcript: 대화 전사 텍스트

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
    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": QUESTION_GENERATION_PROMPT.format(transcript=transcript)
            }
        ]
    )

    response_text = message.content[0].text
    result = extract_json_from_response(response_text)

    return result


# 맥락 인식 프롬프트
CONTEXT_AWARE_PROMPT = """당신은 경험이 풍부한 VC(Venture Capital) 투자 심사 전문가입니다.

## 대화 전사:
{transcript}

## 이미 언급/논의된 내용 (이 내용에 대해서는 질문하지 마세요):
{mentioned_context}

## 대화 단계:
{conversation_stage}

위 맥락을 고려하여, **아직 확인되지 않은** 중요한 정보를 묻는 질문 3개를 제안하세요.

## 질문 생성 가이드라인:
1. **이미 언급된 내용이나 지표는 절대 다시 질문하지 마세요**
2. **투자 의사결정에 필수적인 정보**를 묻는 질문을 우선합니다
3. **대화 단계에 적합한 질문**을 만드세요
   - 초반: 회사 개요, 팀, 비전
   - 중반: 상세 지표, 리스크, 경쟁
   - 후반: 다음 단계, 투자 조건
4. **구체적이고 실행 가능한 질문**을 만드세요

## 출력 형식:
반드시 아래 JSON 형식으로만 응답하세요.

{{
  "questions": [
    {{
      "text": "구체적인 질문 텍스트 (한국어)",
      "priority": "critical 또는 important 또는 follow_up",
      "reason": "이 질문이 왜 중요한지 (1문장)",
      "category": "metrics 또는 team 또는 strategy 또는 risk"
    }}
  ]
}}"""


async def generate_questions_with_context(
    transcript: str,
    previous_transcripts: Optional[List[str]] = None
) -> dict:
    """
    맥락을 고려한 질문 생성

    Args:
        transcript: 현재 전사 텍스트
        previous_transcripts: 이전 전사 텍스트 리스트

    Returns:
        dict: 생성된 질문 리스트
    """
    from app.services.context_analyzer import (
        extract_mentioned_topics,
        build_context_for_prompt,
        filter_redundant_questions,
        get_conversation_stage
    )

    # 전체 전사 합치기
    all_transcripts = previous_transcripts or []
    all_transcripts.append(transcript)

    # 맥락 추출
    mentioned_context = extract_mentioned_topics(all_transcripts)
    context_str = build_context_for_prompt(all_transcripts, mentioned_context)
    stage = get_conversation_stage(all_transcripts)

    stage_descriptions = {
        'introduction': '초반 (회사 소개 단계) - 기본적인 회사 개요와 팀에 대해 질문하세요',
        'deep_dive': '중반 (상세 검토 단계) - 구체적인 지표, 리스크, 경쟁에 대해 질문하세요',
        'closing': '후반 (마무리 단계) - 다음 단계, 투자 조건, 추가 자료에 대해 질문하세요',
    }

    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": CONTEXT_AWARE_PROMPT.format(
                    transcript=transcript,
                    mentioned_context=context_str,
                    conversation_stage=stage_descriptions.get(stage, stage)
                )
            }
        ]
    )

    response_text = message.content[0].text
    result = extract_json_from_response(response_text)

    # 중복 질문 필터링 (이중 체크)
    if "questions" in result:
        result["questions"] = filter_redundant_questions(
            result["questions"],
            mentioned_context
        )

    logger.info(f"Generated {len(result.get('questions', []))} context-aware questions")

    return result


# 관계 객체 맥락 기반 프롬프트 (Phase 2 핵심)
RELATIONSHIP_AWARE_PROMPT = """당신은 경험이 풍부한 VC(Venture Capital) 투자 심사 전문가입니다.

## 관계 정보:
- **이름**: {relationship_name}
- **유형**: {relationship_type}
{industry_info}
{stage_info}
{structured_data_info}
{recent_meetings_info}
{notes_info}

## 현재 미팅 번호: {meeting_number}회차

## 현재 대화 전사:
{transcript}

## 질문 생성 가이드라인:

### 관계 유형별 관점:
{type_specific_guidelines}

### 미팅 회차별 접근:
{meeting_stage_guidelines}

### 핵심 규칙:
1. **이미 언급된 내용은 질문하지 마세요** (이전 미팅 포함)
2. **관계 유형과 단계에 맞는 질문**을 만드세요
3. **구조화 데이터의 변화나 미비점**을 확인하는 질문 포함
4. **이전 미팅에서 논의된 내용의 후속 진행상황** 확인
5. **구체적이고 실행 가능한** 질문을 만드세요

## 출력 형식:
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{{
  "questions": [
    {{
      "text": "구체적인 질문 텍스트 (한국어)",
      "priority": "critical 또는 important 또는 follow_up",
      "reason": "이 질문이 왜 중요한지 간단히 설명 (1-2문장)",
      "category": "metrics 또는 team 또는 strategy 또는 risk"
    }}
  ]
}}

**3개의 질문을 생성하세요.**"""


def _get_type_specific_guidelines(relationship_type: str) -> str:
    """관계 유형별 질문 가이드라인"""
    guidelines = {
        "STARTUP": """- 투자 적합성과 성장 가능성에 집중
- 핵심 지표(MRR, CAC, LTV, Churn) 변화 추적
- 팀 역량과 실행력 검증
- 리스크 요인과 대응 방안 확인""",
        "CLIENT": """- 프로젝트 진행 상황과 요구사항 변화에 집중
- 예산과 타임라인 준수 여부 확인
- 이슈와 블로커 식별
- 다음 단계 협의 사항 정리""",
        "PARTNER": """- 파트너십 가치와 시너지에 집중
- 협업 진행 상황 확인
- 상호 이익과 기대치 조율
- 장기 관계 발전 방향 논의"""
    }
    return guidelines.get(relationship_type, guidelines["STARTUP"])


def _get_meeting_stage_guidelines(meeting_number: int) -> str:
    """미팅 회차별 가이드라인"""
    if meeting_number == 1:
        return """- **1회차 (첫 미팅)**: 기본 정보 파악에 집중
  - 회사/프로젝트 개요, 팀 구성, 핵심 가치 제안
  - 현재 상황과 주요 과제
  - 기본 지표 수집"""
    elif meeting_number == 2:
        return """- **2회차 (심화 검토)**: 상세 분석에 집중
  - 지표 변화와 트렌드 확인
  - 1회차 논의 사항 후속 확인
  - 리스크와 기회 요인 심층 분석"""
    elif meeting_number == 3:
        return """- **3회차 (검증 단계)**: 실행력과 결과에 집중
  - 약속/계획 대비 실제 진행 상황
  - 구체적 성과와 증거 확인
  - 다음 단계 결정을 위한 핵심 질문"""
    else:
        return f"""- **{meeting_number}회차 (장기 관계)**: 지속적 관계 관리
  - 누적 데이터 기반 트렌드 분석
  - 중장기 전략과 방향성 논의
  - 관계 발전 방향과 추가 기회 탐색"""


def _format_structured_data(structured_data: dict) -> str:
    """구조화 데이터를 프롬프트용 문자열로 변환"""
    if not structured_data:
        return ""

    lines = ["- **구조화 데이터**:"]
    for key, value in structured_data.items():
        if value is not None and value != "":
            lines.append(f"  - {key}: {value}")

    return "\n".join(lines) if len(lines) > 1 else ""


def _format_recent_meetings(recent_meetings: list) -> str:
    """이전 미팅 정보를 프롬프트용 문자열로 변환"""
    if not recent_meetings:
        return ""

    lines = ["- **이전 미팅 히스토리**:"]
    for meeting in recent_meetings[:3]:  # 최근 3개까지만
        date = meeting.get("date", "날짜 미상")
        summary = meeting.get("summary", "요약 없음")
        key_questions = meeting.get("keyQuestions", [])

        lines.append(f"  - [{date}] {summary}")
        if key_questions:
            for q in key_questions[:2]:  # 핵심 질문 2개까지만
                lines.append(f"    - 핵심 질문: {q}")

    return "\n".join(lines) if len(lines) > 1 else ""


async def generate_questions_with_relationship(
    transcript: str,
    relationship: Optional[dict] = None
) -> dict:
    """
    관계 객체 맥락을 활용한 질문 생성 (Phase 2 핵심 기능)

    Args:
        transcript: 현재 대화 전사 텍스트
        relationship: 관계 객체 정보 {
            name, type, industry, stage, notes,
            structured_data, meeting_number, recent_meetings
        }

    Returns:
        dict: 생성된 질문 리스트
    """
    # 관계 정보가 없으면 기본 질문 생성으로 폴백
    if not relationship:
        logger.info("No relationship context provided, falling back to basic generation")
        return await generate_questions(transcript)

    # 관계 정보 추출
    name = relationship.get("name", "알 수 없음")
    rel_type = relationship.get("type", "STARTUP")
    industry = relationship.get("industry")
    stage = relationship.get("stage")
    notes = relationship.get("notes")
    structured_data = relationship.get("structured_data", {})
    meeting_number = relationship.get("meeting_number", 1)
    recent_meetings = relationship.get("recent_meetings", [])

    # 프롬프트 구성 요소 생성
    industry_info = f"- **산업**: {industry}" if industry else ""
    stage_info = f"- **단계**: {stage}" if stage else ""
    structured_data_info = _format_structured_data(structured_data)
    recent_meetings_info = _format_recent_meetings(recent_meetings)
    notes_info = f"- **메모**: {notes}" if notes else ""

    type_guidelines = _get_type_specific_guidelines(rel_type)
    meeting_guidelines = _get_meeting_stage_guidelines(meeting_number)

    # 최종 프롬프트 생성
    prompt = RELATIONSHIP_AWARE_PROMPT.format(
        relationship_name=name,
        relationship_type=rel_type,
        industry_info=industry_info,
        stage_info=stage_info,
        structured_data_info=structured_data_info,
        recent_meetings_info=recent_meetings_info,
        notes_info=notes_info,
        meeting_number=meeting_number,
        transcript=transcript,
        type_specific_guidelines=type_guidelines,
        meeting_stage_guidelines=meeting_guidelines
    )

    logger.info(f"Generating relationship-aware questions for {name} ({rel_type}), meeting #{meeting_number}")

    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    response_text = message.content[0].text
    result = extract_json_from_response(response_text)

    logger.info(f"Generated {len(result.get('questions', []))} relationship-aware questions")

    return result


# 개인화 프롬프트 (Phase 6-1)
PERSONALIZED_PROMPT = """당신은 경험이 풍부한 VC(Venture Capital) 투자 심사 전문가입니다.

## 대화 전사:
{transcript}

## 사용자 프로필:
- **레벨**: Lv.{level} ({level_description})
- **페르소나**: {persona_description}
- **도메인**: {domain}

## 사용자 선호도:
{preferences_info}

## 해금된 기능:
{features_info}

## 질문 생성 가이드라인:

### 페르소나별 톤:
{persona_guidelines}

### 레벨별 질문 복잡도:
{level_guidelines}

### 선호도 반영:
- 선호도가 높은 카테고리({high_pref_categories})에서 더 많은 질문 생성
- 선호도가 낮은 카테고리({low_pref_categories})는 최소화

## 출력 형식:
반드시 아래 JSON 형식으로만 응답하세요.

{{
  "questions": [
    {{
      "text": "구체적인 질문 텍스트 (한국어)",
      "priority": "critical 또는 important 또는 follow_up",
      "reason": "이 질문이 왜 중요한지 (1문장)",
      "category": "business_model 또는 traction 또는 team 또는 market 또는 technology 또는 financials 또는 risks",
      "explanation": "{explanation_instruction}"
    }}
  ]
}}

**3개의 질문을 생성하세요.**"""


def _get_persona_description(persona: str) -> str:
    """페르소나 설명"""
    descriptions = {
        "ANALYST": "분석가 - 데이터와 지표 중심의 객관적 접근",
        "BUDDY": "동료 - 친근하고 협력적인 스타일",
        "GUARDIAN": "보호자 - 리스크와 안전에 집중",
        "VISIONARY": "비전가 - 큰 그림과 가능성에 집중"
    }
    return descriptions.get(persona, "분석가")


def _get_persona_guidelines(persona: str) -> str:
    """페르소나별 질문 가이드라인"""
    guidelines = {
        "ANALYST": """- 데이터와 지표 기반의 질문을 우선
- 객관적이고 측정 가능한 정보 요청
- 비교 분석과 벤치마크 관련 질문 포함""",
        "BUDDY": """- 협력적이고 건설적인 톤의 질문
- 어떻게 도와줄 수 있는지 관점의 질문
- 팀과 문화에 대한 이해를 높이는 질문""",
        "GUARDIAN": """- 리스크와 잠재적 문제에 집중
- 대응 계획과 보호 장치 확인
- 최악의 시나리오와 대비책 질문""",
        "VISIONARY": """- 큰 비전과 장기적 가능성에 집중
- 혁신적 기회와 성장 잠재력 질문
- 업계 변화와 트렌드에 대한 시각 확인"""
    }
    return guidelines.get(persona, guidelines["ANALYST"])


def _get_level_description(level: int) -> str:
    """레벨 설명"""
    descriptions = {
        1: "입문자",
        2: "견습생",
        3: "숙련자",
        4: "전문가",
        5: "마스터"
    }
    return descriptions.get(level, "입문자")


def _get_level_guidelines(level: int) -> str:
    """레벨별 질문 복잡도 가이드라인"""
    if level <= 1:
        return """- 기본적이고 이해하기 쉬운 질문
- 핵심 지표와 기본 정보 위주
- 전문 용어 최소화"""
    elif level <= 2:
        return """- 조금 더 상세한 질문 가능
- 기본 지표 외 추가 분석 질문
- 일부 전문 용어 사용"""
    elif level <= 3:
        return """- 심화된 분석 질문 포함
- 벤치마크와 비교 분석 질문
- 업계 전문 용어 활용"""
    elif level <= 4:
        return """- 고급 전략적 질문 포함
- 예측과 시나리오 분석 질문
- 전문가 수준의 통찰 요청"""
    else:
        return """- 최고 수준의 복합적 질문
- 다차원적 분석과 예측 질문
- 업계 최고 수준의 통찰 요청"""


def _format_preferences_for_prompt(preferences: dict) -> tuple:
    """선호도를 프롬프트용으로 포맷"""
    category_map = {
        "businessModelPref": ("business_model", "비즈니스 모델"),
        "tractionPref": ("traction", "트랙션"),
        "teamPref": ("team", "팀"),
        "marketPref": ("market", "시장"),
        "technologyPref": ("technology", "기술"),
        "financialsPref": ("financials", "재무"),
        "risksPref": ("risks", "리스크")
    }

    pref_items = []
    high_prefs = []
    low_prefs = []

    for key, (cat, label) in category_map.items():
        value = preferences.get(key, 0.5)
        pref_items.append(f"- {label}: {value:.0%}")

        if value >= 0.7:
            high_prefs.append(label)
        elif value <= 0.3:
            low_prefs.append(label)

    pref_info = "\n".join(pref_items)
    high_cats = ", ".join(high_prefs) if high_prefs else "없음"
    low_cats = ", ".join(low_prefs) if low_prefs else "없음"

    return pref_info, high_cats, low_cats


async def generate_personalized_questions(
    transcript: str,
    personalization: Optional[dict] = None
) -> dict:
    """
    개인화된 질문 생성 (Phase 6-1)

    Args:
        transcript: 대화 전사 텍스트
        personalization: 개인화 컨텍스트 {
            level, persona, domain, features, preferences
        }

    Returns:
        dict: 생성된 질문 리스트
    """
    # 개인화 정보가 없으면 기본 질문 생성으로 폴백
    if not personalization:
        logger.info("No personalization context provided, falling back to basic generation")
        return await generate_questions(transcript)

    # 개인화 정보 추출
    level = personalization.get("level", 1)
    persona = personalization.get("persona", "ANALYST")
    domain = personalization.get("domain", "GENERAL")
    features = personalization.get("features", [])
    preferences = personalization.get("preferences", {})

    # 프롬프트 구성 요소 생성
    level_desc = _get_level_description(level)
    persona_desc = _get_persona_description(persona)
    persona_guidelines = _get_persona_guidelines(persona)
    level_guidelines = _get_level_guidelines(level)

    pref_info, high_cats, low_cats = _format_preferences_for_prompt(preferences)

    features_info = "- " + "\n- ".join(features) if features else "기본 기능만 해금됨"

    # 설명 포함 여부
    include_explanation = preferences.get("includeExplanation", True)
    explanation_instruction = "이 질문에 대한 간단한 설명 (선택사항)" if include_explanation else "(생략)"

    # 도메인 한글화
    domain_labels = {
        "INVESTMENT_SCREENING": "투자 심사",
        "MENTORING": "멘토링",
        "SALES": "세일즈",
        "PRODUCT_REVIEW": "제품 리뷰",
        "TEAM_MEETING": "팀 미팅",
        "USER_INTERVIEW": "사용자 인터뷰",
        "GENERAL": "일반"
    }
    domain_label = domain_labels.get(domain, "일반")

    # 최종 프롬프트 생성
    prompt = PERSONALIZED_PROMPT.format(
        transcript=transcript,
        level=level,
        level_description=level_desc,
        persona_description=persona_desc,
        domain=domain_label,
        preferences_info=pref_info,
        features_info=features_info,
        persona_guidelines=persona_guidelines,
        level_guidelines=level_guidelines,
        high_pref_categories=high_cats,
        low_pref_categories=low_cats,
        explanation_instruction=explanation_instruction
    )

    logger.info(f"Generating personalized questions for Lv.{level} {persona} in {domain}")

    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    response_text = message.content[0].text
    result = extract_json_from_response(response_text)

    logger.info(f"Generated {len(result.get('questions', []))} personalized questions")

    return result