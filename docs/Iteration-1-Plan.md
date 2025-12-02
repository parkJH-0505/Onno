# Iteration 1: 프로토타입 개발 계획

**작성일**: 2025-12-02
**담당**: 박준홍 + Claude
**기간**: 7-10일 (2025-12-02 ~ 2025-12-12)
**목표**: 핵심 기능 프로토타입 완성 및 아키텍처 검증

---

## 📋 Iteration 1 개요

### 🎯 목표 (Goal)

1. **아키텍처 검증**: Phase 0에서 설계한 시스템 아키텍처가 실제로 동작하는지 확인
2. **핵심 데이터 흐름 구현**: 음성 → 전사 → AI 질문 파이프라인 동작
3. **사용자 경험 확인**: 실시간 인터랙션이 직관적이고 자연스러운지 검증
4. **기술적 실현 가능성 증명**: STT 정확도, Latency, AI 질문 품질 측정

### 🚫 범위 밖 (Out of Scope)

이번 Iteration에서는 **하지 않습니다**:
- ❌ 데이터베이스 연동 (PostgreSQL, Redis)
- ❌ 사용자 인증/회원가입
- ❌ 개인화 시스템 (Lv.1-5, 페르소나)
- ❌ 관계 객체 시스템
- ❌ Notion 연동
- ❌ AWS 배포
- ❌ 프로덕션 레벨 에러 핸들링

### ✅ 성공 기준 (Success Criteria)

**필수 (Must-have)**:
- [ ] STT 정확도 90%+ (한국어 비즈니스 대화 기준)
- [ ] End-to-End Latency < 5초 (음성 입력 → 화면 표시)
- [ ] AI 질문 3개 이상 생성 (3분 회의 기준)
- [ ] 실시간 UI 업데이트 동작 (WebSocket)

**목표 (Should-have)**:
- [ ] STT 정확도 95%+
- [ ] Latency < 3초
- [ ] AI 질문 품질 평가 4.0+/5.0 (적절성, 타이밍, 실용성)
- [ ] 사용자 피드백 수집 (본인 + 1-2명 테스트)

---

## 📅 4단계 실행 계획

### Phase 1-1: 프로젝트 초기화 (Day 1-2) ✅ COMPLETED

**예상 소요**: 1-2일
**실제 소요**: 1일
**우선순위**: 🔥 Critical
**완료일**: 2025-12-02

#### 완료 요약
- ✅ Frontend, Backend, AI Service 3개 프로젝트 생성 완료
- ✅ 모든 의존성 설치 및 환경 설정 완료
- ✅ TypeScript ESM 모드 설정 (tsx 사용)
- ✅ 6000번대 포트로 통일 (AI: 6000, Backend: 6001, Frontend: 6005)
- ✅ OpenAI API Key 설정 완료
- ✅ WebSocket 통신 구조 구현 완료
- ✅ 기본 UI 컴포넌트 구조 생성 완료
- ⚠️ Frontend 모듈 import 이슈 해결 (import type 사용)

#### 실제 구현된 아키텍처
```
Onno/
├── frontend/ (React 18 + TypeScript + Vite + Zustand)
│   ├── Port: 6005
│   ├── Stack: socket.io-client, zustand
│   └── Components: AudioRecorder, TranscriptPanel, QuestionCard, MeetingRoom
├── backend/ (Node.js + Express + Socket.io + tsx)
│   ├── Port: 6001
│   ├── Stack: express, socket.io, axios, form-data
│   └── Type: ESM module ("type": "module" in package.json)
└── ai-service/ (Python 3.13 + FastAPI + OpenAI SDK)
    ├── Port: 6000
    ├── Stack: fastapi, openai, python-dotenv
    └── Services: STT (Whisper), Question Generator (GPT-4o)
```

#### Task 1.1.1: 프로젝트 구조 생성 ✅

**작업 내용**:
1. **Frontend 프로젝트** (React + TypeScript + Vite)
   ```bash
   npm create vite@latest onno-frontend -- --template react-ts
   cd onno-frontend
   npm install
   npm install zustand socket.io-client
   npm install -D @types/node
   ```

2. **Backend 프로젝트** (Node.js + Express + Socket.io)
   ```bash
   mkdir onno-backend
   cd onno-backend
   npm init -y
   npm install express socket.io cors dotenv
   npm install -D typescript @types/express @types/socket.io @types/node ts-node nodemon
   npx tsc --init
   ```

3. **AI Service** (Python + FastAPI)
   ```bash
   mkdir onno-ai
   cd onno-ai
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install fastapi uvicorn openai python-multipart python-dotenv
   ```

**디렉토리 구조**:
```
Onno/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioRecorder.tsx
│   │   │   ├── TranscriptPanel.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   └── MeetingRoom.tsx
│   │   ├── stores/
│   │   │   └── meetingStore.ts
│   │   ├── services/
│   │   │   └── websocket.ts
│   │   ├── types/
│   │   │   └── meeting.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── websocket/
│   │   │   └── meetingHandler.ts
│   │   ├── services/
│   │   │   ├── sttService.ts
│   │   │   └── questionService.ts
│   │   └── types/
│   │       └── meeting.ts
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/
│   ├── app/
│   │   ├── main.py
│   │   ├── services/
│   │   │   ├── stt.py
│   │   │   └── question_generator.py
│   │   └── models/
│   │       └── schemas.py
│   ├── requirements.txt
│   └── .env
│
├── docs/
├── test-data/
│   └── audio-samples/
├── README.md
└── TODO.md
```

**완료 조건**:
- [ ] 3개 프로젝트 폴더 생성
- [ ] 모든 패키지 설치 완료
- [ ] `npm run dev` / `uvicorn main:app` 실행 가능
- [ ] Git에 초기 구조 커밋

**예상 시간**: 2-3시간

---

#### Task 1.1.2: 환경 변수 및 설정 파일

**작업 내용**:

1. **AI Service `.env`**
   ```
   OPENAI_API_KEY=sk-...
   ENVIRONMENT=development
   ```

2. **Backend `.env`**
   ```
   PORT=3000
   AI_SERVICE_URL=http://localhost:8000
   ENVIRONMENT=development
   ```

3. **Frontend `.env`**
   ```
   VITE_WS_URL=http://localhost:3000
   ```

4. **`.gitignore` 업데이트**
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

   # Test data
   test-data/audio-samples/*.mp3
   test-data/audio-samples/*.wav
   ```

**완료 조건**:
- [ ] OpenAI API Key 발급 및 저장
- [ ] 모든 `.env` 파일 생성
- [ ] `.gitignore` 업데이트
- [ ] API Usage Limit 설정 ($50/month)

**예상 시간**: 30분

---

#### Task 1.1.3: 기본 서버 구동 확인

**작업 내용**:

1. **AI Service 기본 서버**
   ```python
   # ai-service/app/main.py
   from fastapi import FastAPI

   app = FastAPI()

   @app.get("/health")
   async def health():
       return {"status": "ok"}
   ```

   실행: `uvicorn app.main:app --reload --port 8000`

2. **Backend 기본 서버**
   ```typescript
   // backend/src/server.ts
   import express from 'express';

   const app = express();
   const PORT = 3000;

   app.get('/health', (req, res) => {
     res.json({ status: 'ok' });
   });

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

   실행: `npx ts-node src/server.ts`

3. **Frontend 기본 화면**
   ```tsx
   // frontend/src/App.tsx
   function App() {
     return <h1>Onno Prototype</h1>
   }
   ```

   실행: `npm run dev`

**완료 조건**:
- [x] AI Service: http://localhost:6000/health 응답
- [x] Backend: http://localhost:6001/health 응답 (Socket.io 포함)
- [x] Frontend: http://localhost:6005 화면 표시
- [x] 3개 서버 동시 실행 가능

**예상 시간**: 1시간
**실제 시간**: 4시간 (환경 설정 트러블슈팅 포함)

---

### Phase 1-2: STT 서비스 구현 (Day 3-4)

**예상 소요**: 2일
**우선순위**: 🔥 Critical

#### Task 1.2.1: OpenAI Whisper API 테스트

**작업 내용**:

1. **테스트 오디오 샘플 준비**
   - 한국어 비즈니스 대화 녹음 3개 준비
   - 각 1-3분 길이
   - MP3 또는 WAV 형식
   - `test-data/audio-samples/` 폴더에 저장

   예시:
   - `sample-1-vc-pitch.mp3`: VC 투자 심사 시뮬레이션
   - `sample-2-mentor-call.mp3`: AC 멘토링 대화
   - `sample-3-sales-call.mp3`: CB 세일즈 콜

2. **간단한 STT 테스트 스크립트**
   ```python
   # ai-service/test_stt.py
   from openai import OpenAI
   import time
   import os

   client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

   def test_transcription(audio_file_path):
       print(f"\n{'='*50}")
       print(f"Testing: {audio_file_path}")
       print(f"{'='*50}")

       start_time = time.time()

       with open(audio_file_path, 'rb') as audio_file:
           response = client.audio.transcriptions.create(
               model="whisper-1",
               file=audio_file,
               language="ko",
               response_format="verbose_json"
           )

       latency = time.time() - start_time

       print(f"\n📝 전사 결과:")
       print(response.text)
       print(f"\n⏱️ Latency: {latency:.2f}초")
       print(f"📊 오디오 길이: {response.duration:.2f}초")
       print(f"📈 처리 비율: {response.duration / latency:.2f}x")

       return {
           "text": response.text,
           "duration": response.duration,
           "latency": latency,
           "file": audio_file_path
       }

   if __name__ == "__main__":
       samples = [
           "../test-data/audio-samples/sample-1-vc-pitch.mp3",
           "../test-data/audio-samples/sample-2-mentor-call.mp3",
           "../test-data/audio-samples/sample-3-sales-call.mp3"
       ]

       results = []
       for sample in samples:
           if os.path.exists(sample):
               result = test_transcription(sample)
               results.append(result)

       # 평균 지표 출력
       avg_latency = sum(r['latency'] for r in results) / len(results)
       print(f"\n{'='*50}")
       print(f"평균 Latency: {avg_latency:.2f}초")
       print(f"목표 달성: {'✅' if avg_latency < 2.0 else '❌'} (목표: <2초)")
   ```

**완료 조건**:
- [ ] 3개 오디오 샘플 준비 완료
- [ ] STT 테스트 스크립트 실행 성공
- [ ] 전사 정확도 수동 확인 (90%+ 목표)
- [ ] Latency 측정 결과 기록
- [ ] 테스트 결과를 `docs/test-results/iteration-1-stt.md`에 문서화

**예상 시간**: 3-4시간

---

#### Task 1.2.2: STT Service API 구현

**작업 내용**:

1. **STT Service 모듈**
   ```python
   # ai-service/app/services/stt.py
   from openai import OpenAI
   import time
   import os

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
   ```

2. **FastAPI 엔드포인트**
   ```python
   # ai-service/app/main.py
   from fastapi import FastAPI, File, UploadFile, HTTPException
   from fastapi.middleware.cors import CORSMiddleware
   from app.services.stt import transcribe_audio
   import logging

   app = FastAPI(title="Onno AI Service")

   # CORS 설정
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

   # 로깅 설정
   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)

   @app.get("/health")
   async def health():
       return {"status": "ok", "service": "onno-ai"}

   @app.post("/api/stt/transcribe")
   async def transcribe(audio: UploadFile = File(...)):
       """
       음성 파일을 받아 텍스트로 전사
       """
       try:
           logger.info(f"Transcribing audio: {audio.filename}")

           result = await transcribe_audio(audio.file)

           logger.info(f"Transcription complete: {result['latency']:.2f}s")

           return result

       except Exception as e:
           logger.error(f"Transcription error: {str(e)}")
           raise HTTPException(status_code=500, detail=str(e))
   ```

3. **Postman/cURL 테스트**
   ```bash
   # cURL로 API 테스트
   curl -X POST "http://localhost:8000/api/stt/transcribe" \
     -F "audio=@test-data/audio-samples/sample-1-vc-pitch.mp3"
   ```

**완료 조건**:
- [ ] STT Service 모듈 구현
- [ ] FastAPI 엔드포인트 구현
- [ ] CORS 설정 완료
- [ ] 로깅 설정 완료
- [ ] Postman/cURL로 API 테스트 성공
- [ ] 에러 핸들링 구현

**예상 시간**: 2-3시간

---

### Phase 1-3: AI 질문 생성 서비스 (Day 4-5)

**예상 소요**: 1-2일
**우선순위**: 🔥 Critical

#### Task 1.3.1: Prompt Engineering v0.1

**작업 내용**:

1. **질문 생성 Prompt 설계**
   ```python
   # ai-service/app/services/question_generator.py
   from openai import OpenAI
   import os
   import json

   client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

   QUESTION_GENERATION_PROMPT = """
   당신은 경험이 풍부한 VC(Venture Capital) 투자 심사 전문가입니다.

   아래 대화를 분석하여, 투자자가 놓치기 쉬운 **중요한 질문 3개**를 제안하세요.

   ## 대화 전사:
   {transcript}

   ## 질문 생성 가이드라인:
   1. **이미 언급된 내용은 질문하지 마세요**
   2. **투자 의사결정에 필수적인 정보**를 묻는 질문을 우선합니다
   3. **구체적이고 실행 가능한 질문**을 만드세요
   4. **카테고리별 균형**을 맞추세요 (metrics, team, strategy, risk)

   ## 출력 형식 (JSON):
   {{
     "questions": [
       {{
         "text": "구체적인 질문 텍스트 (한국어)",
         "priority": "critical" | "important" | "follow_up",
         "reason": "이 질문이 왜 중요한지 간단히 설명 (1-2문장)",
         "category": "metrics" | "team" | "strategy" | "risk"
       }}
     ]
   }}

   ## Priority 정의:
   - **critical**: 투자 의사결정에 필수적인 정보
   - **important**: 중요하지만 나중에 물어도 되는 질문
   - **follow_up**: 추가적인 디테일을 확인하는 질문
   """

   async def generate_questions(transcript: str):
       """
       대화 전사 내용을 분석하여 AI 질문 생성

       Args:
           transcript: 대화 전사 텍스트

       Returns:
           dict: {
               "questions": [
                   {
                       "text": str,
                       "priority": str,
                       "reason": str,
                       "category": str
                   }
               ]
           }
       """
       response = client.chat.completions.create(
           model="gpt-4o",
           messages=[
               {
                   "role": "system",
                   "content": "You are an expert VC investment analyst."
               },
               {
                   "role": "user",
                   "content": QUESTION_GENERATION_PROMPT.format(transcript=transcript)
               }
           ],
           response_format={"type": "json_object"},
           temperature=0.7
       )

       result = json.loads(response.choices[0].message.content)
       return result
   ```

2. **테스트 시나리오 5개 준비**
   ```python
   # ai-service/test_questions.py
   import asyncio
   from app.services.question_generator import generate_questions

   test_scenarios = [
       {
           "name": "시나리오 1: CAC 언급, LTV 미언급",
           "transcript": """
           투자자: 고객 획득 비용이 어떻게 되나요?
           창업자: 저희 CAC는 약 3만원입니다. 주로 페이스북 광고를 통해 고객을 유치하고 있고요.
           투자자: 그렇군요. 현재 월간 활성 사용자는?
           창업자: 현재 MAU는 약 5000명입니다.
           """,
           "expected": "LTV는 얼마인가요?"
       },
       {
           "name": "시나리오 2: MRR 언급, Churn Rate 미언급",
           "transcript": """
           창업자: 저희 현재 MRR은 5000만원입니다. 지난 3개월간 30% 성장했습니다.
           투자자: 유료 고객은 몇 명인가요?
           창업자: 현재 250명입니다. 개인 플랜이 대부분이고요.
           투자자: 평균 결제 금액은?
           창업자: ARPU는 20만원입니다.
           """,
           "expected": "Churn Rate는 얼마인가요?"
       },
       # ... 나머지 3개 시나리오
   ]

   async def test_question_generation():
       for scenario in test_scenarios:
           print(f"\n{'='*60}")
           print(f"🧪 {scenario['name']}")
           print(f"{'='*60}")
           print(f"\n입력 대화:\n{scenario['transcript']}")

           result = await generate_questions(scenario['transcript'])

           print(f"\n생성된 질문:")
           for i, q in enumerate(result['questions'], 1):
               print(f"\n{i}. [{q['priority']}] {q['text']}")
               print(f"   이유: {q['reason']}")
               print(f"   카테고리: {q['category']}")

           print(f"\n기대 질문: {scenario['expected']}")
           print(f"포함 여부: {'✅' if any(scenario['expected'] in q['text'] for q in result['questions']) else '❌'}")

   if __name__ == "__main__":
       asyncio.run(test_question_generation())
   ```

**완료 조건**:
- [ ] Prompt v0.1 작성
- [ ] 5개 테스트 시나리오 준비
- [ ] 테스트 실행 및 결과 평가
- [ ] 질문 품질 평가 (적절성, 타이밍, 실용성 - 5점 척도)
- [ ] Prompt 개선 (필요 시)
- [ ] 테스트 결과 문서화 (`docs/test-results/iteration-1-questions.md`)

**예상 시간**: 3-4시간

---

#### Task 1.3.2: 질문 생성 API 구현

**작업 내용**:

1. **FastAPI 엔드포인트 추가**
   ```python
   # ai-service/app/main.py에 추가
   from app.services.question_generator import generate_questions
   from pydantic import BaseModel

   class QuestionRequest(BaseModel):
       transcript: str

   @app.post("/api/questions/generate")
   async def generate_questions_endpoint(request: QuestionRequest):
       """
       대화 전사를 받아 AI 질문 생성
       """
       try:
           logger.info(f"Generating questions for transcript length: {len(request.transcript)}")

           result = await generate_questions(request.transcript)

           logger.info(f"Generated {len(result['questions'])} questions")

           return result

       except Exception as e:
           logger.error(f"Question generation error: {str(e)}")
           raise HTTPException(status_code=500, detail=str(e))
   ```

2. **Postman 테스트**
   ```bash
   curl -X POST "http://localhost:8000/api/questions/generate" \
     -H "Content-Type: application/json" \
     -d '{
       "transcript": "투자자: CAC가 어떻게 되나요? 창업자: 3만원입니다."
     }'
   ```

**완료 조건**:
- [ ] API 엔드포인트 구현
- [ ] Request/Response 스키마 정의
- [ ] Postman 테스트 성공
- [ ] 응답 시간 측정 (목표: <1초)

**예상 시간**: 1-2시간

---

### Phase 1-4: WebSocket 실시간 파이프라인 (Day 6-7)

**예상 소요**: 2일
**우선순위**: 🔥 Critical

#### Task 1.4.1: Backend WebSocket 서버

**작업 내용**:

1. **WebSocket 서버 구현**
   ```typescript
   // backend/src/server.ts
   import express from 'express';
   import { createServer } from 'http';
   import { Server } from 'socket.io';
   import cors from 'cors';
   import axios from 'axios';
   import FormData from 'form-data';

   const app = express();
   app.use(cors());
   app.use(express.json());

   const httpServer = createServer(app);
   const io = new Server(httpServer, {
     cors: { origin: "*" }
   });

   const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

   // Health check
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', service: 'onno-backend' });
   });

   // WebSocket 연결 처리
   io.on('connection', (socket) => {
     console.log('Client connected:', socket.id);

     socket.on('join_meeting', (data) => {
       const { meetingId, userId } = data;
       socket.join(`meeting-${meetingId}`);
       console.log(`User ${userId} joined meeting ${meetingId}`);

       // 참가자에게 알림
       socket.to(`meeting-${meetingId}`).emit('participant_joined', {
         userId,
         timestamp: new Date().toISOString()
       });
     });

     socket.on('audio_chunk', async (data) => {
       const { meetingId, audioData } = data;

       try {
         // AI Service로 오디오 전송
         const formData = new FormData();
         formData.append('audio', Buffer.from(audioData), {
           filename: 'chunk.webm',
           contentType: 'audio/webm'
         });

         const sttResponse = await axios.post(
           `${AI_SERVICE_URL}/api/stt/transcribe`,
           formData,
           {
             headers: formData.getHeaders()
           }
         );

         const transcript = sttResponse.data;

         // 전사 결과를 클라이언트로 전송
         io.to(`meeting-${meetingId}`).emit('transcription', {
           id: Date.now().toString(),
           text: transcript.text,
           timestamp: new Date().toISOString(),
           latency: transcript.latency
         });

         // 전사가 일정 길이 이상이면 질문 생성
         if (transcript.text.length > 100) {
           const questionResponse = await axios.post(
             `${AI_SERVICE_URL}/api/questions/generate`,
             { transcript: transcript.text }
           );

           const questions = questionResponse.data.questions;

           // 질문들을 클라이언트로 전송
           questions.forEach((question: any) => {
             io.to(`meeting-${meetingId}`).emit('question_suggested', {
               id: Date.now().toString() + Math.random(),
               ...question,
               timestamp: new Date().toISOString()
             });
           });
         }

       } catch (error) {
         console.error('Audio processing error:', error);
         socket.emit('error', {
           type: 'audio_processing',
           message: 'Failed to process audio'
         });
       }
     });

     socket.on('leave_meeting', (data) => {
       const { meetingId, userId } = data;
       socket.leave(`meeting-${meetingId}`);
       console.log(`User ${userId} left meeting ${meetingId}`);

       socket.to(`meeting-${meetingId}`).emit('participant_left', {
         userId,
         timestamp: new Date().toISOString()
       });
     });

     socket.on('disconnect', () => {
       console.log('Client disconnected:', socket.id);
     });
   });

   const PORT = process.env.PORT || 3000;
   httpServer.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
   });
   ```

2. **package.json scripts 추가**
   ```json
   {
     "scripts": {
       "dev": "nodemon --exec ts-node src/server.ts",
       "build": "tsc",
       "start": "node dist/server.js"
     }
   }
   ```

**완료 조건**:
- [ ] WebSocket 서버 구현
- [ ] AI Service 연동
- [ ] 이벤트 핸들러 구현 (join_meeting, audio_chunk, leave_meeting)
- [ ] 에러 핸들링
- [ ] 로깅
- [ ] 서버 실행 확인

**예상 시간**: 3-4시간

---

#### Task 1.4.2: Frontend WebSocket 클라이언트

**작업 내용**:

1. **WebSocket Service**
   ```typescript
   // frontend/src/services/websocket.ts
   import { io, Socket } from 'socket.io-client';
   import { useMeetingStore } from '../stores/meetingStore';

   class WebSocketService {
     private socket: Socket | null = null;
     private meetingId: string | null = null;

     connect(wsUrl: string) {
       this.socket = io(wsUrl);

       this.socket.on('connect', () => {
         console.log('Connected to WebSocket server');
       });

       this.socket.on('transcription', (data) => {
         console.log('Transcription received:', data);
         useMeetingStore.getState().addTranscript(data);
       });

       this.socket.on('question_suggested', (data) => {
         console.log('Question suggested:', data);
         useMeetingStore.getState().addQuestion(data);
       });

       this.socket.on('participant_joined', (data) => {
         console.log('Participant joined:', data);
       });

       this.socket.on('participant_left', (data) => {
         console.log('Participant left:', data);
       });

       this.socket.on('error', (data) => {
         console.error('WebSocket error:', data);
       });

       this.socket.on('disconnect', () => {
         console.log('Disconnected from WebSocket server');
       });
     }

     joinMeeting(meetingId: string, userId: string) {
       this.meetingId = meetingId;
       this.socket?.emit('join_meeting', { meetingId, userId });
     }

     sendAudioChunk(audioData: Blob) {
       if (!this.meetingId) {
         console.error('No meeting joined');
         return;
       }

       const reader = new FileReader();
       reader.onload = () => {
         this.socket?.emit('audio_chunk', {
           meetingId: this.meetingId,
           audioData: reader.result
         });
       };
       reader.readAsArrayBuffer(audioData);
     }

     leaveMeeting(userId: string) {
       if (!this.meetingId) return;

       this.socket?.emit('leave_meeting', {
         meetingId: this.meetingId,
         userId
       });
       this.meetingId = null;
     }

     disconnect() {
       this.socket?.disconnect();
     }
   }

   export default new WebSocketService();
   ```

2. **Zustand Store**
   ```typescript
   // frontend/src/stores/meetingStore.ts
   import { create } from 'zustand';

   interface Transcript {
     id: string;
     text: string;
     timestamp: string;
     latency?: number;
   }

   interface Question {
     id: string;
     text: string;
     priority: 'critical' | 'important' | 'follow_up';
     reason: string;
     category: string;
     timestamp: string;
     action?: 'used' | 'ignored' | 'dismissed';
   }

   interface MeetingStore {
     transcripts: Transcript[];
     questions: Question[];
     isRecording: boolean;

     addTranscript: (transcript: Transcript) => void;
     addQuestion: (question: Question) => void;
     updateQuestionAction: (questionId: string, action: string) => void;
     setRecording: (isRecording: boolean) => void;
     reset: () => void;
   }

   export const useMeetingStore = create<MeetingStore>((set) => ({
     transcripts: [],
     questions: [],
     isRecording: false,

     addTranscript: (transcript) =>
       set((state) => ({
         transcripts: [...state.transcripts, transcript]
       })),

     addQuestion: (question) =>
       set((state) => ({
         questions: [...state.questions, question]
       })),

     updateQuestionAction: (questionId, action) =>
       set((state) => ({
         questions: state.questions.map((q) =>
           q.id === questionId ? { ...q, action } : q
         )
       })),

     setRecording: (isRecording) => set({ isRecording }),

     reset: () => set({ transcripts: [], questions: [], isRecording: false })
   }));
   ```

**완료 조건**:
- [ ] WebSocket Service 구현
- [ ] Zustand Store 구현
- [ ] 이벤트 리스너 구현
- [ ] 상태 관리 로직 구현

**예상 시간**: 2-3시간

---

### Phase 1-5: UI 컴포넌트 구현 (Day 8-9)

**예상 소요**: 2일
**우선순위**: 🔥 Critical

#### Task 1.5.1: AudioRecorder 컴포넌트

**작업 내용**:

```typescript
// frontend/src/components/AudioRecorder.tsx
import { useState, useRef, useEffect } from 'react';
import { useMeetingStore } from '../stores/meetingStore';

interface AudioRecorderProps {
  onAudioChunk: (blob: Blob) => void;
}

export function AudioRecorder({ onAudioChunk }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { setRecording } = useMeetingStore();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          onAudioChunk(e.data);
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setError('녹음 중 오류가 발생했습니다.');
      };

      // 5초마다 chunk 전송
      mediaRecorder.start(5000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecording(true);
      setError(null);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('마이크 접근 권한을 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording();
    };
  }, []);

  return (
    <div className="audio-recorder">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`record-button ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? '⏹️ 정지' : '🎤 녹음 시작'}
      </button>

      {isRecording && (
        <div className="recording-indicator">
          <span className="pulse"></span>
          녹음 중...
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
```

**완료 조건**:
- [ ] 컴포넌트 구현
- [ ] 마이크 권한 요청
- [ ] 녹음 시작/정지
- [ ] 5초마다 chunk 전송
- [ ] 에러 핸들링
- [ ] UI 피드백 (녹음 중 표시)

**예상 시간**: 2시간

---

#### Task 1.5.2: TranscriptPanel & QuestionCard 컴포넌트

**작업 내용**:

1. **TranscriptPanel**
   ```typescript
   // frontend/src/components/TranscriptPanel.tsx
   import { useMeetingStore } from '../stores/meetingStore';

   export function TranscriptPanel() {
     const { transcripts } = useMeetingStore();

     return (
       <div className="transcript-panel">
         <h3>📝 대화 내용</h3>
         <div className="transcript-list">
           {transcripts.length === 0 && (
             <p className="empty-state">대화가 전사되면 여기에 표시됩니다.</p>
           )}
           {transcripts.map((t) => (
             <div key={t.id} className="transcript-item">
               <p className="transcript-text">{t.text}</p>
               <span className="transcript-time">
                 {new Date(t.timestamp).toLocaleTimeString()}
                 {t.latency && ` (${t.latency.toFixed(2)}s)`}
               </span>
             </div>
           ))}
         </div>
       </div>
     );
   }
   ```

2. **QuestionCard**
   ```typescript
   // frontend/src/components/QuestionCard.tsx
   import { useMeetingStore } from '../stores/meetingStore';

   interface QuestionCardProps {
     question: {
       id: string;
       text: string;
       priority: 'critical' | 'important' | 'follow_up';
       reason: string;
       category: string;
       action?: string;
     };
   }

   const PRIORITY_LABELS = {
     critical: '🔥 필수',
     important: '⭐ 중요',
     follow_up: '💬 후속'
   };

   const PRIORITY_COLORS = {
     critical: '#ff4444',
     important: '#ff9944',
     follow_up: '#4499ff'
   };

   export function QuestionCard({ question }: QuestionCardProps) {
     const { updateQuestionAction } = useMeetingStore();

     const handleUse = () => {
       updateQuestionAction(question.id, 'used');
     };

     const handleDismiss = () => {
       updateQuestionAction(question.id, 'dismissed');
     };

     if (question.action === 'dismissed') {
       return null; // 숨김
     }

     return (
       <div
         className={`question-card ${question.action || ''}`}
         style={{ borderLeftColor: PRIORITY_COLORS[question.priority] }}
       >
         <div className="question-header">
           <span
             className="priority-badge"
             style={{ backgroundColor: PRIORITY_COLORS[question.priority] }}
           >
             {PRIORITY_LABELS[question.priority]}
           </span>
           <span className="category-badge">{question.category}</span>
         </div>

         <p className="question-text">{question.text}</p>
         <p className="question-reason">💡 {question.reason}</p>

         <div className="question-actions">
           <button onClick={handleUse} className="btn-use">
             ✅ 사용
           </button>
           <button onClick={handleDismiss} className="btn-dismiss">
             ❌ 무시
           </button>
         </div>
       </div>
     );
   }
   ```

**완료 조건**:
- [ ] TranscriptPanel 구현
- [ ] QuestionCard 구현
- [ ] Priority 표시
- [ ] Category 표시
- [ ] 액션 버튼 (사용/무시)
- [ ] 빈 상태 처리

**예상 시간**: 2-3시간

---

#### Task 1.5.3: MeetingRoom 통합 화면

**작업 내용**:

```typescript
// frontend/src/components/MeetingRoom.tsx
import { useEffect } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { TranscriptPanel } from './TranscriptPanel';
import { QuestionCard } from './QuestionCard';
import { useMeetingStore } from '../stores/meetingStore';
import websocketService from '../services/websocket';

export function MeetingRoom() {
  const { questions, isRecording, reset } = useMeetingStore();

  const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
  const MEETING_ID = 'prototype-meeting-1';
  const USER_ID = 'user-1';

  useEffect(() => {
    // WebSocket 연결
    websocketService.connect(WS_URL);
    websocketService.joinMeeting(MEETING_ID, USER_ID);

    return () => {
      websocketService.leaveMeeting(USER_ID);
      websocketService.disconnect();
      reset();
    };
  }, []);

  const handleAudioChunk = (blob: Blob) => {
    websocketService.sendAudioChunk(blob);
  };

  return (
    <div className="meeting-room">
      <header className="meeting-header">
        <h1>🎯 Onno 프로토타입</h1>
        <div className="meeting-status">
          {isRecording ? (
            <span className="status-recording">🔴 녹음 중</span>
          ) : (
            <span className="status-idle">⚪ 대기 중</span>
          )}
        </div>
      </header>

      <div className="meeting-controls">
        <AudioRecorder onAudioChunk={handleAudioChunk} />
      </div>

      <div className="meeting-content">
        <div className="left-panel">
          <TranscriptPanel />
        </div>

        <div className="right-panel">
          <div className="questions-section">
            <h3>💡 AI 질문 제안</h3>
            <div className="questions-list">
              {questions.length === 0 && (
                <p className="empty-state">
                  대화가 진행되면 AI가 질문을 제안합니다.
                </p>
              )}
              {questions
                .filter((q) => q.action !== 'dismissed')
                .map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**완료 조건**:
- [ ] MeetingRoom 컴포넌트 구현
- [ ] WebSocket 연결 관리
- [ ] 컴포넌트 통합
- [ ] 레이아웃 구성

**예상 시간**: 1-2시간

---

#### Task 1.5.4: 기본 스타일링

**작업 내용**:

```css
/* frontend/src/App.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #f5f5f5;
}

.meeting-room {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.meeting-header h1 {
  font-size: 32px;
  color: #333;
}

.meeting-status {
  font-size: 18px;
}

.status-recording {
  color: #ff4444;
  font-weight: bold;
}

.status-idle {
  color: #999;
}

.meeting-controls {
  margin-bottom: 30px;
  text-align: center;
}

.audio-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.record-button {
  padding: 20px 40px;
  font-size: 20px;
  border: none;
  border-radius: 50px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.record-button:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.record-button.recording {
  background: #ff4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ff4444;
  font-weight: bold;
}

.pulse {
  width: 12px;
  height: 12px;
  background: #ff4444;
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}

.meeting-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.left-panel, .right-panel {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transcript-panel h3,
.questions-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.transcript-list {
  max-height: 600px;
  overflow-y: auto;
}

.transcript-item {
  padding: 15px;
  margin-bottom: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #4CAF50;
}

.transcript-text {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #333;
}

.transcript-time {
  font-size: 12px;
  color: #999;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.question-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.question-card.used {
  opacity: 0.6;
  background: #f0f0f0;
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.priority-badge {
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.category-badge {
  padding: 4px 12px;
  border-radius: 12px;
  background: #e0e0e0;
  font-size: 12px;
  color: #666;
}

.question-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.5;
}

.question-reason {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
}

.question-actions {
  display: flex;
  gap: 10px;
}

.btn-use,
.btn-dismiss {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-use {
  background: #4CAF50;
  color: white;
}

.btn-use:hover {
  background: #45a049;
}

.btn-dismiss {
  background: #f5f5f5;
  color: #666;
}

.btn-dismiss:hover {
  background: #e0e0e0;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
}

.error-message {
  color: #ff4444;
  background: #ffe0e0;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}
```

**완료 조건**:
- [ ] 기본 레이아웃 스타일
- [ ] 컴포넌트별 스타일
- [ ] 반응형 디자인 (선택)
- [ ] 애니메이션 효과

**예상 시간**: 2시간

---

### Phase 1-6: End-to-End 테스트 (Day 10)

**예상 소요**: 1일
**우선순위**: 🔥 Critical

#### Task 1.6.1: 통합 테스트

**작업 내용**:

1. **3개 서버 동시 실행**
   ```bash
   # Terminal 1: AI Service
   cd ai-service
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000

   # Terminal 2: Backend
   cd backend
   npm run dev

   # Terminal 3: Frontend
   cd frontend
   npm run dev
   ```

2. **테스트 체크리스트**
   - [ ] Frontend 접속 (http://localhost:5173)
   - [ ] 녹음 시작 버튼 클릭
   - [ ] 마이크 권한 허용
   - [ ] 한국어로 말하기 (1-2분)
   - [ ] 전사 결과가 실시간으로 표시되는지 확인
   - [ ] AI 질문이 자동으로 생성되는지 확인
   - [ ] 질문 카드 액션 (사용/무시) 동작 확인
   - [ ] 녹음 정지
   - [ ] 에러 없이 종료되는지 확인

3. **성능 측정**
   - [ ] 음성 → 전사 Latency 측정 (목표: <2초)
   - [ ] 전사 → 질문 Latency 측정 (목표: <1초)
   - [ ] Total End-to-End Latency (목표: <5초)
   - [ ] STT 정확도 확인 (목표: 90%+)

4. **문제점 기록**
   ```markdown
   # 발견된 문제점

   ## P0 (치명적)
   - [ ] 문제 1: ...
   - [ ] 문제 2: ...

   ## P1 (중요)
   - [ ] 문제 1: ...
   - [ ] 문제 2: ...

   ## P2 (개선)
   - [ ] 문제 1: ...
   - [ ] 문제 2: ...
   ```

**완료 조건**:
- [ ] 전체 파이프라인 동작 확인
- [ ] 성능 지표 측정 및 기록
- [ ] 문제점 목록 작성
- [ ] 테스트 결과 문서화 (`docs/test-results/iteration-1-e2e.md`)

**예상 시간**: 3-4시간

---

#### Task 1.6.2: 사용자 피드백 수집

**작업 내용**:

1. **피드백 질문지**
   ```markdown
   # Onno 프로토타입 피드백

   ## 1. 전반적인 경험
   - 전체적인 인상은 어땠나요? (1-5)
   - 가장 좋았던 점은?
   - 가장 개선이 필요한 점은?

   ## 2. 실시간 전사 (STT)
   - 전사 정확도는 어땠나요? (1-5)
   - 전사 속도는 만족스러웠나요? (1-5)
   - 개선 의견:

   ## 3. AI 질문 제안
   - 질문이 적절했나요? (1-5)
   - 질문이 실제로 도움이 될 것 같나요? (1-5)
   - 질문의 타이밍은 적절했나요? (1-5)
   - 개선 의견:

   ## 4. 사용자 인터페이스
   - UI가 직관적이었나요? (1-5)
   - 실시간 느낌이 전달되었나요? (1-5)
   - 개선 의견:

   ## 5. 기타
   - 추가하고 싶은 기능:
   - 전체 코멘트:
   ```

2. **피드백 수집**
   - [ ] 본인 테스트 및 피드백 작성
   - [ ] 1-2명 추가 테스터 섭외 (선택)
   - [ ] 피드백 취합 및 분석

**완료 조건**:
- [ ] 피드백 질문지 준비
- [ ] 최소 1명 (본인) 피드백 수집
- [ ] 피드백 분석 및 문서화

**예상 시간**: 2시간

---

## 📊 Iteration 1 성공 지표 (재확인)

### 필수 (Must-have)
- [ ] STT 정확도 90%+
- [ ] End-to-End Latency < 5초
- [ ] AI 질문 3개 이상 생성 (3분 회의 기준)
- [ ] 실시간 UI 업데이트 동작

### 목표 (Should-have)
- [ ] STT 정확도 95%+
- [ ] Latency < 3초
- [ ] 질문 품질 평가 4.0+/5.0
- [ ] 사용자 피드백 수집 완료

---

## 📁 산출물 (Deliverables)

### 코드
- [ ] `frontend/` - React 프로토타입 앱
- [ ] `backend/` - Node.js WebSocket 서버
- [ ] `ai-service/` - Python FastAPI AI 서비스

### 문서
- [ ] `docs/test-results/iteration-1-stt.md` - STT 테스트 결과
- [ ] `docs/test-results/iteration-1-questions.md` - AI 질문 테스트 결과
- [ ] `docs/test-results/iteration-1-e2e.md` - End-to-End 테스트 결과
- [ ] `docs/test-results/iteration-1-feedback.md` - 사용자 피드백

### 기타
- [ ] 테스트 오디오 샘플 (3개)
- [ ] 스크린샷 또는 데모 영상 (선택)

---

## ⏱️ 일정 요약

| Day | Phase | 작업 내용 | 예상 시간 |
|-----|-------|----------|----------|
| 1-2 | 1-1 | 프로젝트 초기화 | 4-5시간 |
| 3-4 | 1-2 | STT 서비스 구현 | 6-8시간 |
| 4-5 | 1-3 | AI 질문 생성 | 4-6시간 |
| 6-7 | 1-4 | WebSocket 파이프라인 | 5-7시간 |
| 8-9 | 1-5 | UI 컴포넌트 | 7-9시간 |
| 10 | 1-6 | E2E 테스트 & 피드백 | 5-6시간 |
| **Total** | | | **31-41시간** |

**실제 달력 기간**: 7-10일 (1일 4-6시간 작업 가정)

---

## 🚀 다음 Iteration 계획 (Preview)

Iteration 1 완료 후, 결과에 따라 다음 중 하나를 선택:

### Option A: 프로토타입 완성도 높이기
- 개인화 시스템 Lv.1 추가
- 회의 히스토리 저장 (LocalStorage)
- UI/UX 개선

### Option B: 확장 기능 추가
- 관계 객체 시스템 프로토타입
- Notion 연동
- 페르소나 선택

### Option C: MVP로 발전
- DB 연동 (PostgreSQL + Prisma)
- 사용자 인증
- 배포 준비 (Vercel + Railway)

---

## 📝 Daily Log (작업 진행 중 업데이트)

### Day 1 (2025-12-02)
- [ ] Task 1.1.1: 프로젝트 구조 생성
- [ ] Task 1.1.2: 환경 변수 설정
- [ ] Task 1.1.3: 기본 서버 구동 확인

### Day 2
- [ ] ...

### Day 3
- [ ] ...

---

**작성자**: 박준홍 + Claude
**마지막 업데이트**: 2025-12-02
