"""
AI API 실제 검증 테스트 스크립트

이 스크립트는 Claude API (질문 생성) + OpenAI Whisper (STT)를 테스트합니다.
실행 전 .env에서 MOCK_MODE=false로 설정하세요.

실행 방법:
    cd ai-service
    python -m tests.test_openai_api
"""

import asyncio
import time
import json
import os
import sys
from pathlib import Path

# 프로젝트 루트 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from app.services.stt import transcribe_audio, get_client as get_openai_client
from app.services.question_generator import generate_questions, get_client as get_claude_client

# 테스트용 한국어 VC 미팅 샘플 전사 텍스트
SAMPLE_TRANSCRIPTS = {
    "scenario_1_cac_no_ltv": """
        안녕하세요, 저희 스타트업 소개를 드리겠습니다.
        저희는 B2B SaaS 솔루션을 제공하고 있고요, 현재 월간 활성 사용자가 약 5만명 정도 됩니다.
        고객 획득 비용, CAC는 현재 약 15만원 수준이고요,
        마케팅 채널은 주로 Google Ads와 LinkedIn을 활용하고 있습니다.
        지난 분기 매출은 2억원이었고, 전분기 대비 30% 성장했습니다.
    """,

    "scenario_2_mrr_no_churn": """
        저희 비즈니스 모델 설명드리겠습니다.
        현재 MRR은 약 5천만원이고요, ARR로 환산하면 6억원 정도 됩니다.
        주요 고객층은 중소기업이고, ARPU는 월 20만원 수준입니다.
        신규 고객 유입은 월 50개사 정도 되고 있고요,
        가격 정책은 시트당 과금 모델을 사용하고 있습니다.
    """,

    "scenario_3_team_no_key_hire": """
        팀 소개를 드리면, 현재 총 15명의 팀원이 있습니다.
        대표인 저는 이전에 네이버에서 5년간 PM으로 일했고요,
        CTO는 카카오 출신으로 백엔드 개발 경력 8년입니다.
        개발팀이 7명, 비즈니스팀이 5명, 운영팀이 3명입니다.
        모두 스톡옵션을 부여받았고, 베스팅 기간은 4년입니다.
    """,

    "scenario_4_market_no_competitor": """
        시장 규모 말씀드리면, TAM은 약 10조원 규모입니다.
        저희가 타겟하는 SAM은 그중 1조원 정도이고요,
        현재 저희 SOM은 약 100억원 수준입니다.
        시장 성장률은 연간 25% 정도로 빠르게 성장하고 있고요,
        특히 코로나 이후 디지털 전환 수요가 급증했습니다.
    """,

    "scenario_5_product_no_target": """
        저희 제품은 AI 기반 문서 분석 솔루션입니다.
        핵심 기능은 자동 문서 분류, 핵심 정보 추출, 요약 생성입니다.
        기술적으로는 GPT-4와 자체 파인튜닝 모델을 결합했고요,
        평균 처리 시간은 문서당 3초 미만입니다.
        API 형태로도 제공하고 있어서 기존 시스템과 연동이 쉽습니다.
    """
}

# 예상되는 질문 카테고리
EXPECTED_QUESTIONS = {
    "scenario_1_cac_no_ltv": ["LTV", "고객 유지율", "Payback Period", "생애가치"],
    "scenario_2_mrr_no_churn": ["Churn Rate", "NRR", "고객 이탈", "해지율"],
    "scenario_3_team_no_key_hire": ["채용 계획", "핵심 인재", "기술 역량", "CXO"],
    "scenario_4_market_no_competitor": ["경쟁사", "차별화", "진입 장벽", "경쟁"],
    "scenario_5_product_no_target": ["타겟 고객", "고객 세그먼트", "PMF", "ICP"]
}


class TestResult:
    """테스트 결과를 저장하는 클래스"""
    def __init__(self):
        self.results = []
        self.total_latency = 0
        self.total_tests = 0
        self.passed = 0
        self.failed = 0

    def add_result(self, test_name: str, success: bool, latency: float, details: dict):
        self.results.append({
            "test_name": test_name,
            "success": success,
            "latency": latency,
            "details": details
        })
        self.total_tests += 1
        self.total_latency += latency
        if success:
            self.passed += 1
        else:
            self.failed += 1

    def get_summary(self) -> dict:
        return {
            "total_tests": self.total_tests,
            "passed": self.passed,
            "failed": self.failed,
            "success_rate": f"{(self.passed / self.total_tests * 100):.1f}%" if self.total_tests > 0 else "N/A",
            "avg_latency": f"{(self.total_latency / self.total_tests):.2f}s" if self.total_tests > 0 else "N/A",
            "results": self.results
        }


async def test_claude_connection():
    """Claude API 연결 테스트"""
    print("\n" + "="*60)
    print("TEST 1: Claude API 연결 테스트")
    print("="*60)

    try:
        client = get_claude_client()

        start = time.time()
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=50,
            messages=[{"role": "user", "content": "Hello, respond with just 'OK'"}]
        )
        latency = time.time() - start

        result = message.content[0].text
        print(f"  Response: {result}")
        print(f"  Latency: {latency:.2f}s")
        print(f"  Status: PASS")

        return True, latency, {"response": result}

    except Exception as e:
        print(f"  Error: {str(e)}")
        print(f"  Status: FAIL")
        return False, 0, {"error": str(e)}


async def test_question_generation():
    """질문 생성 API 테스트 (5개 시나리오) - Claude"""
    print("\n" + "="*60)
    print("TEST 2: 질문 생성 API 테스트 (Claude Sonnet)")
    print("="*60)

    test_result = TestResult()

    for scenario_name, transcript in SAMPLE_TRANSCRIPTS.items():
        print(f"\n  [{scenario_name}]")
        print(f"  Transcript: {transcript[:50].strip()}...")

        try:
            start = time.time()
            result = await generate_questions(transcript)
            latency = time.time() - start

            questions = result.get("questions", [])
            print(f"  Generated {len(questions)} questions in {latency:.2f}s")

            # 각 질문 출력
            for i, q in enumerate(questions, 1):
                priority = q.get('priority', 'N/A')
                text = q.get('text', 'N/A')[:60]
                category = q.get('category', 'N/A')
                reason = q.get('reason', 'N/A')[:40]
                print(f"    Q{i}: [{priority}] {text}...")
                print(f"        Category: {category}, Reason: {reason}...")

            # 품질 평가: 예상 키워드 포함 여부
            expected = EXPECTED_QUESTIONS.get(scenario_name, [])
            all_text = " ".join([q.get("text", "") + " " + q.get("reason", "") for q in questions])
            matches = sum(1 for keyword in expected if keyword.lower() in all_text.lower())
            quality_score = matches / len(expected) if expected else 0

            print(f"  Quality Score: {quality_score:.0%} (matched {matches}/{len(expected)} expected keywords)")

            success = len(questions) >= 1 and latency < 15
            test_result.add_result(
                scenario_name,
                success,
                latency,
                {
                    "questions_count": len(questions),
                    "quality_score": quality_score,
                    "questions": questions
                }
            )

        except Exception as e:
            print(f"  Error: {str(e)}")
            test_result.add_result(scenario_name, False, 0, {"error": str(e)})

    return test_result


async def test_whisper_api():
    """Whisper STT API 테스트 (파일 기반)"""
    print("\n" + "="*60)
    print("TEST 3: Whisper STT API 테스트 (OpenAI)")
    print("="*60)

    # 테스트 오디오 파일 경로
    audio_dir = Path(__file__).parent.parent.parent / "test-data" / "audio-samples"

    # 오디오 파일 찾기
    audio_files = list(audio_dir.glob("*.mp3")) + list(audio_dir.glob("*.wav")) + list(audio_dir.glob("*.webm"))

    if not audio_files:
        print("  [WARNING] No audio files found in test-data/audio-samples/")
        print("  To test STT, add .mp3, .wav, or .webm files to the directory.")
        print("  Skipping Whisper API test...")
        return None

    test_result = TestResult()

    for audio_file in audio_files[:3]:  # 최대 3개 파일만 테스트
        print(f"\n  Testing: {audio_file.name}")

        try:
            with open(audio_file, "rb") as f:
                start = time.time()
                result = await transcribe_audio(f)
                latency = time.time() - start

            text = result.get("text", "")
            duration = result.get("duration", 0)

            print(f"  Duration: {duration:.1f}s")
            print(f"  Latency: {latency:.2f}s")
            print(f"  Text: {text[:100]}..." if len(text) > 100 else f"  Text: {text}")

            success = len(text) > 0 and latency < 30
            test_result.add_result(
                audio_file.name,
                success,
                latency,
                {
                    "text": text,
                    "duration": duration,
                    "text_length": len(text)
                }
            )

        except Exception as e:
            print(f"  Error: {str(e)}")
            test_result.add_result(audio_file.name, False, 0, {"error": str(e)})

    return test_result


def print_summary(connection_result, question_result, stt_result):
    """테스트 결과 요약 출력"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    print("\n[1] Claude API Connection Test")
    print(f"    Status: {'PASS' if connection_result[0] else 'FAIL'}")
    print(f"    Latency: {connection_result[1]:.2f}s")

    print("\n[2] Question Generation Test (Claude Sonnet)")
    summary = question_result.get_summary()
    print(f"    Total: {summary['total_tests']} scenarios")
    print(f"    Passed: {summary['passed']}")
    print(f"    Failed: {summary['failed']}")
    print(f"    Success Rate: {summary['success_rate']}")
    print(f"    Avg Latency: {summary['avg_latency']}")

    # 평균 품질 점수
    quality_scores = [r['details'].get('quality_score', 0) for r in summary['results'] if 'quality_score' in r['details']]
    if quality_scores:
        avg_quality = sum(quality_scores) / len(quality_scores)
        print(f"    Avg Quality Score: {avg_quality:.0%}")

    print("\n[3] Whisper STT Test (OpenAI)")
    if stt_result:
        stt_summary = stt_result.get_summary()
        print(f"    Total: {stt_summary['total_tests']} files")
        print(f"    Passed: {stt_summary['passed']}")
        print(f"    Failed: {stt_summary['failed']}")
        print(f"    Avg Latency: {stt_summary['avg_latency']}")
    else:
        print("    Status: SKIPPED (no audio files)")

    print("\n" + "="*60)
    print("API COST ESTIMATION")
    print("="*60)

    # Claude 비용 추정 (Sonnet: input $3/1M, output $15/1M)
    total_input_chars = sum(len(t) for t in SAMPLE_TRANSCRIPTS.values())
    est_input_tokens = total_input_chars / 4  # 대략적인 토큰 추정
    est_output_tokens = len(summary['results']) * 400  # 각 응답당 약 400토큰

    claude_input_cost = (est_input_tokens / 1000000) * 3.00
    claude_output_cost = (est_output_tokens / 1000000) * 15.00

    print(f"  Claude Sonnet (Question Gen):")
    print(f"    Est. Input Tokens: ~{int(est_input_tokens)}")
    print(f"    Est. Output Tokens: ~{int(est_output_tokens)}")
    print(f"    Est. Cost: ${claude_input_cost + claude_output_cost:.4f}")

    # Whisper 비용 추정 ($0.006/minute)
    if stt_result:
        total_duration = sum(r['details'].get('duration', 0) for r in stt_result.results if 'duration' in r.get('details', {}))
        whisper_cost = (total_duration / 60) * 0.006
        print(f"\n  Whisper (STT):")
        print(f"    Total Duration: {total_duration:.1f}s")
        print(f"    Est. Cost: ${whisper_cost:.4f}")

    print("\n" + "="*60)

    # 결과를 JSON 파일로 저장
    output = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "connection_test": {
            "success": connection_result[0],
            "latency": connection_result[1],
            "details": connection_result[2]
        },
        "question_generation_test": summary,
        "stt_test": stt_result.get_summary() if stt_result else None
    }

    output_path = Path(__file__).parent.parent.parent / "test-data" / "api-test-results.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nResults saved to: {output_path}")


async def main():
    """메인 테스트 실행"""
    print("\n" + "="*60)
    print("ONNO - AI API Verification Test")
    print("Claude (Question Gen) + OpenAI Whisper (STT)")
    print("="*60)

    mock_mode = os.getenv("MOCK_MODE", "false").lower() == "true"
    print(f"\nMOCK_MODE: {mock_mode}")

    if mock_mode:
        print("\n[WARNING] MOCK_MODE is enabled!")
        print("To test real API, set MOCK_MODE=false in .env")
        print("Continuing with mock mode for demonstration...\n")

    print(f"ANTHROPIC_API_KEY: {'Set' if os.getenv('ANTHROPIC_API_KEY') else 'NOT SET'}")
    print(f"OPENAI_API_KEY: {'Set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")

    # 테스트 실행
    connection_result = await test_claude_connection()
    question_result = await test_question_generation()
    stt_result = await test_whisper_api()

    # 결과 요약
    print_summary(connection_result, question_result, stt_result)


if __name__ == "__main__":
    asyncio.run(main())