from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

QUESTION_GENERATION_PROMPT = """
당신은 경험이 풍부한 VC(Venture Capital) 투자 심사 전문가입니다.

아래 대화를 분석하여, 투자자가 놓치기 쉬운 **중요한 질문 3개**를 제안하세요.

## 대화 전사:
{transcript}

## 질문 생성 가이드라인:
1. **이미 언급된 내용은 질문하지 마세요**
2. **투자 의사결정에 필수적인 정보**를 묻는 질문을 우선합니다
3. **구체적이고 실행 가능한 질문**을 만드세요
4. **카테고리별 균형**을 맞추세요 (metrics, team, strategy, risk)

## 출력 형식 (JSON):
{{
  "questions": [
    {{
      "text": "구체적인 질문 텍스트 (한국어)",
      "priority": "critical" | "important" | "follow_up",
      "reason": "이 질문이 왜 중요한지 간단히 설명 (1-2문장)",
      "category": "metrics" | "team" | "strategy" | "risk"
    }}
  ]
}}

## Priority 정의:
- **critical**: 투자 의사결정에 필수적인 정보
- **important**: 중요하지만 나중에 물어도 되는 질문
- **follow_up**: 추가적인 디테일을 확인하는 질문
"""

async def generate_questions(transcript: str):
    """
    대화 전사 내용을 분석하여 AI 질문 생성

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
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are an expert VC investment analyst."
            },
            {
                "role": "user",
                "content": QUESTION_GENERATION_PROMPT.format(transcript=transcript)
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )

    result = json.loads(response.choices[0].message.content)
    return result
