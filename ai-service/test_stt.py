"""
STT (Speech-to-Text) 테스트 스크립트
OpenAI Whisper API를 사용하여 오디오 파일의 전사 정확도와 Latency를 측정합니다.
"""

from openai import OpenAI
import time
import os
from dotenv import load_dotenv
import sys

# 환경 변수 로드
load_dotenv()

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def test_transcription(audio_file_path):
    """
    단일 오디오 파일에 대한 STT 테스트 수행

    Args:
        audio_file_path: 오디오 파일 경로 (MP3, WAV, M4A 등)

    Returns:
        dict: 전사 결과 및 성능 지표
    """
    print(f"\n{'='*70}")
    print(f"🎤 Testing: {audio_file_path}")
    print(f"{'='*70}")

    if not os.path.exists(audio_file_path):
        print(f"❌ Error: File not found - {audio_file_path}")
        return None

    # 파일 크기 확인
    file_size_mb = os.path.getsize(audio_file_path) / (1024 * 1024)
    print(f"📦 File size: {file_size_mb:.2f} MB")

    # STT 시작
    start_time = time.time()

    try:
        with open(audio_file_path, 'rb') as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ko",  # 한국어 명시
                response_format="verbose_json"  # 상세 정보 포함
            )

        latency = time.time() - start_time

        # 결과 출력
        print(f"\n📝 전사 결과:")
        print(f"{response.text}\n")
        print(f"⏱️  Latency: {latency:.2f}초")
        print(f"📊 오디오 길이: {response.duration:.2f}초")
        print(f"📈 처리 속도: {response.duration / latency:.2f}x (실시간 대비)")
        print(f"✅ 상태: {'PASS' if latency < 3.0 else 'SLOW'} (목표: <3초)")

        return {
            "text": response.text,
            "duration": response.duration,
            "latency": latency,
            "file": os.path.basename(audio_file_path),
            "file_size_mb": file_size_mb,
            "processing_speed": response.duration / latency
        }

    except Exception as e:
        print(f"\n❌ Error during transcription:")
        print(f"   {str(e)}")
        return None


def test_multiple_samples(sample_paths):
    """
    여러 오디오 샘플에 대한 배치 테스트 수행

    Args:
        sample_paths: 오디오 파일 경로 리스트

    Returns:
        list: 모든 테스트 결과
    """
    results = []

    print("\n" + "="*70)
    print("🚀 Starting STT Batch Test")
    print("="*70)

    for i, sample_path in enumerate(sample_paths, 1):
        print(f"\n[{i}/{len(sample_paths)}] Processing...")
        result = test_transcription(sample_path)
        if result:
            results.append(result)

        # API Rate Limit 고려하여 대기
        if i < len(sample_paths):
            print("\n⏳ Waiting 2 seconds before next test...")
            time.sleep(2)

    return results


def print_summary(results):
    """
    테스트 결과 요약 출력

    Args:
        results: 테스트 결과 리스트
    """
    if not results:
        print("\n❌ No successful test results to summarize.")
        return

    print("\n" + "="*70)
    print("📊 TEST SUMMARY")
    print("="*70)

    # 평균 지표 계산
    avg_latency = sum(r['latency'] for r in results) / len(results)
    avg_duration = sum(r['duration'] for r in results) / len(results)
    avg_processing_speed = sum(r['processing_speed'] for r in results) / len(results)

    print(f"\n📈 Performance Metrics:")
    print(f"   - Tests Completed: {len(results)}")
    print(f"   - Average Latency: {avg_latency:.2f}초")
    print(f"   - Average Audio Duration: {avg_duration:.2f}초")
    print(f"   - Average Processing Speed: {avg_processing_speed:.2f}x")

    # 목표 달성 여부
    print(f"\n🎯 Goal Achievement:")
    latency_goal = avg_latency < 3.0
    print(f"   - Latency < 3초: {'✅ PASS' if latency_goal else '❌ FAIL'}")
    print(f"   - Processing Speed > 1x: {'✅ PASS' if avg_processing_speed > 1.0 else '❌ FAIL'}")

    # 개별 결과
    print(f"\n📋 Individual Results:")
    for i, result in enumerate(results, 1):
        status_icon = "✅" if result['latency'] < 3.0 else "⚠️"
        print(f"   {status_icon} {i}. {result['file']}: {result['latency']:.2f}초 (audio: {result['duration']:.2f}초)")


def main():
    """
    메인 실행 함수
    """
    print("\n" + "="*70)
    print("🎙️  Onno STT Test Suite")
    print("="*70)

    # 테스트 데이터 디렉토리 확인
    test_data_dir = os.path.join("..", "test-data", "audio-samples")

    # 명령행 인자로 파일 경로를 받을 수 있도록
    if len(sys.argv) > 1:
        # 특정 파일 테스트
        sample_paths = sys.argv[1:]
        print(f"\n📁 Testing {len(sample_paths)} specified file(s)")
    else:
        # 기본 샘플 파일들
        sample_files = [
            "sample-1-vc-pitch.mp3",
            "sample-2-mentor-call.mp3",
            "sample-3-sales-call.mp3"
        ]
        sample_paths = [os.path.join(test_data_dir, f) for f in sample_files]
        print(f"\n📁 Looking for test samples in: {test_data_dir}")

        # 존재하는 파일만 필터링
        sample_paths = [p for p in sample_paths if os.path.exists(p)]

        if not sample_paths:
            print(f"\n⚠️  No test audio files found in {test_data_dir}")
            print(f"\nℹ️  You can:")
            print(f"   1. Place audio files in: {test_data_dir}/")
            print(f"   2. Or run: python test_stt.py <audio_file_path>")
            print(f"\nℹ️  For testing purposes, you can use any Korean audio file (mp3, wav, m4a)")
            return

        print(f"✅ Found {len(sample_paths)} test file(s)")

    # 배치 테스트 실행
    results = test_multiple_samples(sample_paths)

    # 결과 요약
    print_summary(results)

    print("\n" + "="*70)
    print("✅ Test completed!")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
