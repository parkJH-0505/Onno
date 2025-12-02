FROM python:3.11-slim

# ffmpeg 설치 (pydub에서 오디오 변환에 필요)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 코드 복사
COPY . .

# Render가 PORT 환경변수를 동적으로 지정함
ENV PORT=10000
EXPOSE $PORT

# 서버 실행 (shell form으로 환경변수 사용)
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
