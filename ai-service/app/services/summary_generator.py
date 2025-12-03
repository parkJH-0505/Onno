"""
Phase 3: 회의 자동 요약 생성기
"""
import os
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
import json

# OpenAI 클라이언트
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SUMMARY_PROMPT = """당신은 회의 내용을 분석하고 요약하는 AI 전문가입니다.
주어진 회의 전사 내용을 분석하여 구조화된 요약을 생성하세요.

## 회의 전사 내용:
{transcript}

## 논의된 질문들:
사용된 질문: {used_questions}
사용되지 않은 질문: {unused_questions}

{relationship_context}

## 출력 형식 (JSON):
{{
    "summary": "회의 전체 요약 (2-3문장)",
    "key_points": ["핵심 포인트 1", "핵심 포인트 2", ...],
    "decisions": ["결정 사항 1", "결정 사항 2", ...],
    "action_items": ["후속 조치 1", "후속 조치 2", ...],
    "key_questions": ["중요한 질문 1", "중요한 질문 2", ...],
    "missed_questions": ["놓친/확인이 필요한 질문 1", ...],
    "suggested_data_updates": {{"mrr": 60000, "cac": 25, ...}},
    "next_meeting_agenda": ["다음 회의 아젠다 1", ...]
}}

주의사항:
1. 한국어로 작성하세요
2. 핵심만 간결하게 요약하세요
3. 구체적인 숫자/지표가 언급되었다면 suggested_data_updates에 포함하세요
4. 사용되지 않은 질문 중 중요한 것은 missed_questions에 포함하세요
5. 다음 회의에서 논의해야 할 주제를 next_meeting_agenda에 제안하세요

JSON만 출력하세요."""

RELATIONSHIP_CONTEXT_TEMPLATE = """
## 관계 정보:
- 이름: {name}
- 유형: {type}
- 산업: {industry}
- 단계: {stage}
- 기존 데이터: {structured_data}
- 메모: {notes}
"""


async def generate_meeting_summary(
    transcripts: List[Dict[str, Any]],
    questions: List[Dict[str, Any]],
    relationship_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    회의 요약 생성

    Args:
        transcripts: 전사 항목 리스트
        questions: 질문 리스트
        relationship_context: 관계 객체 정보 (선택)

    Returns:
        요약 데이터
    """
    # 전사 텍스트 결합
    transcript_text = "\n".join([
        f"[{t.get('speaker', '화자')}]: {t['text']}"
        for t in transcripts
    ])

    # 질문 분류
    used_questions = [q['text'] for q in questions if q.get('is_used')]
    unused_questions = [q['text'] for q in questions if not q.get('is_used')]

    # 관계 맥락 포맷팅
    relationship_text = ""
    if relationship_context:
        relationship_text = RELATIONSHIP_CONTEXT_TEMPLATE.format(
            name=relationship_context.get('name', 'N/A'),
            type=relationship_context.get('type', 'N/A'),
            industry=relationship_context.get('industry', 'N/A'),
            stage=relationship_context.get('stage', 'N/A'),
            structured_data=json.dumps(relationship_context.get('structuredData', {}), ensure_ascii=False),
            notes=relationship_context.get('notes', 'N/A'),
        )

    # 프롬프트 생성
    prompt = SUMMARY_PROMPT.format(
        transcript=transcript_text[:8000],  # 토큰 제한
        used_questions="\n".join(used_questions[:10]) if used_questions else "없음",
        unused_questions="\n".join(unused_questions[:10]) if unused_questions else "없음",
        relationship_context=relationship_text,
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a meeting summarization expert. Always respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        content = response.choices[0].message.content.strip()

        # JSON 파싱
        # ```json 블록 제거
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        summary = json.loads(content)

        return {
            "summary": summary.get("summary", "요약을 생성할 수 없습니다."),
            "keyPoints": summary.get("key_points", []),
            "decisions": summary.get("decisions", []),
            "actionItems": summary.get("action_items", []),
            "keyQuestions": summary.get("key_questions", used_questions[:5]),
            "missedQuestions": summary.get("missed_questions", unused_questions[:5]),
            "suggestedDataUpdates": summary.get("suggested_data_updates", {}),
            "nextMeetingAgenda": summary.get("next_meeting_agenda", []),
        }

    except json.JSONDecodeError:
        # JSON 파싱 실패 시 폴백
        return generate_fallback_summary(transcripts, questions)
    except Exception as e:
        print(f"Summary generation error: {e}")
        return generate_fallback_summary(transcripts, questions)


def generate_fallback_summary(
    transcripts: List[Dict[str, Any]],
    questions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """폴백 요약 생성"""
    transcript_text = " ".join([t['text'] for t in transcripts])

    # 간단한 키워드 추출
    key_points = []
    keywords = ['MRR', 'CAC', 'LTV', 'Churn', '매출', '투자', '성장률', '팀', '기술', '고객']

    for keyword in keywords:
        if keyword in transcript_text:
            sentences = transcript_text.split('.')
            for s in sentences:
                if keyword in s and len(s.strip()) > 10:
                    key_points.append(s.strip()[:100])
                    break

    used_questions = [q['text'] for q in questions if q.get('is_used')][:5]
    unused_questions = [q['text'] for q in questions if not q.get('is_used')][:5]

    return {
        "summary": f"회의가 {len(transcripts)}개의 발화로 진행되었습니다. {len(key_points)}개의 주요 키워드가 논의되었습니다.",
        "keyPoints": key_points[:5],
        "decisions": [],
        "actionItems": [],
        "keyQuestions": used_questions,
        "missedQuestions": unused_questions,
        "suggestedDataUpdates": {},
        "nextMeetingAgenda": unused_questions[:3],
    }
