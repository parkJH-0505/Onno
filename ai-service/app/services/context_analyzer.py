"""
맥락 분석기 (Context Analyzer)
- 이미 언급된 주제 추출
- 중복 질문 필터링
"""

import re
from typing import List, Dict, Set
import logging

logger = logging.getLogger(__name__)

# 주요 지표/용어 패턴
METRIC_PATTERNS = {
    'MRR': r'\bMRR\b|월\s*반복\s*매출|월간\s*매출',
    'ARR': r'\bARR\b|연\s*반복\s*매출|연간\s*매출',
    'CAC': r'\bCAC\b|고객\s*획득\s*비용|획득\s*비용',
    'LTV': r'\bLTV\b|고객\s*생애\s*가치|생애\s*가치',
    'CHURN': r'이탈률|Churn|해지율|이탈\s*고객',
    'NPS': r'\bNPS\b|순\s*추천\s*지수',
    'MAU': r'\bMAU\b|월간\s*활성',
    'DAU': r'\bDAU\b|일간\s*활성',
    'GMV': r'\bGMV\b|총\s*거래액',
    'RETENTION': r'리텐션|재구매율|유지율',
    'BURN_RATE': r'번\s*레이트|Burn\s*Rate|월\s*소진',
    'RUNWAY': r'런웨이|Runway|자금\s*소진',
}

# 주요 토픽 패턴
TOPIC_PATTERNS = {
    'BUSINESS_MODEL': r'비즈니스\s*모델|수익\s*모델|매출\s*구조|BM',
    'TEAM': r'팀\s*구성|공동\s*창업|창업\s*팀|CTO|CEO|COO',
    'MARKET': r'시장\s*규모|TAM|SAM|SOM|시장\s*점유율|경쟁사|경쟁\s*업체',
    'TECHNOLOGY': r'기술\s*스택|핵심\s*기술|특허|기술적\s*우위|기술\s*장벽',
    'TRACTION': r'트랙션|고객\s*수|사용자\s*수|매출|성장률|성장\s*추이',
    'FUNDING': r'투자\s*유치|시리즈|시드|프리시드|투자금|밸류에이션',
    'RISKS': r'리스크|위험\s*요소|챌린지|도전\s*과제',
    'COMPETITION': r'경쟁\s*우위|차별화|진입\s*장벽|해자|moat',
    'CUSTOMER': r'타겟\s*고객|목표\s*고객|고객층|페르소나|ICP',
    'PRODUCT': r'제품\s*특징|핵심\s*기능|MVP|프로덕트',
}


def extract_mentioned_topics(transcripts: List[str]) -> Dict[str, Set[str]]:
    """
    전사 내용에서 이미 언급된 주제/지표 추출

    Args:
        transcripts: 전사 텍스트 리스트

    Returns:
        {
            "metrics_mentioned": {"MRR", "CAC", ...},
            "topics_discussed": {"BUSINESS_MODEL", "TEAM", ...},
            "keywords_found": {"월매출", "창업팀", ...}
        }
    """
    combined_text = " ".join(transcripts)

    metrics_mentioned = set()
    topics_discussed = set()
    keywords_found = set()

    # 지표 추출
    for metric, pattern in METRIC_PATTERNS.items():
        matches = re.findall(pattern, combined_text, re.IGNORECASE)
        if matches:
            metrics_mentioned.add(metric)
            keywords_found.update(matches)

    # 토픽 추출
    for topic, pattern in TOPIC_PATTERNS.items():
        matches = re.findall(pattern, combined_text, re.IGNORECASE)
        if matches:
            topics_discussed.add(topic)
            keywords_found.update(matches)

    logger.info(f"Extracted metrics: {metrics_mentioned}")
    logger.info(f"Extracted topics: {topics_discussed}")

    return {
        "metrics_mentioned": metrics_mentioned,
        "topics_discussed": topics_discussed,
        "keywords_found": keywords_found,
    }


def extract_answered_questions(transcripts: List[str]) -> List[str]:
    """
    전사 내용에서 이미 답변된 질문/정보 추출

    특정 패턴을 찾아 이미 언급된 정보를 식별:
    - "~입니다", "~있습니다" 형태의 답변
    - 숫자 + 단위 형태의 정보 (100만원, 50%, 10명 등)
    """
    combined_text = " ".join(transcripts)
    answered = []

    # 숫자 정보가 포함된 문장 추출
    number_patterns = [
        r'[0-9,]+\s*만?\s*원',  # 금액
        r'[0-9]+\s*%',  # 퍼센트
        r'[0-9]+\s*명',  # 인원
        r'[0-9]+\s*개월',  # 기간
        r'[0-9]+\s*년',  # 연도
    ]

    for pattern in number_patterns:
        matches = re.findall(f'.{{0,50}}{pattern}.{{0,50}}', combined_text)
        answered.extend(matches)

    return list(set(answered))[:10]  # 최대 10개


def filter_redundant_questions(
    questions: List[Dict],
    mentioned_context: Dict[str, Set[str]]
) -> List[Dict]:
    """
    이미 언급된 내용과 관련된 질문 필터링

    Args:
        questions: 생성된 질문 리스트 [{"text": "...", "category": "...", ...}]
        mentioned_context: extract_mentioned_topics 결과

    Returns:
        필터링된 질문 리스트
    """
    metrics = mentioned_context.get("metrics_mentioned", set())
    topics = mentioned_context.get("topics_discussed", set())
    keywords = mentioned_context.get("keywords_found", set())

    filtered = []

    for question in questions:
        text = question.get("text", "").lower()
        category = question.get("category", "").upper()

        # 이미 언급된 지표에 대한 질문인지 확인
        is_redundant = False

        # 카테고리가 이미 충분히 논의된 토픽인지 확인
        category_map = {
            'BUSINESS_MODEL': 'BUSINESS_MODEL',
            'TRACTION': 'TRACTION',
            'TEAM': 'TEAM',
            'MARKET': 'MARKET',
            'TECHNOLOGY': 'TECHNOLOGY',
            'FINANCIALS': 'FUNDING',
            'RISKS': 'RISKS',
        }

        mapped_topic = category_map.get(category)
        if mapped_topic and mapped_topic in topics:
            # 해당 토픽이 이미 논의되었지만, 추가 질문이 필요할 수 있음
            # 키워드 기반으로 더 정밀하게 확인
            for keyword in keywords:
                if keyword.lower() in text:
                    is_redundant = True
                    logger.info(f"Filtered redundant question (keyword match): {text[:50]}...")
                    break

        # 지표 관련 중복 확인
        for metric in metrics:
            metric_lower = metric.lower()
            if metric_lower in text or metric_lower.replace('_', ' ') in text:
                is_redundant = True
                logger.info(f"Filtered redundant question (metric match): {text[:50]}...")
                break

        if not is_redundant:
            filtered.append(question)

    logger.info(f"Filtered {len(questions) - len(filtered)} redundant questions")
    return filtered


def get_conversation_stage(transcripts: List[str]) -> str:
    """
    대화 단계 추정

    Returns:
        'introduction': 초반 (인사, 회사 소개)
        'deep_dive': 중반 (상세 질문)
        'closing': 후반 (마무리, 다음 단계)
    """
    if not transcripts:
        return 'introduction'

    combined_text = " ".join(transcripts[-5:])  # 최근 5개 발화 기준
    word_count = len(combined_text.split())

    # 마무리 키워드
    closing_keywords = ['다음 단계', '감사합니다', '연락드리겠', '검토', '마무리', '정리하면']
    for keyword in closing_keywords:
        if keyword in combined_text:
            return 'closing'

    # 단어 수 기반 추정
    total_words = sum(len(t.split()) for t in transcripts)
    if total_words < 200:
        return 'introduction'
    elif total_words > 1000:
        return 'closing'
    else:
        return 'deep_dive'


def build_context_for_prompt(
    transcripts: List[str],
    mentioned_context: Dict = None
) -> str:
    """
    질문 생성 프롬프트에 포함할 맥락 문자열 생성
    """
    if mentioned_context is None:
        mentioned_context = extract_mentioned_topics(transcripts)

    metrics = mentioned_context.get("metrics_mentioned", set())
    topics = mentioned_context.get("topics_discussed", set())

    context_parts = []

    if metrics:
        context_parts.append(f"이미 언급된 지표: {', '.join(metrics)}")

    if topics:
        topic_names = {
            'BUSINESS_MODEL': '비즈니스 모델',
            'TEAM': '팀 구성',
            'MARKET': '시장',
            'TECHNOLOGY': '기술',
            'TRACTION': '트랙션',
            'FUNDING': '투자/자금',
            'RISKS': '리스크',
            'COMPETITION': '경쟁',
            'CUSTOMER': '고객',
            'PRODUCT': '제품',
        }
        topic_korean = [topic_names.get(t, t) for t in topics]
        context_parts.append(f"이미 논의된 주제: {', '.join(topic_korean)}")

    stage = get_conversation_stage(transcripts)
    stage_names = {
        'introduction': '초반 (회사 소개 단계)',
        'deep_dive': '중반 (상세 검토 단계)',
        'closing': '후반 (마무리 단계)',
    }
    context_parts.append(f"대화 단계: {stage_names.get(stage, stage)}")

    return "\n".join(context_parts) if context_parts else "맥락 정보 없음"
