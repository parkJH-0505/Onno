"""
Daglo STT Service - 화자 분리 및 타임스탬프 지원
https://developers.daglo.ai/guide/STT-Async.html
"""

import time
import os
import asyncio
import httpx
from typing import BinaryIO
from dotenv import load_dotenv

load_dotenv()

# Daglo API 설정
DAGLO_API_TOKEN = os.getenv("DAGLO_API_TOKEN")
DAGLO_ASYNC_URL = "https://apis.daglo.ai/stt/v1/async/transcripts"
DAGLO_SYNC_URL = "https://apis.daglo.ai/stt/v1/sync/transcripts"

# Whisper fallback용 OpenAI 클라이언트 (필요시)
_openai_client = None


def get_openai_client():
    """OpenAI 클라이언트 (Whisper fallback용)"""
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client


def format_timestamp(seconds: float) -> str:
    """초를 MM:SS 형식으로 변환"""
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"


def format_transcript_with_speakers(segments: list) -> str:
    """
    화자별로 구분된 전사 텍스트 포맷팅

    출력 형식:
    화자1 00:02
    발화 내용...

    화자2 01:29
    발화 내용...
    """
    formatted_lines = []
    current_speaker = None
    current_text = []
    current_start = 0

    for segment in segments:
        speaker = segment.get("speaker", "화자")
        text = segment.get("text", "").strip()
        start_time = segment.get("startTime", 0)

        if speaker != current_speaker:
            # 이전 화자의 텍스트 저장
            if current_speaker and current_text:
                timestamp = format_timestamp(current_start)
                formatted_lines.append(f"{current_speaker} {timestamp}")
                formatted_lines.append(" ".join(current_text))
                formatted_lines.append("")

            # 새 화자 시작
            current_speaker = speaker
            current_text = [text] if text else []
            current_start = start_time
        else:
            if text:
                current_text.append(text)

    # 마지막 화자 텍스트 저장
    if current_speaker and current_text:
        timestamp = format_timestamp(current_start)
        formatted_lines.append(f"{current_speaker} {timestamp}")
        formatted_lines.append(" ".join(current_text))

    return "\n".join(formatted_lines)


async def upload_audio_and_get_url(audio_file: BinaryIO) -> str:
    """
    오디오 파일을 임시 저장소에 업로드하고 URL 반환

    Note: Daglo Async API는 URL 기반으로 동작하므로
          파일을 먼저 접근 가능한 URL로 업로드해야 함

    현재는 Sync API를 직접 사용하거나,
    파일 서버 구현이 필요함
    """
    # TODO: 파일 업로드 서버 구현 필요
    # 임시로 None 반환
    return None


async def transcribe_audio_daglo_sync(audio_file: BinaryIO) -> dict:
    """
    Daglo Sync API를 사용한 STT (30초 이내 오디오)

    - 짧은 오디오 파일에 적합
    - 실시간 응답
    - 화자 분리 미지원 (Async에서만 지원)
    """
    start_time = time.time()

    headers = {
        "Authorization": f"Bearer {DAGLO_API_TOKEN}"
    }

    # 파일 내용 읽기
    content = audio_file.read()

    async with httpx.AsyncClient(timeout=60.0) as client:
        files = {"file": ("audio.webm", content, "audio/webm")}

        response = await client.post(
            DAGLO_SYNC_URL,
            headers=headers,
            files=files
        )

        if response.status_code != 200:
            raise Exception(f"Daglo API error: {response.status_code} - {response.text}")

        result = response.json()

    latency = time.time() - start_time

    transcript = result.get("sttResult", {}).get("transcript", "")

    return {
        "text": transcript,
        "formatted_text": transcript,  # Sync API는 화자 분리 없음
        "segments": [],
        "duration": 0,
        "latency": latency,
        "provider": "daglo_sync"
    }


async def transcribe_audio_daglo_async(audio_url: str) -> dict:
    """
    Daglo Async API를 사용한 STT (긴 오디오, 화자 분리 지원)

    - 최대 4시간, 2GB 파일 지원
    - 화자 분리 (Speaker Diarization) 지원
    - 비동기 처리 (폴링 필요)
    """
    start_time = time.time()

    headers = {
        "Authorization": f"Bearer {DAGLO_API_TOKEN}",
        "Content-Type": "application/json"
    }

    # 요청 본문 - 화자 분리 활성화
    payload = {
        "audio": {
            "source": {
                "url": audio_url
            }
        },
        "sttConfig": {
            "speakerDiarization": {
                "enable": True
            }
        }
    }

    async with httpx.AsyncClient(timeout=300.0) as client:
        # 1. 전사 작업 제출
        response = await client.post(
            DAGLO_ASYNC_URL,
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            raise Exception(f"Daglo API error: {response.status_code} - {response.text}")

        result = response.json()
        rid = result.get("rid")

        if not rid:
            raise Exception("No request ID returned from Daglo API")

        # 2. 결과 폴링
        max_attempts = 60  # 최대 5분 대기
        poll_interval = 5  # 5초 간격

        for attempt in range(max_attempts):
            await asyncio.sleep(poll_interval)

            status_response = await client.get(
                f"{DAGLO_ASYNC_URL}/{rid}",
                headers={"Authorization": f"Bearer {DAGLO_API_TOKEN}"}
            )

            if status_response.status_code != 200:
                continue

            status_result = status_response.json()
            status = status_result.get("status")

            if status == "transcribed":
                # 전사 완료
                latency = time.time() - start_time

                # 결과 파싱
                stt_result = status_result.get("sttResult", {})
                transcript = stt_result.get("transcript", "")
                words = stt_result.get("words", [])

                # 화자별 세그먼트 구성
                segments = []
                current_segment = None

                for word in words:
                    speaker_id = word.get("speakerId", 0)
                    speaker_name = f"화자{speaker_id + 1}"
                    word_text = word.get("word", "")
                    start = word.get("startTime", {})
                    start_seconds = float(start.get("seconds", 0)) + float(start.get("nanos", 0)) / 1e9

                    if current_segment is None or current_segment["speaker"] != speaker_name:
                        if current_segment:
                            segments.append(current_segment)
                        current_segment = {
                            "speaker": speaker_name,
                            "text": word_text,
                            "startTime": start_seconds
                        }
                    else:
                        current_segment["text"] += " " + word_text

                if current_segment:
                    segments.append(current_segment)

                # 포맷된 텍스트 생성
                formatted_text = format_transcript_with_speakers(segments)

                return {
                    "text": transcript,
                    "formatted_text": formatted_text,
                    "segments": segments,
                    "duration": 0,
                    "latency": latency,
                    "provider": "daglo_async"
                }

            elif status in ["failed", "error"]:
                raise Exception(f"Daglo transcription failed: {status_result}")

        raise Exception("Daglo transcription timeout")


async def transcribe_audio_whisper(audio_file: BinaryIO) -> dict:
    """
    OpenAI Whisper API를 사용한 STT (Fallback)

    - 화자 분리 미지원
    - 한국어 지원 양호
    """
    start_time = time.time()

    client = get_openai_client()
    response = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="ko",
        response_format="verbose_json"
    )

    latency = time.time() - start_time

    return {
        "text": response.text,
        "formatted_text": response.text,
        "segments": [],
        "duration": response.duration,
        "latency": latency,
        "provider": "whisper"
    }


async def transcribe_audio(audio_file: BinaryIO) -> dict:
    """
    음성 파일을 텍스트로 전사 (메인 함수)

    전략:
    1. Daglo API 토큰이 있으면 Daglo Sync API 사용
    2. Daglo 실패시 Whisper fallback

    Args:
        audio_file: 업로드된 오디오 파일

    Returns:
        dict: {
            "text": str,              # 원본 전사 텍스트
            "formatted_text": str,    # 화자/타임스탬프 포함 텍스트
            "segments": list,         # 화자별 세그먼트
            "duration": float,
            "latency": float,
            "provider": str           # daglo_sync, daglo_async, whisper
        }
    """
    # Daglo API 토큰 확인
    if DAGLO_API_TOKEN:
        try:
            return await transcribe_audio_daglo_sync(audio_file)
        except Exception as e:
            print(f"Daglo STT failed, falling back to Whisper: {e}")
            # 파일 포인터 리셋
            audio_file.seek(0)

    # Whisper fallback
    return await transcribe_audio_whisper(audio_file)


# Legacy function for compatibility
def get_client():
    """OpenAI 클라이언트 반환 (테스트 호환용)"""
    return get_openai_client()