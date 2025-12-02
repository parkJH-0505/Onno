"""
Daglo STT Service - 화자 분리 및 타임스탬프 지원
https://developers.daglo.ai/guide/STT-Async.html
"""

import time
import os
import asyncio
import httpx
import logging
import tempfile
import subprocess
import io
from typing import BinaryIO
from dotenv import load_dotenv

load_dotenv()

# 로깅 설정
logger = logging.getLogger(__name__)

# Daglo API 설정
DAGLO_API_TOKEN = os.getenv("DAGLO_API_TOKEN")
logger.info(f"DAGLO_API_TOKEN configured: {bool(DAGLO_API_TOKEN)}")
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


def convert_webm_to_wav(webm_content: bytes) -> bytes:
    """
    webm 오디오를 wav로 변환 (ffmpeg 직접 사용)

    Args:
        webm_content: webm 파일 바이트 데이터

    Returns:
        wav 파일 바이트 데이터
    """
    try:
        # 임시 파일로 저장 후 ffmpeg로 변환
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as webm_file:
            webm_file.write(webm_content)
            webm_path = webm_file.name

        wav_path = webm_path.replace('.webm', '.wav')

        try:
            # ffmpeg로 변환 (subprocess 사용)
            result = subprocess.run(
                ['ffmpeg', '-y', '-i', webm_path, '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', wav_path],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                logger.error(f"ffmpeg error: {result.stderr}")
                raise Exception(f"ffmpeg conversion failed: {result.stderr}")

            # wav 파일 읽기
            with open(wav_path, 'rb') as wav_file:
                wav_content = wav_file.read()

            logger.info(f"Converted webm ({len(webm_content)} bytes) to wav ({len(wav_content)} bytes)")
            return wav_content

        finally:
            # 임시 파일 정리
            if os.path.exists(webm_path):
                os.unlink(webm_path)
            if os.path.exists(wav_path):
                os.unlink(wav_path)

    except Exception as e:
        logger.error(f"Failed to convert webm to wav: {e}")
        raise


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


async def transcribe_audio_daglo_sync(audio_content: bytes, is_wav: bool = False) -> dict:
    """
    Daglo Sync API를 사용한 STT (30초 이내 오디오)

    - 짧은 오디오 파일에 적합
    - 실시간 응답
    - 화자 분리 미지원 (Async에서만 지원)
    """
    start_time = time.time()
    logger.info("Starting Daglo Sync STT...")

    headers = {
        "Authorization": f"Bearer {DAGLO_API_TOKEN}"
    }

    logger.info(f"Audio content size: {len(audio_content)} bytes, is_wav: {is_wav}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        if is_wav:
            files = {"file": ("audio.wav", audio_content, "audio/wav")}
        else:
            files = {"file": ("audio.webm", audio_content, "audio/webm")}

        logger.info(f"Sending request to Daglo: {DAGLO_SYNC_URL}")
        response = await client.post(
            DAGLO_SYNC_URL,
            headers=headers,
            files=files
        )

        logger.info(f"Daglo response status: {response.status_code}")

        if response.status_code != 200:
            logger.error(f"Daglo API error: {response.status_code} - {response.text}")
            raise Exception(f"Daglo API error: {response.status_code} - {response.text}")

        result = response.json()
        logger.info(f"Daglo response: {result}")

    latency = time.time() - start_time

    transcript = result.get("sttResult", {}).get("transcript", "")
    logger.info(f"Daglo transcript: {transcript[:100]}..." if len(transcript) > 100 else f"Daglo transcript: {transcript}")

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
    - webm 형식 직접 지원
    """
    start_time = time.time()
    logger.info("Starting Whisper STT...")

    client = get_openai_client()
    response = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="ko",
        response_format="verbose_json"
    )

    latency = time.time() - start_time
    logger.info(f"Whisper transcript: {response.text[:100]}..." if len(response.text) > 100 else f"Whisper transcript: {response.text}")

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
    1. Daglo API 사용 시도 (webm → wav 변환)
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
    # 파일 내용 읽기
    audio_content = audio_file.read()
    logger.info(f"transcribe_audio called, audio size: {len(audio_content)} bytes")

    # Daglo API 시도
    if DAGLO_API_TOKEN:
        try:
            logger.info("Attempting Daglo STT with wav conversion...")

            # webm → wav 변환
            wav_content = convert_webm_to_wav(audio_content)

            # Daglo API 호출
            result = await transcribe_audio_daglo_sync(wav_content, is_wav=True)

            # 빈 결과면 Whisper로 fallback
            if not result.get("text", "").strip():
                logger.warning("Daglo returned empty transcript, falling back to Whisper")
                raise Exception("Empty transcript from Daglo")

            logger.info(f"Daglo STT success, provider: {result.get('provider')}")
            return result

        except Exception as e:
            logger.error(f"Daglo STT failed, falling back to Whisper: {e}")

    # Whisper fallback
    logger.info("Using Whisper STT...")
    audio_file_like = io.BytesIO(audio_content)
    audio_file_like.name = "audio.webm"  # Whisper needs filename
    result = await transcribe_audio_whisper(audio_file_like)
    logger.info(f"Whisper STT complete, provider: {result.get('provider')}")
    return result


# Legacy function for compatibility
def get_client():
    """OpenAI 클라이언트 반환 (테스트 호환용)"""
    return get_openai_client()
