import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

# Claude 클라이언트는 필요할 때만 초기화 (Mock 모드에서는 사용 안 함)
_client = None

def get_client():
    global _client
    if _client is None:
        import anthropic
        _client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client

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