"""
Question Generation 테스트 스크립트
GPT-4o를 사용하여 대화 전사 내용에서 VC 질문을 생성하고 품질을 평가합니다.
"""

import asyncio
from app.services.question_generator import generate_questions
import time
import json

# 테스트 시나리오 (VC 투자 심사 시뮬레이션)
TEST_TRANSCRIPTS = [
    {
        "name": "Scenario 1: Early Stage SaaS Startup",
        "transcript": """
        창업자: 안녕하세요, 저희는 AI 기반 B2B SaaS 스타트업 'DataFlow'입니다.
        투자자: 반갑습니다. 현재 매출 현황은 어떻게 되나요?
        창업자: 현재 MRR은 3천만원이고, 고객사는 25개입니다.
        투자자: 성장률은 어느 정도인가요?
        창업자: 지난 6개월간 월평균 15% 성장하고 있습니다.
        투자자: 주요 고객층은 어디인가요?
        창업자: 주로 100명 이하 규모의 중소기업입니다. ARPU는 월 120만원 정도입니다.
        투자자: 경쟁사는 어떻게 보시나요?
        창업자: 해외에는 유사 솔루션이 있지만, 국내에서는 저희가 퍼스트무버입니다.
        """
    },
    {
        "name": "Scenario 2: Growth Stage E-commerce",
        "transcript": """
        창업자: 저희는 패션 커머스 플랫폼 'StyleHub'를 운영하고 있습니다.
        투자자: 현재 GMV는 얼마나 되나요?
        창업자: 지난달 GMV는 50억이었고, 연간으로는 500억 정도 예상됩니다.
        투자자: Take Rate는 어떻게 되나요?
        창업자: 현재 15%이고, 점차 20%까지 올릴 계획입니다.
        투자자: 마케팅 비용은 매출 대비 얼마나 쓰시나요?
        창업자: CAC가 15만원 정도이고, 첫 구매 LTV가 30만원입니다.
        투자자: 재구매율은 어떤가요?
        창업자: 3개월 재구매율이 40%정도입니다.
        """
    },
    {
        "name": "Scenario 3: Pre-Revenue AI Startup",
        "transcript": """
        창업자: 저희는 의료 AI 진단 솔루션을 개발하고 있습니다.
        투자자: 현재 개발 진행 상황은 어떤가요?
        창업자: MVP는 완성했고, 현재 3개 병원에서 파일럿 테스트 중입니다.
        투자자: 정확도는 어느 정도인가요?
        창업자: 현재 임상 데이터 기준 87% 정확도를 보이고 있습니다.
        투자자: 팀 구성은 어떻게 되나요?
        창업자: 공동 창업자 3명 모두 의료 AI 박사 출신이고, 개발자 5명이 있습니다.
        투자자: 규제 이슈는 어떻게 대응하시나요?
        창업자: 현재 식약처 인증 절차를 진행 중이고, 내년 상반기 완료 예상입니다.
        """
    }
]


async def test_single_transcript(scenario):
    """
    단일 전사 내용에 대한 질문 생성 테스트

    Args:
        scenario: dict with 'name' and 'transcript'

    Returns:
        dict: 테스트 결과
    """
    print(f"\n{'='*70}")
    print(f"[TEST] {scenario['name']}")
    print(f"{'='*70}")

    print(f"\nInput Transcript:")
    print(scenario['transcript'][:200] + "..." if len(scenario['transcript']) > 200 else scenario['transcript'])

    # 질문 생성 시작
    start_time = time.time()

    try:
        result = await generate_questions(scenario['transcript'])
        latency = time.time() - start_time

        # 결과 출력
        print(f"\n[SUCCESS] Generated {len(result['questions'])} questions in {latency:.2f}s")
        print(f"\nGenerated Questions:")

        for i, q in enumerate(result['questions'], 1):
            priority_symbol = "[!]" if q['priority'] == 'critical' else "[*]" if q['priority'] == 'important' else "[-]"
            print(f"\n{i}. {priority_symbol} [{q['category'].upper()}] {q['priority']}")
            print(f"   Q: {q['text']}")
            print(f"   R: {q['reason']}")

        return {
            "scenario": scenario['name'],
            "latency": latency,
            "question_count": len(result['questions']),
            "questions": result['questions'],
            "success": True
        }

    except Exception as e:
        print(f"\n[ERROR] Error during question generation:")
        print(f"   {str(e)}")
        return {
            "scenario": scenario['name'],
            "success": False,
            "error": str(e)
        }


async def test_batch():
    """
    배치 테스트 실행
    """
    print("\n" + "="*70)
    print("Starting Question Generation Batch Test")
    print("="*70)

    results = []

    for i, scenario in enumerate(TEST_TRANSCRIPTS, 1):
        print(f"\n[{i}/{len(TEST_TRANSCRIPTS)}] Processing scenario...")
        result = await test_single_transcript(scenario)
        results.append(result)

        # API Rate Limit 고려하여 대기
        if i < len(TEST_TRANSCRIPTS):
            print("\n[WAIT] Waiting 3 seconds before next test...")
            await asyncio.sleep(3)

    return results


def print_summary(results):
    """
    테스트 결과 요약 출력
    """
    successful_tests = [r for r in results if r.get('success', False)]

    if not successful_tests:
        print("\n[ERROR] No successful tests to summarize.")
        return

    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)

    # 평균 지표
    avg_latency = sum(r['latency'] for r in successful_tests) / len(successful_tests)
    avg_questions = sum(r['question_count'] for r in successful_tests) / len(successful_tests)

    print(f"\nPerformance Metrics:")
    print(f"   - Total Tests: {len(results)}")
    print(f"   - Successful: {len(successful_tests)}")
    print(f"   - Failed: {len(results) - len(successful_tests)}")
    print(f"   - Average Latency: {avg_latency:.2f}s")
    print(f"   - Average Questions per Transcript: {avg_questions:.1f}")

    # 목표 달성 여부
    print(f"\nGoal Achievement:")
    latency_pass = avg_latency < 5.0
    question_pass = avg_questions >= 3
    print(f"   - Latency < 5s: {'[PASS]' if latency_pass else '[FAIL]'} ({avg_latency:.2f}s)")
    print(f"   - Questions >= 3: {'[PASS]' if question_pass else '[FAIL]'} ({avg_questions:.1f})")

    # 질문 카테고리 분석
    all_categories = []
    all_priorities = []
    for r in successful_tests:
        for q in r['questions']:
            all_categories.append(q['category'])
            all_priorities.append(q['priority'])

    print(f"\nQuestion Analytics:")
    print(f"   - Category Distribution:")
    for cat in set(all_categories):
        count = all_categories.count(cat)
        percentage = (count / len(all_categories)) * 100
        print(f"     • {cat}: {count} ({percentage:.1f}%)")

    print(f"   - Priority Distribution:")
    for pri in set(all_priorities):
        count = all_priorities.count(pri)
        percentage = (count / len(all_priorities)) * 100
        print(f"     • {pri}: {count} ({percentage:.1f}%)")

    # 개별 결과
    print(f"\nIndividual Results:")
    for r in successful_tests:
        status_icon = "[OK]" if r['latency'] < 5.0 else "[SLOW]"
        print(f"   {status_icon} {r['scenario']}: {r['latency']:.2f}s, {r['question_count']} questions")

    # 실패한 테스트
    failed_tests = [r for r in results if not r.get('success', False)]
    if failed_tests:
        print(f"\nFailed Tests:")
        for r in failed_tests:
            print(f"   - {r['scenario']}: {r.get('error', 'Unknown error')}")


async def main():
    """
    메인 실행 함수
    """
    print("\n" + "="*70)
    print("Onno Question Generation Test Suite")
    print("="*70)

    # 배치 테스트 실행
    results = await test_batch()

    # 결과 요약
    print_summary(results)

    # 결과를 JSON 파일로 저장
    output_file = "../test-data/question-gen-results.json"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\n[SAVE] Results saved to: {output_file}")
    except Exception as e:
        print(f"\n[WARN] Could not save results: {e}")

    print("\n" + "="*70)
    print("[DONE] Test completed!")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
