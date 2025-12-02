# Onno - 시스템 아키텍처 설계서 (System Architecture Design)

**작성일**: 2025-12-02
**버전**: 1.0
**목적**: 프로토타입 개발을 위한 상세 시스템 아키텍처 설계

**연결 문서**:
- [PRD Part 3 (기술 아키텍처)](./Onno%20-%20PRD%20Part%203%20(기술%20아키텍처).md)
- [인프라 아키텍처](./Onno%20-%20인프라%20아키텍처.md)
- [API 명세서](./Onno%20-%20API%20명세서.md)

---

## 목차

1. [High-Level Architecture](#1-high-level-architecture)
2. [Component 상세 설계](#2-component-상세-설계)
3. [Real-time Processing Pipeline](#3-real-time-processing-pipeline)
4. [AI/ML Pipeline](#4-aiml-pipeline)
5. [Data Flow](#5-data-flow)
6. [Performance Requirements](#6-performance-requirements)
7. [Security Architecture](#7-security-architecture)
8. [Error Handling & Resilience](#8-error-handling--resilience)

---

## 1. High-Level Architecture

### 1-1. 전체 시스템 구성도

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             React SPA (Vite + TypeScript)                │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │   Pages     │  │  Components │  │   Stores    │     │  │
│  │  │             │  │             │  │  (Zustand)  │     │  │
│  │  │ - Meeting   │  │ - AudioRec  │  │             │     │  │
│  │  │ - Dashboard │  │ - Transcript│  │ - meeting   │     │  │
│  │  │ - Relations │  │ - Questions │  │ - auth      │     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         WebSocket Client (Socket.io)             │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │      WebRTC Audio (getUserMedia)                 │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WSS
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Edge Layer (CDN)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               CloudFlare (CDN + DDoS)                    │  │
│  │  - Rate Limiting (100 req/min per IP)                   │  │
│  │  - SSL/TLS Termination                                  │  │
│  │  - Static Asset Caching                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐          ┌─────────────────────────┐  │
│  │   API Server        │          │  WebSocket Server       │  │
│  │   (Node.js/Express) │          │  (Socket.io)            │  │
│  │                     │          │                         │  │
│  │  - Auth (JWT)       │          │  - Real-time STT        │  │
│  │  - REST APIs        │          │  - Question Streaming   │  │
│  │  - Business Logic   │          │  - Meeting State        │  │
│  │  - Integrations     │          │  - Room Management      │  │
│  │                     │          │                         │  │
│  │  Ports: 3000        │          │  Ports: 3001            │  │
│  └─────────────────────┘          └─────────────────────────┘  │
│           │                                    │                │
│           └────────────────┬───────────────────┘                │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Message Queue (BullMQ + Redis)              │  │
│  │  - Async Jobs (Post-meeting processing)                 │  │
│  │  - Background Tasks (Data extraction, Email)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML Layer                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         AI Services (Python FastAPI)                     │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │   STT    │  │ Question │  │  Action  │  │   RAG   │ │  │
│  │  │ Service  │  │Generator │  │Extractor │  │ Service │ │  │
│  │  │          │  │          │  │          │  │         │ │  │
│  │  │ Whisper  │  │ GPT-4o   │  │ GPT-4o   │  │Pinecone │ │  │
│  │  │   API    │  │          │  │          │  │  Search │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │  │
│  │                                                          │  │
│  │  Ports: 8000                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │  Pinecone    │  │    Redis     │         │
│  │              │  │              │  │              │         │
│  │ - Users      │  │ - Embeddings │  │ - Sessions   │         │
│  │ - Meetings   │  │ - RAG Search │  │ - Cache      │         │
│  │ - Relations  │  │              │  │ - Queue      │         │
│  │              │  │              │  │              │         │
│  │ Port: 5432   │  │ HTTPS API    │  │ Port: 6379   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │   AWS S3     │  │   MongoDB    │                            │
│  │              │  │   (Optional) │                            │
│  │ - Audio      │  │              │                            │
│  │ - Files      │  │ - Logs       │                            │
│  │              │  │ - Analytics  │                            │
│  │              │  │              │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  OpenAI  │  │  Notion  │  │  Slack   │  │  Stripe  │       │
│  │   API    │  │   API    │  │   API    │  │   API    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1-2. 시스템 레이어 구조

```
┌───────────────────────────────────────┐
│  Presentation Layer (Frontend)        │  ← React SPA, WebSocket Client
├───────────────────────────────────────┤
│  API Gateway Layer                    │  ← CloudFlare, Rate Limiting
├───────────────────────────────────────┤
│  Application Layer                    │  ← API Server, WebSocket Server
├───────────────────────────────────────┤
│  Business Logic Layer                 │  ← Services, Controllers
├───────────────────────────────────────┤
│  AI/ML Layer                          │  ← Python FastAPI, OpenAI
├───────────────────────────────────────┤
│  Data Access Layer                    │  ← ORM (Prisma), Repositories
├───────────────────────────────────────┤
│  Data Layer                           │  ← PostgreSQL, Pinecone, Redis, S3
└───────────────────────────────────────┘
```

---

## 2. Component 상세 설계

### 2-1. Frontend Architecture (React SPA)

#### 프로젝트 구조

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component
│   │
│   ├── pages/                      # Page components
│   │   ├── auth/
│   │   │   ├── SignupPage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── meeting/
│   │   │   ├── MeetingPage.tsx        # 회의 중 화면
│   │   │   ├── MeetingDetailPage.tsx  # 회의 후 상세
│   │   │   └── MeetingListPage.tsx
│   │   └── relationships/
│   │       ├── RelationshipListPage.tsx
│   │       └── RelationshipDetailPage.tsx
│   │
│   ├── components/                 # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── meeting/
│   │   │   ├── AudioRecorder.tsx      # 🎤 오디오 녹음
│   │   │   ├── TranscriptPanel.tsx    # 📝 실시간 전사록
│   │   │   ├── QuestionCard.tsx       # 💡 AI 질문 제안
│   │   │   ├── ActionItemList.tsx     # ✅ 액션 아이템
│   │   │   └── MeetingTimer.tsx       # ⏱️ 타이머
│   │   └── relationship/
│   │       ├── RelationshipCard.tsx
│   │       ├── DataChart.tsx
│   │       └── FileList.tsx
│   │
│   ├── stores/                     # Zustand state management
│   │   ├── authStore.ts
│   │   ├── meetingStore.ts
│   │   ├── relationshipStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/                   # API & WebSocket services
│   │   ├── api/
│   │   │   ├── authApi.ts
│   │   │   ├── meetingApi.ts
│   │   │   ├── relationshipApi.ts
│   │   │   └── client.ts            # Axios instance
│   │   ├── websocket/
│   │   │   ├── socketClient.ts      # Socket.io client
│   │   │   └── handlers.ts          # Event handlers
│   │   └── audio/
│   │       ├── recorder.ts          # WebRTC audio recording
│   │       └── processor.ts         # Audio chunk processing
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useMeeting.ts
│   │   ├── useWebSocket.ts
│   │   ├── useAudioRecorder.ts
│   │   └── useRelationship.ts
│   │
│   ├── types/                      # TypeScript types
│   │   ├── meeting.ts
│   │   ├── relationship.ts
│   │   ├── user.ts
│   │   └── websocket.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   └── styles/                     # Tailwind CSS
│       └── globals.css
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

#### 핵심 컴포넌트 설계

##### 2-1-1. AudioRecorder Component

**책임**: 사용자 마이크로부터 오디오 스트림 캡처 → 청크 단위로 서버 전송

```typescript
// components/meeting/AudioRecorder.tsx

import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface AudioRecorderProps {
  meetingId: string;
  onError: (error: Error) => void;
}

export const AudioRecorder = ({ meetingId, onError }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { socket } = useWebSocket();

  // 녹음 시작
  const startRecording = async () => {
    try {
      // 1. 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper API 권장
        }
      });

      // 2. MediaRecorder 초기화
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;

      // 3. 오디오 청크 이벤트 핸들러
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket) {
          // WebSocket으로 오디오 청크 전송
          socket.emit('audio_chunk', {
            meeting_id: meetingId,
            audio_data: event.data,
            timestamp: Date.now(),
          });
        }
      };

      // 4. 1초마다 청크 생성
      mediaRecorder.start(1000);

      // 5. 볼륨 미터 설정
      setupVolumeMeter(stream);

      setIsRecording(true);
    } catch (error) {
      onError(error as Error);
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  // 볼륨 미터 (UI 피드백)
  const setupVolumeMeter = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);
    analyser.fftSize = 256;

    audioContextRef.current = audioContext;

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setVolume(average);

      if (isRecording) {
        requestAnimationFrame(updateVolume);
      }
    };

    updateVolume();
  };

  // 클린업
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="audio-recorder">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`record-button ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? '⏸️ 일시정지' : '🎤 녹음 시작'}
      </button>

      {isRecording && (
        <div className="volume-meter">
          <div
            className="volume-bar"
            style={{ width: `${(volume / 255) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
```

---

##### 2-1-2. WebSocket Client

**책임**: 서버와 양방향 실시간 통신

```typescript
// services/websocket/socketClient.ts

import io, { Socket } from 'socket.io-client';
import { useMeetingStore } from '@/stores/meetingStore';

class SocketClient {
  private socket: Socket | null = null;
  private meetingId: string | null = null;

  connect(token: string) {
    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // 연결 성공
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    // 연결 실패
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    // 실시간 전사록 수신
    this.socket.on('transcription', (data) => {
      const { text, speaker, timestamp } = data;
      useMeetingStore.getState().addTranscript({
        text,
        speaker,
        timestamp,
      });
    });

    // AI 질문 제안 수신
    this.socket.on('question_suggested', (data) => {
      const { question, priority, reason } = data;
      useMeetingStore.getState().addQuestion({
        id: crypto.randomUUID(),
        text: question,
        priority,
        reason,
        suggested_at: new Date(),
      });
    });

    // 액션 아이템 감지
    this.socket.on('action_detected', (data) => {
      const { action, due_date, assignee } = data;
      useMeetingStore.getState().addActionItem({
        text: action,
        due_date,
        assignee,
        status: 'pending',
      });
    });

    // 에러 수신
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      // UI에 에러 표시
    });
  }

  // 미팅 룸 참가
  joinMeeting(meetingId: string) {
    this.meetingId = meetingId;
    this.socket?.emit('join_meeting', { meeting_id: meetingId });
  }

  // 미팅 룸 퇴장
  leaveMeeting() {
    if (this.meetingId) {
      this.socket?.emit('leave_meeting', { meeting_id: this.meetingId });
      this.meetingId = null;
    }
  }

  // 오디오 청크 전송
  sendAudioChunk(meetingId: string, audioData: Blob) {
    this.socket?.emit('audio_chunk', {
      meeting_id: meetingId,
      audio_data: audioData,
      timestamp: Date.now(),
    });
  }

  // 연결 해제
  disconnect() {
    this.leaveMeeting();
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
```

---

##### 2-1-3. Meeting Store (Zustand)

**책임**: 회의 중 상태 관리

```typescript
// stores/meetingStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Transcript {
  id: string;
  text: string;
  speaker: string;
  timestamp: Date;
}

interface Question {
  id: string;
  text: string;
  priority: 'critical' | 'important' | 'follow_up';
  reason: string;
  suggested_at: Date;
  action?: 'used' | 'ignored' | 'dismissed';
}

interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  due_date?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MeetingState {
  // 회의 기본 정보
  meetingId: string | null;
  relationshipId: string | null;
  status: 'idle' | 'active' | 'paused' | 'completed';
  startedAt: Date | null;

  // 실시간 데이터
  transcripts: Transcript[];
  questions: Question[];
  actionItems: ActionItem[];

  // UI 상태
  isRecording: boolean;
  isConnected: boolean;

  // Actions
  startMeeting: (meetingId: string, relationshipId?: string) => void;
  endMeeting: () => void;
  pauseMeeting: () => void;
  resumeMeeting: () => void;

  addTranscript: (transcript: Omit<Transcript, 'id'>) => void;
  addQuestion: (question: Question) => void;
  updateQuestionAction: (questionId: string, action: Question['action']) => void;
  addActionItem: (item: Omit<ActionItem, 'id'>) => void;
  updateActionItemStatus: (itemId: string, status: ActionItem['status']) => void;

  setRecording: (isRecording: boolean) => void;
  setConnected: (isConnected: boolean) => void;

  reset: () => void;
}

export const useMeetingStore = create<MeetingState>()(
  devtools(
    (set) => ({
      // Initial state
      meetingId: null,
      relationshipId: null,
      status: 'idle',
      startedAt: null,
      transcripts: [],
      questions: [],
      actionItems: [],
      isRecording: false,
      isConnected: false,

      // Actions
      startMeeting: (meetingId, relationshipId) => set({
        meetingId,
        relationshipId,
        status: 'active',
        startedAt: new Date(),
        transcripts: [],
        questions: [],
        actionItems: [],
      }),

      endMeeting: () => set({
        status: 'completed',
        isRecording: false,
      }),

      pauseMeeting: () => set({ status: 'paused' }),
      resumeMeeting: () => set({ status: 'active' }),

      addTranscript: (transcript) => set((state) => ({
        transcripts: [
          ...state.transcripts,
          { ...transcript, id: crypto.randomUUID() }
        ],
      })),

      addQuestion: (question) => set((state) => ({
        questions: [...state.questions, question],
      })),

      updateQuestionAction: (questionId, action) => set((state) => ({
        questions: state.questions.map(q =>
          q.id === questionId ? { ...q, action } : q
        ),
      })),

      addActionItem: (item) => set((state) => ({
        actionItems: [
          ...state.actionItems,
          { ...item, id: crypto.randomUUID() }
        ],
      })),

      updateActionItemStatus: (itemId, status) => set((state) => ({
        actionItems: state.actionItems.map(item =>
          item.id === itemId ? { ...item, status } : item
        ),
      })),

      setRecording: (isRecording) => set({ isRecording }),
      setConnected: (isConnected) => set({ isConnected }),

      reset: () => set({
        meetingId: null,
        relationshipId: null,
        status: 'idle',
        startedAt: null,
        transcripts: [],
        questions: [],
        actionItems: [],
        isRecording: false,
      }),
    }),
    { name: 'MeetingStore' }
  )
);
```

---

### 2-2. Backend Architecture (Node.js API Server)

#### 프로젝트 구조

```
backend/
├── src/
│   ├── app.ts                      # Express app setup
│   ├── server.ts                   # HTTP server entry point
│   │
│   ├── routes/                     # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── meetings.routes.ts
│   │   ├── relationships.routes.ts
│   │   ├── questions.routes.ts
│   │   └── integrations.routes.ts
│   │
│   ├── controllers/                # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── meetings.controller.ts
│   │   ├── relationships.controller.ts
│   │   └── integrations.controller.ts
│   │
│   ├── services/                   # Business logic
│   │   ├── auth.service.ts
│   │   ├── meetings.service.ts
│   │   ├── relationships.service.ts
│   │   ├── ai.service.ts           # AI API 호출
│   │   ├── notion.service.ts
│   │   └── email.service.ts
│   │
│   ├── repositories/               # Data access
│   │   ├── user.repository.ts
│   │   ├── meeting.repository.ts
│   │   └── relationship.repository.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # JWT 검증
│   │   ├── errorHandler.ts
│   │   ├── validator.ts
│   │   ├── rateLimiter.ts
│   │   └── logger.ts
│   │
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── meeting.ts
│   │   └── user.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── encryption.ts
│   │   ├── logger.ts
│   │   └── errors.ts
│   │
│   ├── config/
│   │   ├── database.ts             # Prisma client
│   │   ├── redis.ts
│   │   └── env.ts
│   │
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
├── package.json
├── tsconfig.json
└── .env.example
```

---

#### 핵심 컴포넌트 설계

##### 2-2-1. API Server (Express)

```typescript
// src/app.ts

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json, urlencoded } from 'body-parser';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/logger';
import { rateLimiter } from './middlewares/rateLimiter';

export const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));

  // Body parsing
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use('/api/', rateLimiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', routes);

  // Error handling
  app.use(errorHandler);

  return app;
};
```

```typescript
// src/server.ts

import http from 'http';
import { createApp } from './app';
import { initWebSocketServer } from './websocket/server';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// HTTP Server (API)
const app = createApp();
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 API Server running on port ${PORT}`);
});

// WebSocket Server (별도 포트)
const wsServer = http.createServer();
initWebSocketServer(wsServer);

wsServer.listen(WS_PORT, () => {
  logger.info(`🔌 WebSocket Server running on port ${WS_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  wsServer.close(() => {
    logger.info('WebSocket server closed');
    process.exit(0);
  });
});
```

---

##### 2-2-2. Meeting Controller

```typescript
// src/controllers/meetings.controller.ts

import { Request, Response, NextFunction } from 'express';
import { meetingsService } from '../services/meetings.service';
import { CreateMeetingDTO } from '../types/meeting';

export const meetingsController = {
  // POST /api/meetings - 새 미팅 시작
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; // JWT에서 추출
      const dto: CreateMeetingDTO = req.body;

      // 1. 미팅 생성
      const meeting = await meetingsService.createMeeting(userId, dto);

      // 2. 관계 객체 컨텍스트 로드 (있으면)
      let context = null;
      if (dto.relationship_id) {
        context = await meetingsService.loadRelationshipContext(
          userId,
          dto.relationship_id
        );
      }

      // 3. WebSocket URL 생성
      const wsToken = generateWebSocketToken(userId, meeting.id);
      const wsUrl = `${process.env.WS_URL}?token=${wsToken}`;

      res.status(201).json({
        meeting: {
          id: meeting.id,
          title: meeting.title,
          status: meeting.status,
          started_at: meeting.started_at,
          websocket_url: wsUrl,
        },
        context, // 과거 대화, 체크리스트 등
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/meetings - 미팅 목록 조회
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { status, limit = 20, offset = 0 } = req.query;

      const result = await meetingsService.listMeetings(userId, {
        status: status as string,
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/meetings/:id - 미팅 상세 조회
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const meeting = await meetingsService.getMeetingDetail(userId, id);

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      res.json(meeting);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/meetings/:id/end - 미팅 종료
  async end(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      // 1. 미팅 종료 처리
      const meeting = await meetingsService.endMeeting(userId, id);

      // 2. 비동기 후처리 작업 큐에 추가
      await meetingsService.queuePostMeetingTasks(id);

      res.json({ meeting });
    } catch (error) {
      next(error);
    }
  },
};
```

---

##### 2-2-3. Meetings Service (Business Logic)

```typescript
// src/services/meetings.service.ts

import { prisma } from '../config/database';
import { aiService } from './ai.service';
import { queue } from '../config/queue';

export const meetingsService = {
  async createMeeting(userId: string, dto: CreateMeetingDTO) {
    const meeting = await prisma.meeting.create({
      data: {
        user_id: userId,
        relationship_id: dto.relationship_id,
        title: dto.title,
        type: dto.type,
        status: 'active',
        started_at: new Date(),
      },
      include: {
        relationship: true,
      },
    });

    return meeting;
  },

  async loadRelationshipContext(userId: string, relationshipId: string) {
    // 1. 관계 객체 정보 조회
    const relationship = await prisma.relationshipObject.findUnique({
      where: { id: relationshipId },
      include: {
        data: {
          orderBy: { recorded_at: 'desc' },
          take: 20, // 최근 20개 데이터
        },
        meetings: {
          where: { status: 'completed' },
          orderBy: { started_at: 'desc' },
          take: 3, // 최근 3회 미팅
          include: {
            transcripts: {
              take: 10, // 미팅당 최근 10개 전사록
            },
          },
        },
      },
    });

    if (!relationship) {
      return null;
    }

    // 2. 과거 대화 요약
    const pastMeetings = relationship.meetings.map(m => ({
      id: m.id,
      title: m.title,
      date: m.started_at,
      key_points: summarizeTranscripts(m.transcripts),
    }));

    // 3. 핵심 지표 정리
    const keyMetrics = relationship.data
      .filter(d => d.category === 'metrics')
      .reduce((acc, d) => {
        acc[d.key] = {
          value: d.value_number || d.value_text,
          unit: d.unit,
          updated_at: d.recorded_at,
        };
        return acc;
      }, {} as Record<string, any>);

    return {
      relationship: {
        id: relationship.id,
        name: relationship.name,
        type: relationship.type,
      },
      past_meetings: pastMeetings,
      key_metrics: keyMetrics,
    };
  },

  async getMeetingDetail(userId: string, meetingId: string) {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        user_id: userId,
      },
      include: {
        transcripts: {
          orderBy: { timestamp_offset_ms: 'asc' },
        },
        ai_questions: {
          orderBy: { suggested_at: 'asc' },
        },
        action_items: {
          orderBy: { created_at: 'asc' },
        },
        relationship: true,
      },
    });

    if (!meeting) {
      return null;
    }

    // 인사이트 생성
    const insights = await generateMeetingInsights(meeting);

    return {
      meeting,
      insights,
    };
  },

  async endMeeting(userId: string, meetingId: string) {
    const meeting = await prisma.meeting.updateMany({
      where: {
        id: meetingId,
        user_id: userId,
      },
      data: {
        status: 'completed',
        ended_at: new Date(),
      },
    });

    // duration_seconds 계산
    const updated = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (updated && updated.started_at && updated.ended_at) {
      const duration = Math.floor(
        (updated.ended_at.getTime() - updated.started_at.getTime()) / 1000
      );

      await prisma.meeting.update({
        where: { id: meetingId },
        data: { duration_seconds: duration },
      });
    }

    return updated;
  },

  async queuePostMeetingTasks(meetingId: string) {
    // BullMQ를 사용한 비동기 작업 큐
    await queue.add('post-meeting-processing', {
      meeting_id: meetingId,
      tasks: [
        'extract_action_items',
        'extract_relationship_data',
        'generate_summary',
        'create_embeddings',
        'send_email_summary',
      ],
    });
  },
};

// Helper functions
function summarizeTranscripts(transcripts: any[]) {
  // 전사록을 요약하는 로직 (나중에 AI로 교체)
  const speakers = [...new Set(transcripts.map(t => t.speaker))];
  const wordCount = transcripts.reduce((sum, t) => sum + t.text.split(' ').length, 0);

  return {
    speakers,
    word_count: wordCount,
    duration_estimate: Math.floor(wordCount / 150), // 150 words/min
  };
}

async function generateMeetingInsights(meeting: any) {
  // AI를 통한 인사이트 생성
  return {
    key_points: [], // GPT로 추출
    benchmarks: [], // 벤치마크 비교
    missed_questions: [], // 놓친 질문
  };
}
```

---

### 2-3. WebSocket Server Architecture

#### WebSocket Server 구조

```typescript
// src/websocket/server.ts

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyWebSocketToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { handleAudioChunk } from './handlers/audioHandler';
import { MeetingRoom } from './rooms/MeetingRoom';

const meetingRooms = new Map<string, MeetingRoom>();

export function initWebSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
    transports: ['websocket'],
  });

  // 인증 미들웨어
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const payload = verifyWebSocketToken(token);
      socket.data.userId = payload.userId;
      socket.data.meetingId = payload.meetingId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // 연결 처리
  io.on('connection', (socket: Socket) => {
    logger.info(`✅ Client connected: ${socket.id}`);

    const userId = socket.data.userId;

    // 미팅 룸 참가
    socket.on('join_meeting', async ({ meeting_id }) => {
      try {
        // 미팅 룸 생성 또는 참가
        let room = meetingRooms.get(meeting_id);

        if (!room) {
          room = new MeetingRoom(meeting_id, io);
          meetingRooms.set(meeting_id, room);
        }

        await room.addParticipant(socket, userId);
        logger.info(`User ${userId} joined meeting ${meeting_id}`);

      } catch (error) {
        socket.emit('error', { message: 'Failed to join meeting' });
      }
    });

    // 미팅 룸 퇴장
    socket.on('leave_meeting', ({ meeting_id }) => {
      const room = meetingRooms.get(meeting_id);
      if (room) {
        room.removeParticipant(socket.id);

        // 룸에 참가자 없으면 정리
        if (room.isEmpty()) {
          room.cleanup();
          meetingRooms.delete(meeting_id);
        }
      }
    });

    // 오디오 청크 수신
    socket.on('audio_chunk', async (data) => {
      const { meeting_id, audio_data, timestamp } = data;

      try {
        await handleAudioChunk(meeting_id, audio_data, timestamp, io);
      } catch (error) {
        logger.error('Audio chunk processing error:', error);
        socket.emit('error', { message: 'Audio processing failed' });
      }
    });

    // 연결 해제
    socket.on('disconnect', () => {
      logger.info(`❌ Client disconnected: ${socket.id}`);

      // 모든 룸에서 제거
      meetingRooms.forEach(room => {
        room.removeParticipant(socket.id);
      });
    });
  });

  return io;
}
```

---

#### Meeting Room 클래스

```typescript
// src/websocket/rooms/MeetingRoom.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export class MeetingRoom {
  private meetingId: string;
  private io: SocketIOServer;
  private participants: Map<string, { socket: Socket; userId: string }>;
  private audioBuffer: Buffer[] = [];
  private lastProcessedTime: number = 0;

  constructor(meetingId: string, io: SocketIOServer) {
    this.meetingId = meetingId;
    this.io = io;
    this.participants = new Map();
  }

  async addParticipant(socket: Socket, userId: string) {
    this.participants.set(socket.id, { socket, userId });
    socket.join(this.meetingId);

    // 기존 전사록 전송 (새 참가자용)
    const existingTranscripts = await this.loadExistingTranscripts();
    socket.emit('existing_transcripts', existingTranscripts);

    // 다른 참가자에게 알림
    socket.to(this.meetingId).emit('participant_joined', {
      user_id: userId,
      timestamp: Date.now(),
    });
  }

  removeParticipant(socketId: string) {
    const participant = this.participants.get(socketId);
    if (participant) {
      participant.socket.leave(this.meetingId);
      this.participants.delete(socketId);

      // 다른 참가자에게 알림
      this.io.to(this.meetingId).emit('participant_left', {
        user_id: participant.userId,
        timestamp: Date.now(),
      });
    }
  }

  isEmpty(): boolean {
    return this.participants.size === 0;
  }

  broadcast(event: string, data: any) {
    this.io.to(this.meetingId).emit(event, data);
  }

  async loadExistingTranscripts() {
    const transcripts = await prisma.transcript.findMany({
      where: { meeting_id: this.meetingId },
      orderBy: { timestamp_offset_ms: 'asc' },
      take: 50, // 최근 50개
    });

    return transcripts;
  }

  cleanup() {
    this.participants.clear();
    this.audioBuffer = [];
    logger.info(`Meeting room ${this.meetingId} cleaned up`);
  }
}
```

---

#### Audio Chunk Handler

```typescript
// src/websocket/handlers/audioHandler.ts

import { Server as SocketIOServer } from 'socket.io';
import { aiService } from '../../services/ai.service';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

// 오디오 청크 버퍼 (미팅별)
const audioBuffers = new Map<string, {
  chunks: Buffer[];
  lastProcessed: number;
}>();

export async function handleAudioChunk(
  meetingId: string,
  audioData: any,
  timestamp: number,
  io: SocketIOServer
) {
  // 1. 오디오 데이터를 Buffer로 변환
  const buffer = Buffer.from(audioData);

  // 2. 미팅별 버퍼에 추가
  let meetingBuffer = audioBuffers.get(meetingId);
  if (!meetingBuffer) {
    meetingBuffer = { chunks: [], lastProcessed: Date.now() };
    audioBuffers.set(meetingId, meetingBuffer);
  }

  meetingBuffer.chunks.push(buffer);

  // 3. 10초치 오디오가 쌓이면 STT 처리
  const now = Date.now();
  const timeSinceLastProcessed = now - meetingBuffer.lastProcessed;

  if (timeSinceLastProcessed >= 10000) { // 10초
    await processAudioBuffer(meetingId, meetingBuffer.chunks, io);

    // 버퍼 초기화
    meetingBuffer.chunks = [];
    meetingBuffer.lastProcessed = now;
  }
}

async function processAudioBuffer(
  meetingId: string,
  chunks: Buffer[],
  io: SocketIOServer
) {
  try {
    // 1. 청크들을 하나의 오디오 파일로 합치기
    const audioBlob = Buffer.concat(chunks);

    // 2. STT API 호출 (Whisper)
    const transcription = await aiService.transcribeAudio(audioBlob);

    if (!transcription.text || transcription.text.trim() === '') {
      return; // 빈 전사 결과는 무시
    }

    // 3. DB에 저장
    const transcript = await prisma.transcript.create({
      data: {
        meeting_id: meetingId,
        speaker: transcription.speaker || 'Unknown',
        text: transcription.text,
        timestamp_offset_ms: transcription.timestamp_offset_ms,
        confidence: transcription.confidence,
      },
    });

    // 4. 클라이언트에 실시간 전송
    io.to(meetingId).emit('transcription', {
      id: transcript.id,
      text: transcript.text,
      speaker: transcript.speaker,
      timestamp: transcript.timestamp_offset_ms,
    });

    logger.info(`✅ Transcription saved: ${transcript.text.substring(0, 50)}...`);

    // 5. 비동기로 AI 질문 생성 트리거
    triggerQuestionGeneration(meetingId, transcript.id);

  } catch (error) {
    logger.error('STT processing error:', error);
    io.to(meetingId).emit('error', {
      type: 'transcription_failed',
      message: 'Failed to transcribe audio',
    });
  }
}

async function triggerQuestionGeneration(
  meetingId: string,
  transcriptId: string
) {
  // 비동기로 질문 생성 (응답을 기다리지 않음)
  setImmediate(async () => {
    try {
      // 최근 5턴 대화 가져오기
      const recentTranscripts = await prisma.transcript.findMany({
        where: { meeting_id: meetingId },
        orderBy: { timestamp_offset_ms: 'desc' },
        take: 5,
      });

      // 미팅 컨텍스트 가져오기
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          relationship: {
            include: {
              data: true,
            },
          },
        },
      });

      // AI 질문 생성
      const questions = await aiService.generateQuestions({
        meeting_id: meetingId,
        transcripts: recentTranscripts.reverse(),
        context: {
          meeting_type: meeting?.type,
          relationship: meeting?.relationship,
        },
      });

      // 질문이 생성되면 클라이언트에 전송 (AI Service에서 처리)
    } catch (error) {
      logger.error('Question generation error:', error);
    }
  });
}
```

---

## 3. Real-time Processing Pipeline

### 3-1. End-to-End Data Flow (회의 중)

```
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Audio Capture (Client)                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  사용자 마이크 → getUserMedia()                               │
│                → MediaRecorder                               │
│                → 1초마다 Blob 생성                            │
│                                                              │
│  Latency: 실시간 (< 50ms)                                    │
└──────────────────────────────────────────────────────────────┘
                        │
                        │ WebSocket (Binary)
                        ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Audio Streaming (WebSocket)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Client → socket.emit('audio_chunk', { data, timestamp })    │
│         → WebSocket Server                                   │
│         → Meeting Room Buffer                                │
│                                                              │
│  Latency: < 100ms (네트워크)                                 │
└──────────────────────────────────────────────────────────────┘
                        │
                        │ 10초마다 배치 처리
                        ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Speech-to-Text (AI Layer)                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Buffer.concat(chunks)                                       │
│    → OpenAI Whisper API                                      │
│    → { text, speaker, confidence }                           │
│                                                              │
│  Latency: ~500ms (Whisper API)                               │
└──────────────────────────────────────────────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Save Transcript (Database)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  prisma.transcript.create({ ... })                           │
│    → PostgreSQL INSERT                                       │
│    → Return transcript ID                                    │
│                                                              │
│  Latency: ~50ms (DB write)                                   │
└──────────────────────────────────────────────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 5: Broadcast to Clients (WebSocket)                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  io.to(meetingId).emit('transcription', { ... })             │
│    → 모든 참가자에게 실시간 전송                               │
│                                                              │
│  Latency: < 50ms                                             │
└──────────────────────────────────────────────────────────────┘
                        │
                        │ (병렬 처리)
                        ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 6: AI Question Generation (Async)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  최근 5턴 대화 가져오기                                        │
│    → AI Service (Python FastAPI)                             │
│    → GPT-4o 질문 생성                                         │
│    → priority, reason 포함                                    │
│                                                              │
│  Latency: ~800ms (GPT-4o)                                    │
└──────────────────────────────────────────────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 7: Save & Broadcast Questions                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  prisma.aiQuestion.create({ ... })                           │
│    → PostgreSQL INSERT                                       │
│    → io.to(meetingId).emit('question_suggested', { ... })    │
│                                                              │
│  Latency: ~100ms                                             │
└──────────────────────────────────────────────────────────────┘

총 End-to-End Latency:
음성 입력 → 전사 표시: ~700ms
음성 입력 → 질문 제안: ~1.5s

목표: < 2초 ✅
```

---

### 3-2. Pipeline 최적화 전략

#### 병목 지점 및 해결

```
병목 1: STT API 호출 (~500ms)
해결:
- 배치 처리 (10초치 오디오를 한 번에 처리)
- 스트리밍 STT 고려 (WebSocket 기반 Whisper alternative)
- 캐싱 불가능 (매번 다른 음성)

병목 2: GPT-4o 질문 생성 (~800ms)
해결:
- 비동기 처리 (STT 완료 후 별도 실행)
- 프롬프트 최적화 (토큰 수 감소)
- 우선순위 질문만 실시간, 나머지는 배치

병목 3: DB Write
해결:
- Connection pooling (최대 20 connections)
- 인덱스 최적화 (meeting_id, timestamp)
- Read replica 사용 (조회는 replica로)

병목 4: WebSocket 동시 연결
해결:
- Redis Pub/Sub (여러 WS 서버 간 메시지 공유)
- Sticky sessions (같은 미팅은 같은 서버로)
- Load balancing (HAProxy 또는 ALB)
```

---

## 4. AI/ML Pipeline

### 4-1. AI Services Architecture (Python FastAPI)

#### 프로젝트 구조

```
ai-services/
├── main.py                         # FastAPI entry point
├── routers/
│   ├── stt.py                      # POST /stt/transcribe
│   ├── questions.py                # POST /ai/suggest-questions
│   ├── actions.py                  # POST /ai/extract-actions
│   ├── rag.py                      # POST /rag/search
│   └── data_extraction.py          # POST /ai/extract-data
│
├── services/
│   ├── stt_service.py              # Whisper API wrapper
│   ├── question_generator.py       # GPT-4o question generation
│   ├── action_extractor.py         # Action item extraction
│   ├── data_extractor.py           # Relationship data extraction
│   └── rag_service.py              # Pinecone RAG
│
├── prompts/
│   ├── question_prompts.py         # Prompt templates
│   ├── action_prompts.py
│   └── data_extraction_prompts.py
│
├── models/
│   ├── schemas.py                  # Pydantic models
│   └── types.py
│
├── config/
│   ├── openai_client.py
│   ├── pinecone_client.py
│   └── settings.py
│
└── utils/
    ├── logger.py
    └── errors.py
```

---

#### STT Service

```python
# services/stt_service.py

from openai import OpenAI
from config.openai_client import openai_client
from utils.logger import logger
import io

class STTService:
    def __init__(self):
        self.client = openai_client

    async def transcribe_audio(
        self,
        audio_data: bytes,
        language: str = "ko"
    ) -> dict:
        """
        Whisper API를 사용한 음성 전사

        Args:
            audio_data: 오디오 바이너리 데이터
            language: 언어 코드 (기본: 한국어)

        Returns:
            {
                "text": "전사된 텍스트",
                "language": "ko",
                "duration": 10.5,
                "confidence": 0.95
            }
        """
        try:
            # Whisper API 호출
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "audio.webm"

            response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
                response_format="verbose_json",  # confidence 포함
                timestamp_granularities=["word"]  # 단어별 타임스탬프
            )

            # 화자 분리 (간단한 휴리스틱)
            # MVP에서는 "User", "Guest"로 구분
            # 추후 화자 인식 모델 추가 예정
            speaker = self._detect_speaker(response.text)

            return {
                "text": response.text,
                "speaker": speaker,
                "language": response.language,
                "duration": response.duration,
                "confidence": self._calculate_confidence(response),
                "timestamp_offset_ms": 0,  # 회의 시작부터의 offset
            }

        except Exception as e:
            logger.error(f"STT error: {e}")
            raise

    def _detect_speaker(self, text: str) -> str:
        """
        간단한 화자 감지 (MVP)
        TODO: 화자 인식 모델 추가
        """
        # 질문 형태 → Guest로 추정
        if text.strip().endswith("?"):
            return "Guest"
        return "User"

    def _calculate_confidence(self, response) -> float:
        """
        단어별 confidence 평균 계산
        """
        if hasattr(response, 'words') and response.words:
            confidences = [w.confidence for w in response.words if hasattr(w, 'confidence')]
            return sum(confidences) / len(confidences) if confidences else 0.9
        return 0.9  # 기본값

stt_service = STTService()
```

---

#### Question Generator Service

```python
# services/question_generator.py

from openai import OpenAI
from config.openai_client import openai_client
from prompts.question_prompts import QUESTION_GENERATION_PROMPT
from utils.logger import logger
import json

class QuestionGenerator:
    def __init__(self):
        self.client = openai_client

    async def generate_questions(
        self,
        meeting_id: str,
        transcripts: list,
        context: dict
    ) -> list:
        """
        실시간 AI 질문 제안

        Args:
            meeting_id: 미팅 ID
            transcripts: 최근 N턴 대화 리스트
            context: {
                "meeting_type": "investment_screening",
                "relationship": { ... },
                "checklist": [ ... ]
            }

        Returns:
            [
                {
                    "text": "LTV는 얼마인가요?",
                    "priority": "critical",
                    "reason": "Unit Economics 확인 필요",
                    "category": "metrics"
                }
            ]
        """
        try:
            # 1. 대화 컨텍스트 구성
            conversation = "\n".join([
                f"{t['speaker']}: {t['text']}"
                for t in transcripts
            ])

            # 2. 프롬프트 생성
            prompt = QUESTION_GENERATION_PROMPT.format(
                meeting_type=context.get("meeting_type", "general"),
                conversation=conversation,
                relationship_context=self._format_relationship_context(context.get("relationship")),
                checklist=self._format_checklist(context.get("checklist"))
            )

            # 3. GPT-4o 호출
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert meeting assistant that suggests relevant questions in real-time."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=500
            )

            # 4. 결과 파싱
            result = json.loads(response.choices[0].message.content)
            questions = result.get("questions", [])

            logger.info(f"✅ Generated {len(questions)} questions for meeting {meeting_id}")

            return questions

        except Exception as e:
            logger.error(f"Question generation error: {e}")
            return []

    def _format_relationship_context(self, relationship: dict | None) -> str:
        """관계 객체 정보를 프롬프트 형식으로 변환"""
        if not relationship:
            return "N/A"

        lines = [f"- Name: {relationship.get('name')}"]

        # 핵심 지표 추가
        if 'data' in relationship:
            metrics = [d for d in relationship['data'] if d['category'] == 'metrics']
            for m in metrics[:5]:  # 최대 5개
                lines.append(f"- {m['key']}: {m['value_number']} {m.get('unit', '')}")

        return "\n".join(lines)

    def _format_checklist(self, checklist: list | None) -> str:
        """체크리스트를 프롬프트 형식으로 변환"""
        if not checklist:
            return "N/A"

        return "\n".join([f"- {item['text']}" for item in checklist])

question_generator = QuestionGenerator()
```

---

#### Question Generation Prompts

```python
# prompts/question_prompts.py

QUESTION_GENERATION_PROMPT = """
You are assisting a {meeting_type} meeting. Your job is to suggest 1-3 relevant questions based on the current conversation flow.

## Meeting Type: {meeting_type}

## Current Conversation:
{conversation}

## Relationship Context (Past Info):
{relationship_context}

## Checklist (Items to Cover):
{checklist}

## Instructions:
1. Analyze the conversation flow
2. Identify missing information or unclear points
3. Suggest 1-3 questions that would be most valuable RIGHT NOW
4. Prioritize questions:
   - "critical": Must ask immediately (missing key info)
   - "important": Should ask soon (helpful context)
   - "follow_up": Nice to ask later (additional detail)

## Output Format (JSON):
{{
  "questions": [
    {{
      "text": "질문 텍스트 (한국어)",
      "priority": "critical" | "important" | "follow_up",
      "reason": "왜 이 질문이 필요한지 설명",
      "category": "metrics" | "team" | "strategy" | "risk" | "other"
    }}
  ]
}}

## Examples for Investment Screening:

Conversation: "저희는 SaaS 제품을 만들고 있습니다."
Output:
{{
  "questions": [
    {{
      "text": "현재 MRR은 얼마인가요?",
      "priority": "critical",
      "reason": "SaaS 비즈니스의 핵심 지표 확인 필요",
      "category": "metrics"
    }},
    {{
      "text": "주요 타겟 고객은 누구인가요?",
      "priority": "important",
      "reason": "시장 포지셔닝 이해 필요",
      "category": "strategy"
    }}
  ]
}}

Now generate questions for the current conversation.
"""

# 미팅 유형별 프롬프트 변형
MEETING_TYPE_PROMPTS = {
    "investment_screening": """
Focus on:
- Financial metrics (MRR, CAC, LTV, Churn)
- Market size and competition
- Team background and expertise
- Risk factors and challenges
    """,

    "mentoring": """
Focus on:
- Current challenges and blockers
- Goal progress and milestones
- Decision-making support
- Skill development opportunities
    """,

    "sales": """
Focus on:
- Customer pain points
- Budget and timeline
- Decision-making process
- Objection handling
    """,
}
```

---

#### RAG Service (Pinecone)

```python
# services/rag_service.py

from pinecone import Pinecone
from config.pinecone_client import pinecone_client
from config.openai_client import openai_client
from utils.logger import logger

class RAGService:
    def __init__(self):
        self.pc = pinecone_client
        self.index = self.pc.Index("onno-meetings")
        self.openai = openai_client

    async def search_context(
        self,
        query: str,
        user_id: str,
        relationship_id: str | None = None,
        top_k: int = 5
    ) -> list:
        """
        과거 회의 맥락 검색 (RAG)

        Args:
            query: 검색 쿼리 (자연어)
            user_id: 사용자 ID
            relationship_id: 관계 객체 ID (옵션)
            top_k: 상위 K개 결과

        Returns:
            [
                {
                    "meeting_id": "...",
                    "text": "과거 대화 내용",
                    "speaker": "Guest",
                    "timestamp": "2024-11-15T10:30:00Z",
                    "relevance_score": 0.92
                }
            ]
        """
        try:
            # 1. Query 임베딩 생성
            query_embedding = await self._get_embedding(query)

            # 2. Pinecone 검색
            filter_dict = {"user_id": {"$eq": user_id}}

            if relationship_id:
                filter_dict["relationship_id"] = {"$eq": relationship_id}

            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=filter_dict,
                include_metadata=True
            )

            # 3. 결과 포맷팅
            formatted = [
                {
                    "meeting_id": match.metadata["meeting_id"],
                    "text": match.metadata["text"],
                    "speaker": match.metadata["speaker"],
                    "timestamp": match.metadata["timestamp"],
                    "relevance_score": match.score
                }
                for match in results.matches
            ]

            logger.info(f"✅ RAG search returned {len(formatted)} results")

            return formatted

        except Exception as e:
            logger.error(f"RAG search error: {e}")
            return []

    async def _get_embedding(self, text: str) -> list:
        """OpenAI Embeddings API"""
        response = self.openai.embeddings.create(
            model="text-embedding-3-large",
            input=text,
            dimensions=3072
        )
        return response.data[0].embedding

    async def create_embeddings(
        self,
        meeting_id: str,
        transcripts: list
    ):
        """
        회의 종료 후 전사록 임베딩 생성 및 저장
        """
        try:
            vectors = []

            for transcript in transcripts:
                # 임베딩 생성
                embedding = await self._get_embedding(transcript["text"])

                vectors.append({
                    "id": transcript["id"],
                    "values": embedding,
                    "metadata": {
                        "meeting_id": meeting_id,
                        "user_id": transcript["user_id"],
                        "relationship_id": transcript.get("relationship_id"),
                        "relationship_name": transcript.get("relationship_name"),
                        "speaker": transcript["speaker"],
                        "text": transcript["text"],
                        "timestamp": transcript["timestamp"],
                        "domain": transcript.get("domain", "general")
                    }
                })

            # Pinecone에 배치 업로드
            self.index.upsert(vectors=vectors)

            logger.info(f"✅ Created {len(vectors)} embeddings for meeting {meeting_id}")

        except Exception as e:
            logger.error(f"Embedding creation error: {e}")
            raise

rag_service = RAGService()
```

---

### 4-2. AI Pipeline Flow

```
[실시간 AI Pipeline - 회의 중]

1. STT (Whisper API)
   입력: 오디오 청크 (10초)
   출력: 전사 텍스트
   Latency: ~500ms
   비용: $0.006/분

2. Question Generation (GPT-4o)
   입력: 최근 5턴 대화 + 컨텍스트
   출력: 질문 1-3개 (priority, reason 포함)
   Latency: ~800ms
   비용: ~$0.03/request (500 tokens)

3. Action Detection (Real-time, Optional)
   입력: 새 전사록
   출력: 액션 아이템 감지
   Latency: ~600ms
   비용: ~$0.02/request

---

[배치 AI Pipeline - 회의 후]

4. Action Extraction (GPT-4o)
   입력: 전체 회의 전사록
   출력: 액션 아이템 리스트 (assignee, due_date)
   Latency: ~2s
   비용: ~$0.10/meeting (2K tokens)

5. Data Extraction (GPT-4o)
   입력: 전체 회의 전사록
   출력: 구조화된 데이터 (metrics, financials)
   Latency: ~2s
   비용: ~$0.10/meeting

6. Summary Generation (GPT-4o)
   입력: 전체 회의 전사록
   출력: 회의 요약 (key points, decisions)
   Latency: ~2s
   비용: ~$0.10/meeting

7. Embedding Creation (text-embedding-3-large)
   입력: 모든 전사록
   출력: 벡터 임베딩 → Pinecone 저장
   Latency: ~1s per 100 transcripts
   비용: ~$0.013/meeting (100K tokens)

---

[총 비용 (30분 회의 기준)]
- STT: $0.18 (30분)
- Question Generation: $0.60 (20회 생성)
- Action Extraction: $0.10
- Data Extraction: $0.10
- Summary: $0.10
- Embeddings: $0.013

총: ~$1.09 per meeting
```

---

### 4-3. AI 품질 관리

#### Prompt Version Control

```python
# prompts/question_prompts.py

PROMPT_VERSION = "v1.2.0"

# 프롬프트 변경 이력
CHANGELOG = """
v1.2.0 (2025-12-02):
- 관계 객체 컨텍스트 추가
- 체크리스트 연동 강화
- priority 기준 명확화

v1.1.0 (2025-11-15):
- 미팅 유형별 프롬프트 분리
- JSON 출력 포맷 개선

v1.0.0 (2025-11-01):
- 초기 버전
"""

# A/B 테스트를 위한 variant
PROMPT_VARIANTS = {
    "control": QUESTION_GENERATION_PROMPT,
    "experimental": QUESTION_GENERATION_PROMPT_V2,  # 테스트 중인 버전
}

def get_prompt(variant: str = "control") -> str:
    """프롬프트 variant 선택"""
    return PROMPT_VARIANTS.get(variant, PROMPT_VARIANTS["control"])
```

---

#### AI Response Validation

```python
# utils/ai_validation.py

from pydantic import BaseModel, Field, validator

class GeneratedQuestion(BaseModel):
    text: str = Field(..., min_length=10, max_length=200)
    priority: str = Field(..., regex="^(critical|important|follow_up)$")
    reason: str = Field(..., min_length=10)
    category: str

    @validator('text')
    def text_must_be_question(cls, v):
        """질문 형태 검증"""
        if not v.strip().endswith(('?', '요?', '가요?', '까요?')):
            raise ValueError('Question must end with a question mark')
        return v

class QuestionGenerationResponse(BaseModel):
    questions: list[GeneratedQuestion] = Field(..., max_items=3)

    @validator('questions')
    def check_priority_distribution(cls, v):
        """너무 많은 critical 질문 방지"""
        critical_count = sum(1 for q in v if q.priority == 'critical')
        if critical_count > 2:
            raise ValueError('Too many critical questions (max 2)')
        return v

# 사용 예시
def validate_ai_response(response_json: dict):
    try:
        validated = QuestionGenerationResponse(**response_json)
        return validated.dict()
    except Exception as e:
        logger.warning(f"AI response validation failed: {e}")
        return {"questions": []}  # 빈 결과 반환
```

---

## 5. Data Flow

### 5-1. 회의 시작 Flow

```
[Client]
  ↓
POST /api/meetings
{
  "title": "A팀 Series A 심사",
  "type": "investment_screening",
  "relationship_id": "rel_a팀"
}
  ↓
[API Server - meetingsController.create]
  1. JWT 검증 (userId 추출)
  2. DB에 meeting 생성 (status: active)
  3. relationship_id 있으면:
     → loadRelationshipContext()
     → 과거 미팅 3회 조회
     → 핵심 지표 조회
  4. WebSocket 토큰 생성
  ↓
Response:
{
  "meeting": {
    "id": "meeting_123",
    "websocket_url": "wss://..."
  },
  "context": {
    "past_meetings": [ ... ],
    "key_metrics": { "MRR": 50000, ... }
  }
}
  ↓
[Client]
  1. WebSocket 연결
  2. socket.emit('join_meeting', { meeting_id })
  3. AudioRecorder 시작
```

---

### 5-2. 실시간 전사 Flow

```
[Client - AudioRecorder]
  마이크 입력 → MediaRecorder
  → 1초마다 Blob 생성
  ↓
socket.emit('audio_chunk', {
  meeting_id: "meeting_123",
  audio_data: Blob,
  timestamp: 1701500000000
})
  ↓
[WebSocket Server - handleAudioChunk]
  1. Buffer에 청크 추가
  2. 10초치 쌓이면:
     → Buffer.concat(chunks)
     → AI Service 호출
  ↓
[AI Service - stt_service.transcribe_audio]
  1. OpenAI Whisper API 호출
  2. { text, speaker, confidence } 반환
  ↓
[WebSocket Server]
  1. prisma.transcript.create()
  2. io.to(meetingId).emit('transcription', { ... })
  ↓
[Client]
  socket.on('transcription', (data) => {
    meetingStore.addTranscript(data);
  })
  → UI 업데이트 (전사록 패널에 표시)
```

---

### 5-3. AI 질문 제안 Flow

```
[WebSocket Server - 전사록 저장 직후]
  triggerQuestionGeneration(meetingId, transcriptId)
  ↓
(비동기 실행)
  1. 최근 5턴 대화 조회
  2. 미팅 컨텍스트 조회 (relationship, type)
  ↓
[AI Service - question_generator.generate_questions]
  1. 대화 컨텍스트 + 프롬프트 구성
  2. GPT-4o 호출
  3. JSON 파싱 & 검증
  ↓
Response:
{
  "questions": [
    {
      "text": "LTV는 얼마인가요?",
      "priority": "critical",
      "reason": "...",
      "category": "metrics"
    }
  ]
}
  ↓
[WebSocket Server]
  1. prisma.aiQuestion.createMany()
  2. io.to(meetingId).emit('question_suggested', { ... })
  ↓
[Client]
  socket.on('question_suggested', (data) => {
    meetingStore.addQuestion(data);
  })
  → UI 업데이트 (질문 카드 표시)
```

---

### 5-4. 회의 종료 Flow

```
[Client]
  사용자가 "회의 종료" 버튼 클릭
  ↓
PATCH /api/meetings/:id/end
  ↓
[API Server - meetingsController.end]
  1. meeting.status = 'completed'
  2. meeting.ended_at = NOW()
  3. duration_seconds 계산
  4. queuePostMeetingTasks(meetingId)
  ↓
[BullMQ - Background Job]
Job: 'post-meeting-processing'
Tasks:
  1. extract_action_items
     → AI Service 호출
     → 액션 아이템 추출 & DB 저장

  2. extract_relationship_data
     → AI Service 호출
     → 구조화된 데이터 추출
     → relationship_data 테이블에 저장

  3. generate_summary
     → AI Service 호출
     → 회의 요약 생성

  4. create_embeddings
     → 모든 전사록 임베딩 생성
     → Pinecone에 저장

  5. send_email_summary
     → 사용자에게 이메일 발송
     → 회의 요약, 액션 아이템 포함
  ↓
완료 (5-10분 소요)
```

---

## 6. Performance Requirements

### 6-1. Latency Requirements

| 작업 | 목표 Latency | 현재 예상 | 상태 |
|------|-------------|----------|------|
| **실시간 전사** | < 2초 | ~700ms | ✅ |
| **AI 질문 제안** | < 2초 | ~1.5s | ✅ |
| **API 응답** | < 500ms | ~200ms | ✅ |
| **DB 쿼리** | < 100ms | ~50ms | ✅ |
| **WebSocket 메시지** | < 100ms | ~50ms | ✅ |

---

### 6-2. Throughput Requirements

| 메트릭 | MVP (100 users) | Year 1 (1,200 users) | Year 3 (4,500 users) |
|--------|----------------|---------------------|---------------------|
| **동시 회의** | 10개 | 120개 | 450개 |
| **WebSocket 연결** | 50개 | 600개 | 2,250개 |
| **STT 요청/분** | 100 req/min | 1,200 req/min | 4,500 req/min |
| **DB 쿼리/분** | 1,000 req/min | 12,000 req/min | 45,000 req/min |

---

### 6-3. Availability & Reliability

```
목표:
- Uptime: 99.5% (월 3.6시간 이내 다운타임)
- Error Rate: < 0.5%
- Data Loss: 0% (트랜잭션 보장)

전략:
1. Health Check
   - API: GET /health (매 30초)
   - DB: Connection pool 모니터링
   - WebSocket: Heartbeat (매 10초)

2. Graceful Degradation
   - STT 실패 시: 녹음 파일 저장 → 나중에 재처리
   - AI 실패 시: 기본 질문 템플릿 사용
   - DB 실패 시: Redis 캐시로 임시 대응

3. Auto-recovery
   - WebSocket 자동 재연결 (5초 간격, 최대 3회)
   - API 재시도 (Exponential backoff)
   - Queue 재처리 (실패 시 3회 재시도)
```

---

## 7. Security Architecture

### 7-1. Authentication Flow

```
[사용자 회원가입]
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "박준홍"
}
  ↓
[API Server]
  1. 이메일 중복 확인
  2. 비밀번호 강도 검증 (8자 이상, 숫자+문자+특수문자)
  3. bcrypt hash (salt rounds: 10)
  4. DB에 사용자 생성
  5. JWT 토큰 발급 (exp: 7일)
  ↓
Response:
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

---

[사용자 로그인]
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
  ↓
[API Server]
  1. 이메일로 사용자 조회
  2. bcrypt.compare(입력 password, DB password_hash)
  3. 일치하면 JWT 발급
  ↓
Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

---

[API 요청 시 인증]
GET /api/meetings
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  ↓
[Auth Middleware]
  1. Header에서 토큰 추출
  2. jwt.verify(token, SECRET_KEY)
  3. payload에서 userId 추출
  4. req.user = { id: userId }
  5. next()
```

---

### 7-2. Data Encryption

```
[전송 중 암호화 (In Transit)]
- HTTPS (TLS 1.3)
- WebSocket Secure (WSS)
- CloudFlare SSL

[저장 암호화 (At Rest)]
1. Database (PostgreSQL)
   - AWS RDS 자동 암호화 (AES-256)
   - SSL/TLS 연결 필수

2. Object Storage (S3)
   - Server-Side Encryption (SSE-S3)
   - Bucket policy: Private only

3. Redis
   - TLS 연결
   - 민감 데이터는 암호화 후 저장

[민감 정보 처리]
- Password: bcrypt hash (one-way)
- API Keys: AWS Secrets Manager
- OAuth Tokens: 암호화 후 DB 저장
```

---

### 7-3. Access Control

```
[역할 기반 접근 제어 (RBAC)]

Roles:
- owner: 미팅 생성자
- team_member: 팀 멤버 (Team 플랜)
- admin: 시스템 관리자

Permissions:
┌─────────────┬───────┬─────────────┬───────┐
│ Resource    │ Owner │ Team Member │ Admin │
├─────────────┼───────┼─────────────┼───────┤
│ Meeting     │ CRUD  │ Read        │ CRUD  │
│ Transcript  │ CRUD  │ Read        │ CRUD  │
│ Relationship│ CRUD  │ Read/Update │ CRUD  │
│ User        │ RU    │ R           │ CRUD  │
└─────────────┴───────┴─────────────┴───────┘

구현:
// middleware/auth.middleware.ts
export const authorize = (...allowedRoles: string[]) => {
  return async (req, res, next) => {
    const user = req.user;

    // 리소스 소유권 확인
    const resource = await getResource(req.params.id);

    if (resource.user_id !== user.id && !user.is_admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

// 사용
router.delete('/meetings/:id', authenticate, authorize('owner', 'admin'), deleteM```typescript
// 계속...
router.delete('/meetings/:id', authenticate, authorize('owner', 'admin'), deleteMeeting);
```

---

### 7-4. Rate Limiting

```typescript
// middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

// Global API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoint rate limit (비용이 높음)
export const aiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:ai:',
  }),
  windowMs: 60 * 1000, // 1분
  max: 10, // 최대 10 요청
  message: 'AI request limit exceeded',
});

// 사용
app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);
```

---

### 7-5. Input Validation

```typescript
// middleware/validator.ts

import { z } from 'zod';

// 회원가입 스키마
export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[a-z]/, 'Password must contain lowercase')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  name: z.string().min(2).max(100),
});

// 미팅 생성 스키마
export const createMeetingSchema = z.object({
  title: z.string().min(3).max(255),
  type: z.enum(['investment_screening', 'mentoring', 'sales', 'product_review']),
  relationship_id: z.string().uuid().optional(),
  participants: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
  })).optional(),
});

// 검증 미들웨어
export const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

// 사용
router.post('/auth/signup', validate(signupSchema), signupController);
router.post('/meetings', authenticate, validate(createMeetingSchema), createMeeting);
```

---

## 8. Error Handling & Resilience

### 8-1. Error Types & Handling

```typescript
// utils/errors.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, message);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError: any) {
    super(503, `${service} service unavailable`, false);
    this.name = 'ExternalServiceError';
  }
}
```

```typescript
// middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Operational errors (예상된 에러)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  // Programming errors (예상치 못한 에러)
  logger.error('Unexpected error:', {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Sentry에 에러 전송
  // Sentry.captureException(err);

  // 프로덕션에서는 상세 에러 숨김
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }

  // 개발 환경에서는 상세 에러 반환
  return res.status(500).json({
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
};
```

---

### 8-2. Retry Logic

```typescript
// utils/retry.ts

interface RetryOptions {
  maxAttempts: number;
  initialDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    initialDelay,
    maxDelay,
    backoffMultiplier,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff 계산
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 사용 예시
const result = await retryWithBackoff(
  () => openai.chat.completions.create({ ... }),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }
);
```

---

### 8-3. Circuit Breaker

```typescript
// utils/circuitBreaker.ts

enum CircuitState {
  CLOSED = 'CLOSED',     // 정상 작동
  OPEN = 'OPEN',         // 차단됨 (빠른 실패)
  HALF_OPEN = 'HALF_OPEN', // 회복 테스트 중
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(
    private threshold: number = 5,      // 연속 실패 임계값
    private timeout: number = 60000,    // OPEN 상태 유지 시간
    private halfOpenAttempts: number = 3 // HALF_OPEN에서 성공 필요 횟수
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // OPEN 상태: 빠른 실패
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      // Timeout 지났으면 HALF_OPEN으로 전환
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenAttempts) {
        this.state = CircuitState.CLOSED;
        logger.info('Circuit breaker transitioned to CLOSED');
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      logger.error('Circuit breaker transitioned to OPEN');
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// OpenAI API Circuit Breaker
export const openaiCircuitBreaker = new CircuitBreaker(5, 60000, 3);

// 사용 예시
try {
  const result = await openaiCircuitBreaker.execute(() =>
    openai.chat.completions.create({ ... })
  );
} catch (error) {
  // Fallback 로직
  logger.warn('OpenAI unavailable, using fallback');
  return getFallbackQuestions();
}
```

---

### 8-4. Graceful Shutdown

```typescript
// server.ts

import { logger } from './utils/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';

let isShuttingDown = false;

// SIGTERM/SIGINT 처리
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received, starting graceful shutdown...`);

  // 1. 새로운 요청 받지 않기
  server.close(() => {
    logger.info('HTTP server closed');
  });

  wsServer.close(() => {
    logger.info('WebSocket server closed');
  });

  // 2. 진행 중인 요청 완료 대기 (최대 30초)
  await Promise.race([
    new Promise(resolve => setTimeout(resolve, 30000)),
    waitForActiveRequests(),
  ]);

  // 3. DB 연결 종료
  await prisma.$disconnect();
  logger.info('Database disconnected');

  // 4. Redis 연결 종료
  await redis.quit();
  logger.info('Redis disconnected');

  // 5. 프로세스 종료
  process.exit(0);
}

async function waitForActiveRequests() {
  // 구현: 진행 중인 요청 카운터 확인
  // express-status-monitor 또는 custom middleware 사용
}

// Uncaught Exception 처리
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Sentry.captureException(error);
  process.exit(1);
});

// Unhandled Rejection 처리
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Sentry.captureException(reason);
});
```

---

## 요약

이 **시스템 아키텍처 설계서**는 Onno MVP 프로토타입 개발을 위한 완전한 청사진을 제공합니다.

### 주요 설계 결정

1. **Frontend**: React SPA + WebSocket Client (실시간 UX)
2. **Backend**: Node.js API + 별도 WebSocket Server (확장성)
3. **AI Layer**: Python FastAPI (OpenAI API 통합)
4. **Data**: PostgreSQL + Pinecone + Redis (다층 구조)
5. **Real-time**: WebSocket + 10초 배치 처리 (Latency <2초)
6. **Security**: JWT + bcrypt + TLS + RBAC
7. **Resilience**: Retry + Circuit Breaker + Graceful Degradation

### 다음 문서

이제 **인프라 아키텍처 문서**를 작성하겠습니다.
