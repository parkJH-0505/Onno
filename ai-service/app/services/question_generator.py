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