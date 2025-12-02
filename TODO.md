# Onno 프로토타입 개발 TODO

**최종 업데이트**: 2025-12-02
**현재 단계**: Phase 0 완료 ✅ → Phase 1 프로토타입 개발

---

## 📊 프로젝트 진행 현황

### ✅ 완료된 작업 (Phase 0: 전략 & 설계)

```
전략 수립 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% ✅
제품 기획 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% ✅
아키텍처 설계 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% ✅
인프라 설계 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% ✅
프로토타입 개발 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 📁 완료된 Phase 0 작업 요약

### ✅ 15개 문서 작성 완료 (~15,000줄)

1. **PRD 4부작** - 전략, 기능명세, 기술아키텍처, 마스터플랜
2. **개인화 시스템** - "나만의 온노" (Lv.1-5, 페르소나 4개)
3. **관계 객체 시스템** - 거래처별 컨텍스트 저장소
4. **시스템 아키텍처** (~3,000줄) - Frontend, Backend, AI/ML Pipeline
5. **인프라 아키텍처** (~2,200줄) - AWS 17개 서비스, VPC 설계, CI/CD
6. **프로젝트 가이드** - Quick Start, FAQ, 온보딩

### ✅ 핵심 기술 결정

- **STT**: OpenAI Whisper API
- **LLM**: GPT-4o (질문 생성)
- **Frontend**: React 18 + TypeScript + Vite + Zustand
- **Backend**: Node.js + Express + Prisma + Socket.io
- **AI/ML**: Python FastAPI
- **Infra**: AWS ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3
- **Vector DB**: Pinecone

### ✅ 핵심 차별점 정의

1. **During-the-fact** (실시간 분석) vs After-the-fact
2. **개인화 시스템** (사용할수록 나만의 온노로 성장)
3. **Vertical AI** (VC/AC 전문 도메인 특화)
4. **관계 객체** (거래처별 컨텍스트 자동 로드)

---

## 🎯 Phase 1: 프로토타입 개발 계획

**목표**: 시스템 설계를 검증하고 핵심 데이터 흐름과 사용자 인터랙션을 프로토타입으로 구현

---

### 📅 Step 1: 개발 환경 구축 (1-2일)

#### 1-1. 프로젝트 구조 생성

- [ ] **Frontend 프로젝트 초기화**
  ```bash
  npm create vite@latest onno-frontend -- --template react-ts
  cd onno-frontend
  npm install
  npm install zustand socket.io-client
  npm install -D @types/node
  ```

  디렉토리 구조:
  ```
  onno-frontend/
  ├── src/
  │   ├── components/
  │   │   ├── AudioRecorder.tsx
  │   │   ├── TranscriptPanel.tsx
  │   │   ├── QuestionCard.tsx
  │   │   └── MeetingRoom.tsx
  │   ├── stores/
  │   │   └── meetingStore.ts
  │   ├── services/
  │   │   └── websocket.ts
  │   ├── App.tsx
  │   └── main.tsx
  ├── package.json
  └── vite.config.ts
  ```

- [ ] **Backend 프로젝트 초기화**
  ```bash
  mkdir onno-backend
  cd onno-backend
  npm init -y
  npm install express socket.io cors dotenv
  npm install -D typescript @types/express @types/node ts-node nodemon
  npx tsc --init
  ```

  디렉토리 구조:
  ```
  onno-backend/
  ├── src/
  │   ├── server.ts
  │   ├── websocket/
  │   │   └── meetingHandler.ts
  │   ├── services/
  │   │   ├── sttService.ts
  │   │   └── questionService.ts
  │   └── types/
  │       └── meeting.ts
  ├── package.json
  └── tsconfig.json
  ```

- [ ] **AI Service 프로젝트 초기화**
  ```bash
  mkdir onno-ai
  cd onno-ai
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  pip install fastapi uvicorn openai python-multipart
  ```

  디렉토리 구조:
  ```
  onno-ai/
  ├── app/
  │   ├── main.py
  │   ├── services/
  │   │   ├── stt.py
  │   │   └── question_generator.py
  │   └── models/
  │       └── schemas.py
  ├── requirements.txt
  └── .env
  ```

#### 1-2. API 키 발급

- [ ] **OpenAI API Key**
  - [ ] https://platform.openai.com/api-keys 접속
  - [ ] API Key 생성
  - [ ] `.env` 파일에 저장
    ```
    OPENAI_API_KEY=sk-...
    ```
  - [ ] Usage Limit 설정 ($50/month 초기)

#### 1-3. Git 저장소 정리

- [ ] **프로젝트 구조 정리**
  ```
  Onno/
  ├── frontend/     (React앱)
  ├── backend/      (Node.js API + WebSocket)
  ├── ai-service/   (Python FastAPI)
  ├── docs/         (기존 문서들)
  ├── README.md
  └── TODO.md
  ```

- [ ] **.gitignore 업데이트**
  ```
  # Dependencies
  node_modules/
  venv/
  __pycache__/

  # Env
  .env
  .env.local

  # Build
  dist/
  build/

  # IDE
  .vscode/
  .idea/
  ```

---

### 📅 Step 2: 핵심 기능 프로토타입 (3-5일)

**목표**: 실시간 음성 → 전사 → AI 질문 제안 파이프라인 동작 확인

#### 2-1. STT 서비스 구현

- [ ] **AI Service: STT 엔드포인트**
  ```python
  # onno-ai/app/services/stt.py

  from openai import OpenAI
  import time

  client = OpenAI()

  async def transcribe_audio(audio_file):
      start = time.time()

      response = client.audio.transcriptions.create(
          model="whisper-1",
          file=audio_file,
          language="ko",
          response_format="verbose_json"
      )

      latency = time.time() - start

      return {
          "text": response.text,
          "duration": response.duration,
          "latency": latency
      }
  ```

- [ ] **FastAPI 엔드포인트**
  ```python
  # onno-ai/app/main.py

  from fastapi import FastAPI, File, UploadFile
  from app.services.stt import transcribe_audio

  app = FastAPI()

  @app.post("/api/stt/transcribe")
  async def transcribe(audio: UploadFile = File(...)):
      result = await transcribe_audio(audio.file)
      return result
  ```

- [ ] **테스트 오디오 파일 준비**
  - [ ] 한국어 비즈니스 회의 녹음 3개 (각 1-3분)
  - [ ] MP3 또는 WAV 형식
  - [ ] `test-audio/` 폴더에 저장

- [ ] **STT 정확도 테스트**
  - [ ] 3개 샘플 전사
  - [ ] 수동으로 정확도 확인
  - [ ] Latency 측정 (목표: <2초)

#### 2-2. AI 질문 생성 서비스 구현

- [ ] **Prompt v0.1 작성**
  ```python
  # onno-ai/app/services/question_generator.py

  from openai import OpenAI

  client = OpenAI()

  QUESTION_PROMPT = """
  당신은 VC 투자 심사 전문가입니다.

  아래 대화를 분석하여, 투자자가 놓치기 쉬운 중요한 질문 3개를 제안하세요.

  ## 대화 전사:
  {transcript}

  ## 출력 형식 (JSON):
  {{
    "questions": [
      {{
        "text": "질문 텍스트",
        "priority": "critical" | "important" | "follow_up",
        "reason": "왜 이 질문이 중요한지",
        "category": "metrics" | "team" | "strategy" | "risk"
      }}
    ]
  }}
  """

  async def generate_questions(transcript: str):
      response = client.chat.completions.create(
          model="gpt-4o",
          messages=[
              {"role": "system", "content": "You are an expert VC analyst."},
              {"role": "user", "content": QUESTION_PROMPT.format(transcript=transcript)}
          ],
          response_format={"type": "json_object"},
          temperature=0.7
      )

      return response.choices[0].message.content
  ```

- [ ] **FastAPI 엔드포인트**
  ```python
  @app.post("/api/questions/generate")
  async def generate_questions_endpoint(data: dict):
      transcript = data.get("transcript")
      questions = await generate_questions(transcript)
      return questions
  ```

- [ ] **테스트 시나리오 5개 준비**
  ```
  시나리오 1: CAC 언급, LTV 미언급
  시나리오 2: MRR 언급, Churn Rate 미언급
  시나리오 3: 팀 소개, 핵심 인재 미언급
  시나리오 4: 시장 크기 언급, 경쟁사 미언급
  시나리오 5: 제품 설명, 타겟 고객 미언급
  ```

- [ ] **질문 품질 평가**
  - [ ] 5개 시나리오 실행
  - [ ] 적절성, 타이밍, 실용성 평가 (5점 척도)
  - [ ] 응답 시간 측정 (목표: <1초)

#### 2-3. WebSocket 실시간 파이프라인

- [ ] **Backend: WebSocket 서버**
  ```typescript
  // onno-backend/src/server.ts

  import express from 'express';
  import { createServer } from 'http';
  import { Server } from 'socket.io';
  import cors from 'cors';

  const app = express();
  app.use(cors());

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_meeting', (data) => {
      const { meetingId } = data;
      socket.join(`meeting-${meetingId}`);
      console.log(`Client joined meeting: ${meetingId}`);
    });

    socket.on('audio_chunk', async (data) => {
      // TODO: STT 서비스로 오디오 전송
      // TODO: 전사 결과를 클라이언트로 전송
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
  ```

- [ ] **Frontend: WebSocket 클라이언트**
  ```typescript
  // onno-frontend/src/services/websocket.ts

  import { io, Socket } from 'socket.io-client';

  class WebSocketService {
    private socket: Socket | null = null;

    connect() {
      this.socket = io('http://localhost:3000');

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('transcription', (data) => {
        console.log('Transcription:', data);
        // TODO: Zustand store 업데이트
      });

      this.socket.on('question_suggested', (data) => {
        console.log('Question:', data);
        // TODO: Zustand store 업데이트
      });
    }

    joinMeeting(meetingId: string) {
      this.socket?.emit('join_meeting', { meetingId });
    }

    sendAudioChunk(meetingId: string, audioData: Blob) {
      this.socket?.emit('audio_chunk', { meetingId, audioData });
    }
  }

  export default new WebSocketService();
  ```

#### 2-4. 간단한 UI 구현

- [ ] **AudioRecorder 컴포넌트**
  ```typescript
  // onno-frontend/src/components/AudioRecorder.tsx

  import { useState, useRef } from 'react';

  export function AudioRecorder({ onAudioChunk }: { onAudioChunk: (blob: Blob) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          onAudioChunk(e.data);
        }
      };

      mediaRecorder.start(5000); // 5초마다 chunk 전송
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    };

    const stopRecording = () => {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    };

    return (
      <div>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? '정지' : '녹음 시작'}
        </button>
      </div>
    );
  }
  ```

- [ ] **TranscriptPanel 컴포넌트**
  ```typescript
  // onno-frontend/src/components/TranscriptPanel.tsx

  export function TranscriptPanel({ transcripts }: { transcripts: Array<{text: string, timestamp: number}> }) {
    return (
      <div className="transcript-panel">
        <h3>대화 내용</h3>
        {transcripts.map((t, i) => (
          <p key={i}>{t.text}</p>
        ))}
      </div>
    );
  }
  ```

- [ ] **QuestionCard 컴포넌트**
  ```typescript
  // onno-frontend/src/components/QuestionCard.tsx

  export function QuestionCard({ question }: { question: {text: string, priority: string, reason: string} }) {
    return (
      <div className={`question-card priority-${question.priority}`}>
        <span className="priority-badge">{question.priority}</span>
        <p className="question-text">{question.text}</p>
        <p className="reason">{question.reason}</p>
      </div>
    );
  }
  ```

- [ ] **MeetingRoom 통합 화면**
  ```typescript
  // onno-frontend/src/components/MeetingRoom.tsx

  import { AudioRecorder } from './AudioRecorder';
  import { TranscriptPanel } from './TranscriptPanel';
  import { QuestionCard } from './QuestionCard';
  import { useMeetingStore } from '../stores/meetingStore';
  import websocketService from '../services/websocket';

  export function MeetingRoom() {
    const { transcripts, questions } = useMeetingStore();

    const handleAudioChunk = (blob: Blob) => {
      websocketService.sendAudioChunk('test-meeting-1', blob);
    };

    return (
      <div className="meeting-room">
        <h1>회의 중...</h1>

        <AudioRecorder onAudioChunk={handleAudioChunk} />

        <div className="content">
          <TranscriptPanel transcripts={transcripts} />

          <div className="questions">
            <h3>AI 질문 제안</h3>
            {questions.map((q, i) => (
              <QuestionCard key={i} question={q} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  ```

---

### 📅 Step 3: 데이터 흐름 & 사용자 경험 검증 (2-3일)

#### 3-1. End-to-End 테스트

- [ ] **전체 파이프라인 동작 확인**
  1. Frontend에서 녹음 시작
  2. Audio chunk가 Backend WebSocket으로 전송됨
  3. Backend가 AI Service STT로 전송
  4. 전사 결과가 Frontend로 실시간 표시됨
  5. 전사가 일정 길이 도달 시 AI 질문 생성
  6. 질문이 Frontend에 실시간 표시됨

- [ ] **Latency 측정**
  - [ ] 음성 → 전사: < 2초
  - [ ] 전사 → 질문: < 1초
  - [ ] Total: < 3초

- [ ] **사용자 인터랙션 테스트**
  - [ ] 질문 카드 클릭 → "사용" 표시
  - [ ] 질문 무시 → Fade out
  - [ ] 새 질문이 계속 생성됨

#### 3-2. 프로토타입 개선

- [ ] **발견된 문제점 기록**
  - Latency 병목 지점
  - 사용자 경험 개선점
  - 기술적 제약사항

- [ ] **개선 우선순위 결정**
  - P0: 치명적 문제 (즉시 해결)
  - P1: 중요 문제 (다음 iteration)
  - P2: 개선사항 (향후 고려)

---

### 📅 Step 4: 다음 단계 결정 (1일)

#### 4-1. 프로토타입 평가

- [ ] **기술 검증 완료 여부**
  - STT 정확도 95%+
  - Latency < 3초
  - AI 질문 품질 평가

- [ ] **사용자 경험 평가**
  - 데이터 흐름이 직관적인가?
  - 인터랙션이 자연스러운가?
  - "실시간" 느낌이 전달되는가?

#### 4-2. 다음 단계 계획

**Option A: 프로토타입 완성도 높이기**
- 개인화 시스템 추가 (Lv.1 기본)
- 회의 히스토리 저장
- UI/UX 개선

**Option B: 확장 기능 추가**
- 관계 객체 시스템 프로토타입
- Notion 연동
- 페르소나 선택

**Option C: MVP로 발전**
- DB 연동 (PostgreSQL)
- 인증 시스템
- 배포 준비

---

## 📊 프로토타입 성공 지표

### 필수 (Must-have)
- [ ] STT 정확도 90%+
- [ ] End-to-End Latency < 5초
- [ ] AI 질문 3개 이상 생성 (3분 회의 기준)
- [ ] 실시간 UI 업데이트 동작

### 목표 (Should-have)
- [ ] STT 정확도 95%+
- [ ] Latency < 3초
- [ ] 질문 품질 평가 4.0+ (5점 척도)
- [ ] 사용자 피드백 수집 (본인 + 1-2명)

---

## 🔗 관련 문서

- [시스템 아키텍처 설계서](docs/Onno%20-%20시스템%20아키텍처%20설계서%20(System%20Architecture%20Design).md)
- [PRD Part 2: 기능 명세](docs/Onno%20-%20PRD%20Part%202%20업데이트%20(개인화%20통합).md)
- [PRD Part 3: 기술 아키텍처](docs/Onno%20-%20PRD%20Part%203%20(기술%20아키텍처).md)

---

**마지막 업데이트**: 2025-12-02 by Claude
**다음 업데이트 예정**: Step 1 완료 후 (개발 환경 구축 결과 반영)
