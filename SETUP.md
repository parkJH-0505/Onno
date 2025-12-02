# Onno Prototype Setup Guide

**작성일**: 2025-12-02
**상태**: Phase 1-1 완료 ✅

---

## 📁 프로젝트 구조

```
Onno/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # AudioRecorder, TranscriptPanel, QuestionCard, MeetingRoom
│   │   ├── stores/       # Zustand state management
│   │   ├── services/     # WebSocket service
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env              # VITE_WS_URL=http://localhost:3000
│
├── backend/              # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── server.ts     # WebSocket server & AI Service integration
│   │   ├── types/
│   │   ├── services/
│   │   └── websocket/
│   ├── package.json
│   └── .env              # PORT=3000, AI_SERVICE_URL=http://localhost:8000
│
├── ai-service/           # Python + FastAPI
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── services/
│   │   │   ├── stt.py              # OpenAI Whisper API
│   │   │   └── question_generator.py  # GPT-4o question generation
│   │   └── models/
│   ├── requirements.txt
│   └── .env              # OPENAI_API_KEY=sk-...
│
├── docs/
│   ├── Iteration-1-Plan.md   # Phase 1 상세 계획
│   └── ...
│
├── test-data/
│   └── audio-samples/    # 테스트용 오디오 파일 (MP3, WAV)
│
├── TODO.md
├── PROJECT_GUIDE.md
└── README.md
```

---

## 🚀 Quick Start

### 1️⃣ AI Service 설정 (Python)

```bash
# 1. AI Service 디렉토리로 이동
cd ai-service

# 2. Python 가상 환경 생성
python -m venv venv

# 3. 가상 환경 활성화
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 4. 패키지 설치
pip install -r requirements.txt

# 5. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 OPENAI_API_KEY 입력

# 6. 서버 실행
uvicorn app.main:app --reload --port 8000
```

**확인**: http://localhost:8000/health

---

### 2️⃣ Backend 설정 (Node.js)

```bash
# 1. Backend 디렉토리로 이동 (새 터미널)
cd backend

# 2. 패키지가 이미 설치되어 있음 (npm install 완료)

# 3. 서버 실행
npm run dev
```

**확인**: http://localhost:3000/health

---

### 3️⃣ Frontend 설정 (React)

```bash
# 1. Frontend 디렉토리로 이동 (새 터미널)
cd frontend

# 2. 패키지가 이미 설치되어 있음 (npm install 완료)

# 3. 개발 서버 실행
npm run dev
```

**확인**: http://localhost:5173

---

## ⚙️ 환경 변수 설정

### AI Service (`.env`)

```
OPENAI_API_KEY=sk-your-api-key-here
ENVIRONMENT=development
```

**OpenAI API Key 발급**:
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. Key 복사하여 `.env`에 저장
4. Usage Limits 설정 ($50/month 권장)

### Backend (`.env`)

```
PORT=3000
AI_SERVICE_URL=http://localhost:8000
ENVIRONMENT=development
```

### Frontend (`.env`)

```
VITE_WS_URL=http://localhost:3000
```

---

## 📊 Phase 1-1 완료 체크리스트

### ✅ 완료된 작업

- [x] Frontend 프로젝트 생성 (React + TypeScript + Vite)
- [x] Backend 프로젝트 생성 (Node.js + Express + Socket.io)
- [x] AI Service 프로젝트 생성 (Python + FastAPI)
- [x] 필요한 패키지 설치 완료
- [x] 디렉토리 구조 생성
- [x] 타입 정의 작성
- [x] Zustand Store 구현
- [x] WebSocket Service 구현
- [x] UI 컴포넌트 구현 (AudioRecorder, TranscriptPanel, QuestionCard, MeetingRoom)
- [x] Backend WebSocket 서버 구현
- [x] STT Service 구현 (OpenAI Whisper)
- [x] Question Generator Service 구현 (GPT-4o)
- [x] 환경 변수 파일 생성
- [x] .gitignore 업데이트
- [x] 기본 스타일링 (App.css)

### 🎨 구현된 기능

1. **실시간 음성 녹음** (AudioRecorder)
   - 마이크 권한 요청
   - 5초마다 오디오 chunk 전송
   - 녹음 시작/정지

2. **전사 패널** (TranscriptPanel)
   - 실시간 전사 결과 표시
   - Latency 측정 표시

3. **AI 질문 제안** (QuestionCard)
   - Priority 표시 (🔥 필수, ⭐ 중요, 💬 후속)
   - Category 표시 (metrics, team, strategy, risk)
   - 액션 버튼 (사용/무시)

4. **WebSocket 실시간 파이프라인**
   - Frontend ↔ Backend ↔ AI Service
   - 음성 → 전사 → 질문 생성

---

## 📝 다음 단계 (Phase 1-2)

1. **OpenAI API Key 발급** (5분)
   - [ ] https://platform.openai.com/api-keys에서 Key 발급
   - [ ] ai-service/.env에 Key 저장
   - [ ] Usage Limit 설정

2. **3개 서버 실행 테스트** (10분)
   - [ ] AI Service: `uvicorn app.main:app --reload --port 8000`
   - [ ] Backend: `npm run dev`
   - [ ] Frontend: `npm run dev`
   - [ ] Health Check 확인

3. **테스트 오디오 준비** (30분)
   - [ ] 한국어 비즈니스 대화 녹음 3개 준비
   - [ ] `test-data/audio-samples/`에 저장

4. **STT 테스트** (Phase 1-2)
   - [ ] 테스트 스크립트 작성
   - [ ] 정확도 측정
   - [ ] Latency 측정

---

## 🛠️ 개발 환경

### 필수 소프트웨어

- **Node.js**: v18 이상
- **Python**: 3.8 이상
- **npm**: v9 이상
- **pip**: 최신 버전

### 브라우저 요구사항

- Chrome, Edge, Firefox (최신 버전)
- 마이크 권한 허용 필요

---

## 📚 참고 문서

- [Iteration 1 계획](docs/Iteration-1-Plan.md) - 전체 개발 계획 (7-10일)
- [TODO.md](TODO.md) - 프로토타입 개발 TODO
- [PROJECT_GUIDE.md](PROJECT_GUIDE.md) - 프로젝트 전체 가이드

---

## ❓ 문제 해결

### 1. Frontend가 Backend에 연결되지 않음

```bash
# Backend .env 확인
PORT=3000

# Frontend .env 확인
VITE_WS_URL=http://localhost:3000

# Backend가 실행 중인지 확인
http://localhost:3000/health
```

### 2. AI Service가 응답하지 않음

```bash
# AI Service 실행 확인
http://localhost:8000/health

# OpenAI API Key 확인
cat ai-service/.env

# Backend .env의 AI_SERVICE_URL 확인
AI_SERVICE_URL=http://localhost:8000
```

### 3. 마이크 권한 오류

- 브라우저 설정에서 마이크 권한 허용
- HTTPS가 아닌 localhost에서만 테스트
- 다른 앱이 마이크를 사용 중인지 확인

---

**작성자**: 박준홍 + Claude
**최종 업데이트**: 2025-12-02
**다음 단계**: OpenAI API Key 발급 → Phase 1-2 시작
