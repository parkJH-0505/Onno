# Onno Prototype Setup Guide

**작성일**: 2025-12-02
**상태**: Phase 1 배포 완료 ✅

---

## 🌐 배포 현황

| 서비스 | URL | 플랫폼 | 상태 |
|--------|-----|--------|------|
| **Frontend (프로토타입)** | https://onno-prototype.vercel.app | Vercel | ✅ 운영중 |
| **Frontend (랜딩)** | https://onno-two.vercel.app | Vercel | ✅ 운영중 |
| **Backend** | https://onno-backend.onrender.com | Render | ✅ 운영중 |
| **AI Service** | https://onno-ai-service.onrender.com | Render | ✅ 운영중 |

> **참고**: Render 무료 플랜은 15분 비활성시 서버가 sleep 되어 첫 요청이 50초 정도 지연될 수 있습니다.

---

## 📁 프로젝트 구조

```
Onno/
├── frontend/              # React + TypeScript + Vite (프로토타입)
│   ├── src/
│   │   ├── components/   # AudioRecorder, TranscriptPanel, QuestionCard, MeetingRoom
│   │   ├── stores/       # Zustand state management
│   │   ├── services/     # WebSocket service
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env              # VITE_WS_URL
│
├── backend/              # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── server.ts     # WebSocket server & AI Service integration
│   │   └── types/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env              # PORT, AI_SERVICE_URL
│
├── ai-service/           # Python + FastAPI
│   ├── app/
│   │   ├── main.py       # FastAPI app (Mock 모드 지원)
│   │   ├── services/
│   │   │   ├── stt.py              # OpenAI Whisper API
│   │   │   ├── question_generator.py  # GPT-4o question generation
│   │   │   └── mock_data.py        # Mock 데이터 서비스
│   │   └── models/
│   ├── requirements.txt
│   └── .env              # OPENAI_API_KEY, MOCK_MODE
│
├── web/                  # 랜딩 페이지 (별도 Vercel 배포)
│
├── docs/
│   ├── Iteration-1-Plan.md
│   └── Phase-1-2-Progress.md
│
├── test-data/
│   └── audio-samples/
│
├── TODO.md
├── PROJECT_GUIDE.md
└── README.md
```

---

## 🚀 로컬 개발 환경 설정

### 포트 구성

| 서비스 | 로컬 포트 |
|--------|----------|
| AI Service | 6010 |
| Backend | 6001 |
| Frontend | 6005 |

### 1️⃣ AI Service 설정 (Python)

```bash
# 1. AI Service 디렉토리로 이동
cd ai-service

# 2. Python 가상 환경 생성 및 활성화
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 3. 패키지 설치
pip install -r requirements.txt

# 4. 환경 변수 설정
cp .env.example .env
# .env 파일 편집: MOCK_MODE=true (또는 OPENAI_API_KEY 입력)

# 5. 서버 실행
uvicorn app.main:app --reload --port 6010
```

**확인**: http://localhost:6010/health

---

### 2️⃣ Backend 설정 (Node.js)

```bash
# 1. Backend 디렉토리로 이동 (새 터미널)
cd backend

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정 (.env)
PORT=6001
AI_SERVICE_URL=http://localhost:6010
ENVIRONMENT=development

# 4. 서버 실행
npm run dev
```

**확인**: http://localhost:6001/health

---

### 3️⃣ Frontend 설정 (React)

```bash
# 1. Frontend 디렉토리로 이동 (새 터미널)
cd frontend

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

**확인**: http://localhost:6005

---

## ⚙️ 환경 변수 설정

### AI Service (`.env`)

```
OPENAI_API_KEY=sk-your-api-key-here  # 실제 API 사용시
MOCK_MODE=true                        # Mock 모드 (API 없이 테스트)
ENVIRONMENT=development
```

### Backend (`.env`)

```
PORT=6001
AI_SERVICE_URL=http://localhost:6010
ENVIRONMENT=development
```

### Frontend (`.env`)

```
VITE_WS_URL=http://localhost:6001
```

---

## 📊 완료된 작업

### Phase 1-1: 프로젝트 초기화 ✅
- [x] Frontend 프로젝트 생성 (React + TypeScript + Vite + Zustand)
- [x] Backend 프로젝트 생성 (Node.js + Express + Socket.io)
- [x] AI Service 프로젝트 생성 (Python + FastAPI)
- [x] 타입 정의 및 컴포넌트 구현

### Phase 1-2: AI 서비스 연동 ✅
- [x] STT Service 구현 (OpenAI Whisper)
- [x] Question Generator Service 구현 (GPT-4o)
- [x] Mock 모드 구현 (API 없이 테스트 가능)
- [x] WebSocket 실시간 파이프라인 연동

### 클라우드 배포 ✅
- [x] AI Service → Render 배포
- [x] Backend → Render 배포
- [x] Frontend → Vercel 배포
- [x] 환경 변수 설정 완료

---

## 🎨 구현된 기능

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

4. **Mock 모드**
   - OpenAI API 없이 테스트 가능
   - 한국어 VC 미팅 샘플 데이터

---

## ❓ 문제 해결

### 1. Chrome에서 포트 6000 접근 불가
Chrome은 포트 6000 (X11)을 보안상 차단합니다. → 포트 6010 사용

### 2. OpenAI API 할당량 초과
`.env`에 `MOCK_MODE=true` 설정으로 Mock 데이터 사용

### 3. Render 서버 응답 느림
무료 플랜은 15분 비활성시 sleep → 첫 요청 50초 지연 (이후 정상)

### 4. 마이크 권한 오류
- 브라우저 설정에서 마이크 권한 허용
- HTTPS 또는 localhost에서만 테스트 가능

---

## 📝 다음 단계 (Phase 1-3)

- [ ] UI/UX 개선
- [ ] 에러 핸들링 강화
- [ ] 연결 상태 표시
- [ ] 로딩 인디케이터

---

**작성자**: 박준홍 + Claude
**최종 업데이트**: 2025-12-02
