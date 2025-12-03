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