from openai import OpenAI
import time
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def transcribe_audio(audio_file):
    """
    음성 파일을 텍스트로 전사

    Args:
        audio_file: 업로드된 오디오 파일

    Returns:
        dict: {
            "text": str,
            "duration": float,
            "latency": float
        }
    """
    start_time = time.time()

    response = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="ko",
        response_format="verbose_json"
    )

    latency = time.time() - start_time

    return {
        "text": response.text,
        "duration": response.duration,
        "latency": latency
    }
