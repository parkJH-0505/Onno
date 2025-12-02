# Onno - PRD Part 3: 기술 아키텍처 및 구현

**연결 문서**: [Part 1 (전략)](./Onno%20-%20PRD%20(Product%20Requirement%20Document).md) | [Part 2 (기능)](./Onno%20-%20PRD%20Part%202%20(기능%20명세).md)

---

## Part 3: 기술 아키텍처 (How)

### 3-1. 시스템 아키텍처 Overview

```
┌────────────────────────────────────────────────────────────┐
│                   Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  React SPA   │  │  WebSocket   │  │  WebRTC      │    │
│  │  (Vite)      │  │  Client      │  │  Audio       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ HTTPS              │ WSS                │ WebRTC
         ↓                    ↓                    ↓
┌────────────────────────────────────────────────────────────┐
│                   API Gateway (CloudFlare)                 │
└────────────────────────────────────────────────────────────┘
         │                                         │
         ↓                                         ↓
┌─────────────────────┐               ┌─────────────────────┐
│   API Server        │               │  WebSocket Server   │
│   (Node.js/Express) │               │  (Socket.io)        │
│                     │               │                     │
│  - REST API         │               │  - Real-time STT    │
│  - Auth (JWT)       │               │  - AI Suggestions   │
│  - Business Logic   │               │  - Live Updates     │
└─────────────────────┘               └─────────────────────┘
         │                                         │
         ↓                                         ↓
┌─────────────────────┐               ┌─────────────────────┐
│  AI/ML Services     │               │  Message Queue      │
│  (Python FastAPI)   │               │  (Redis/BullMQ)     │
│                     │               │                     │
│  - STT (Whisper)    │               │  - Async Jobs       │
│  - LLM (GPT-4o)     │               │  - Background Task  │
│  - Embedding        │               └─────────────────────┘
│  - RAG Pipeline     │
└─────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────────┐
│                      Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │  Pinecone    │  │  Redis       │    │
│  │  (Primary DB)│  │  (Vector DB) │  │  (Cache)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  S3          │  │  MongoDB     │                       │
│  │  (Audio/Doc) │  │  (Logs)      │                       │
│  └──────────────┘  └──────────────┘                       │
└────────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────────┐
│                  External Integrations                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Notion  │  │  Google  │  │  Slack   │  │  Zoom    │  │
│  │  API     │  │  Calendar│  │  API     │  │  SDK     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

### 3-2. 기술 스택 (Tech Stack)

#### Frontend

```yaml
Framework: React 18.3
Build Tool: Vite 6.0
Language: TypeScript 5.3
State Management: Zustand (경량, 간단)
UI Components: shadcn/ui (Tailwind 기반)
Styling: Tailwind CSS 4.0
Real-time: Socket.io-client 4.7
Audio: WebRTC getUserMedia()
Icons: Lucide React
Charts: Recharts (통계용)
```

**Why React + Vite?**
- Vite: 빠른 HMR, 최적화된 빌드
- React: 생태계 풍부, 채용 용이
- TypeScript: 타입 안전성, 유지보수성

**Why Zustand?**
- Redux보다 간단 (보일러플레이트 적음)
- React Query와 잘 호환
- 번들 사이즈 작음 (3KB)

---

#### Backend API Server

```yaml
Runtime: Node.js 22.x
Framework: Express 4.x (또는 Fastify - 성능 필요 시)
Language: TypeScript
ORM: Prisma (PostgreSQL)
Authentication: JWT (jsonwebtoken)
Validation: Zod
Testing: Jest + Supertest
```

**API 구조**:
```
src/
├── routes/
│   ├── auth.ts          # POST /auth/signup, /login
│   ├── users.ts         # GET/PATCH /users/:id
│   ├── meetings.ts      # CRUD /meetings
│   ├── questions.ts     # GET /questions, POST /feedback
│   └── integrations.ts  # OAuth /integrations/notion
├── middlewares/
│   ├── auth.ts          # JWT 검증
│   ├── errorHandler.ts
│   └── rateLimiter.ts   # Rate limiting (100 req/min)
├── services/
│   ├── ai.service.ts    # AI/ML API 호출
│   ├── notion.service.ts
│   └── email.service.ts
├── utils/
│   ├── logger.ts        # Winston
│   └── encryption.ts    # bcrypt
└── app.ts
```

---

#### AI/ML Services (Python)

```yaml
Framework: FastAPI 0.110
ML Libraries:
  - openai (GPT-4o, Whisper, Embeddings)
  - langchain (LLM Orchestration)
  - pinecone-client (Vector DB)
Async: uvicorn + asyncio
Task Queue: Celery (Heavy jobs)
```

**서비스 구조**:
```
ai-services/
├── routers/
│   ├── stt.py           # POST /stt/transcribe
│   ├── questions.py     # POST /ai/suggest-questions
│   ├── actions.py       # POST /ai/extract-actions
│   └── rag.py           # POST /rag/search
├── models/
│   ├── question_generator.py
│   ├── action_extractor.py
│   └── context_retriever.py
├── prompts/
│   ├── question_prompts.py  # LLM Prompt 템플릿
│   └── action_prompts.py
└── main.py
```

---

#### WebSocket Server

```yaml
Framework: Socket.io 4.7
Runtime: Node.js
Features:
  - Room-based communication (meeting_id별 격리)
  - Binary data streaming (audio)
  - Reconnection handling
  - Auth middleware (JWT)
```

**이벤트 구조**:
```typescript
// Client → Server
socket.emit('join_meeting', { meeting_id, user_id });
socket.emit('audio_chunk', { data: ArrayBuffer });
socket.emit('end_meeting', { meeting_id });

// Server → Client
socket.on('transcription', (data) => {
  // { text, speaker, timestamp }
});
socket.on('question_suggested', (data) => {
  // { question, priority, reason }
});
socket.on('action_detected', (data) => {
  // { action, due_date, assignee }
});
```

---

### 3-3. 데이터베이스 설계

#### PostgreSQL Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL if OAuth
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  company VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Domains (관심 분야)
CREATE TABLE user_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  domain VARCHAR(50) NOT NULL, -- investment_screening, mentoring, etc.
  level INT DEFAULT 1, -- 1-5
  experience_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relationship Objects (관계 객체: 거래처/고객/스타트업별 저장소)
-- 상세: docs/Onno - 관계 객체 시스템 (Relationship Objects).md
CREATE TABLE relationship_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "A팀", "B사"
  type VARCHAR(50) NOT NULL, -- deal, portfolio, client, candidate, partner
  status VARCHAR(50) DEFAULT 'active', -- active, archived, completed, passed
  industry VARCHAR(100), -- "SaaS", "E-commerce"
  stage VARCHAR(50), -- "Series A", "Seed", "Growth"
  tags TEXT[], -- ["B2B", "AI", "Korea"]
  primary_contact JSONB, -- { name, email, phone, title }
  team_members JSONB[], -- [{ name, email, role }, ...]
  first_contact_date DATE,
  last_interaction_date TIMESTAMP,
  next_meeting_date TIMESTAMP,
  description TEXT,
  notes TEXT,
  custom_fields JSONB,
  engagement_score FLOAT, -- 0.0 ~ 1.0 (자동 계산)
  importance_level VARCHAR(20), -- high, medium, low
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relationship Data (관계 객체별 구조화된 데이터: 지표, KPI 등)
CREATE TABLE relationship_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationship_objects(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- metrics, financials, product, team
  key VARCHAR(100) NOT NULL, -- "MRR", "CAC", "Team Size"
  value_text TEXT,
  value_number FLOAT,
  value_date DATE,
  value_json JSONB,
  unit VARCHAR(20), -- "$", "%", "명"
  source VARCHAR(100), -- "피칭덱 p.12", "미팅 중 언급"
  confidence VARCHAR(20), -- verified, estimated, unverified
  recorded_at TIMESTAMP, -- 데이터 기준 시점
  meeting_id UUID, -- 어느 미팅에서 나온 정보인지
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relationship Files (관계 객체별 파일 저장소)
CREATE TABLE relationship_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationship_objects(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- pdf, xlsx, docx, pptx, image
  file_size_bytes BIGINT,
  file_url TEXT NOT NULL, -- S3 URL
  category VARCHAR(50), -- pitch_deck, financial, contract, product_demo
  tags TEXT[],
  description TEXT,
  uploaded_by UUID REFERENCES users(id),
  meeting_id UUID, -- 어느 미팅에서 받았는지
  extracted_text TEXT, -- AI 파싱 결과
  ai_summary TEXT, -- GPT 요약
  key_insights JSONB, -- AI 추출 인사이트
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES relationship_objects(id), -- 관계 객체 연결 (NEW)
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- investment_screening, mentoring, etc.
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INT,
  audio_url TEXT, -- S3 URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meeting Participants
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  participant_name VARCHAR(100) NOT NULL,
  participant_email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'guest', -- host, guest
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Transcripts
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  speaker VARCHAR(100),
  text TEXT NOT NULL,
  timestamp_offset_ms INT NOT NULL, -- 회의 시작부터 ms
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Questions
CREATE TABLE ai_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL, -- critical, important, follow_up
  reason TEXT,
  suggested_at TIMESTAMP DEFAULT NOW(),
  action VARCHAR(20), -- used, ignored, dismissed
  actioned_at TIMESTAMP
);

-- Action Items
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  assignee VARCHAR(100),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, completed
  integration_status JSON, -- { notion: { id: "...", synced: true }, calendar: { ... } }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Checklists
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(50),
  items JSONB NOT NULL, -- [{ id, text, checked }]
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Glossary (용어 사전)
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term VARCHAR(100) UNIQUE NOT NULL,
  aliases TEXT[], -- ARRAY of strings
  definition TEXT NOT NULL,
  example TEXT,
  category VARCHAR(50),
  difficulty VARCHAR(20), -- beginner, intermediate, advanced
  created_at TIMESTAMP DEFAULT NOW()
);

-- Benchmarks
CREATE TABLE benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric VARCHAR(100) NOT NULL,
  industry VARCHAR(50) NOT NULL,
  stage VARCHAR(50) NOT NULL,
  p25 FLOAT,
  p50 FLOAT,
  p75 FLOAT,
  unit VARCHAR(20),
  source VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(metric, industry, stage)
);

-- Integrations (OAuth tokens)
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL, -- notion, google_calendar, slack
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  workspace_id VARCHAR(255), -- Notion workspace, etc.
  settings JSONB, -- { default_database: "...", ... }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Indexes
CREATE INDEX idx_relationship_objects_user_id ON relationship_objects(user_id);
CREATE INDEX idx_relationship_objects_type ON relationship_objects(type);
CREATE INDEX idx_relationship_objects_status ON relationship_objects(status);
CREATE INDEX idx_relationship_data_relationship_id ON relationship_data(relationship_id);
CREATE INDEX idx_relationship_data_category ON relationship_data(category);
CREATE INDEX idx_relationship_files_relationship_id ON relationship_files(relationship_id);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_relationship_id ON meetings(relationship_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_transcripts_meeting_id ON transcripts(meeting_id);
CREATE INDEX idx_ai_questions_meeting_id ON ai_questions(meeting_id);
CREATE INDEX idx_action_items_meeting_id ON action_items(meeting_id);
```

---

#### Pinecone (Vector DB)

```typescript
// Index: onno-meetings
// Dimension: 3072 (text-embedding-3-large)
// Metric: cosine

interface VectorRecord {
  id: string; // transcript_id
  values: number[]; // embedding vector
  metadata: {
    meeting_id: string;
    user_id: string;
    relationship_id?: string; // 관계 객체 ID (NEW)
    relationship_name?: string; // "A팀", "B사" (NEW)
    speaker: string;
    text: string; // 원본 텍스트
    timestamp: number; // Unix timestamp
    domain: string; // investment_screening, etc.
  };
}

// Query 예시 1: 특정 관계 객체의 과거 대화 검색
pinecone.query({
  vector: query_embedding,
  topK: 5,
  filter: {
    user_id: { $eq: "user_123" },
    relationship_id: { $eq: "rel_a팀" } // A팀과의 과거 대화만 검색
  }
});

// Query 예시 2: 도메인별 검색 (기존)
pinecone.query({
  vector: query_embedding,
  topK: 5,
  filter: {
    user_id: { $eq: "user_123" },
    domain: { $eq: "investment_screening" }
  }
});
```

---

### 3-4. API 설계 (Detailed)

#### Auth APIs

```typescript
POST /api/auth/signup
Request:
{
  "email": "pocket.bjh@gmail.com",
  "password": "Password123!",
  "name": "박준홍"
}

Response: 201
{
  "user": {
    "id": "user_abc123",
    "email": "pocket.bjh@gmail.com",
    "name": "박준홍"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Errors:
- 400: Email already exists
- 422: Validation error (weak password)

---

POST /api/auth/login
Request:
{
  "email": "pocket.bjh@gmail.com",
  "password": "Password123!"
}

Response: 200
{
  "user": { ... },
  "token": "..."
}

Errors:
- 401: Invalid credentials
- 404: User not found

---

GET /api/auth/me
Headers: Authorization: Bearer <token>

Response: 200
{
  "user": {
    "id": "user_abc123",
    "email": "pocket.bjh@gmail.com",
    "name": "박준홍",
    "domains": [
      { "name": "investment_screening", "level": 4, "xp": 320 }
    ]
  }
}

Errors:
- 401: Invalid token
```

---

#### Meeting APIs

```typescript
POST /api/meetings
Headers: Authorization: Bearer <token>
Request:
{
  "title": "A팀 Series A 심사",
  "type": "investment_screening",
  "participants": [
    { "name": "김창업", "email": "kim@example.com" }
  ],
  "checklist_id": "checklist_789" // optional
}

Response: 201
{
  "meeting": {
    "id": "meeting_abc123",
    "title": "A팀 Series A 심사",
    "status": "active",
    "started_at": "2024-12-02T10:00:00Z",
    "websocket_url": "wss://onno.app/ws?meeting_id=meeting_abc123&token=..."
  },
  "context": {
    "past_meetings": [ ... ], // 과거 대화 요약
    "checklist": { ... }
  }
}

---

GET /api/meetings
Headers: Authorization: Bearer <token>
Query:
  - status: active | completed (optional)
  - limit: 20 (default)
  - offset: 0 (default)

Response: 200
{
  "meetings": [
    {
      "id": "meeting_abc123",
      "title": "A팀 Series A 심사",
      "status": "completed",
      "started_at": "2024-12-02T10:00:00Z",
      "ended_at": "2024-12-02T11:00:00Z",
      "duration_seconds": 3600,
      "participants": [ ... ],
      "summary": {
        "key_points": ["CAC $30", "MRR $50K"],
        "missed_questions": 3,
        "action_items": 2
      }
    }
  ],
  "total": 125,
  "has_more": true
}

---

GET /api/meetings/:id
Headers: Authorization: Bearer <token>

Response: 200
{
  "meeting": { ... },
  "transcripts": [ ... ],
  "questions": [ ... ],
  "action_items": [ ... ],
  "insights": {
    "key_points": [ ... ],
    "benchmarks": [ ... ],
    "missed_questions": [ ... ]
  }
}

---

PATCH /api/meetings/:id/end
Headers: Authorization: Bearer <token>

Response: 200
{
  "meeting": {
    "id": "meeting_abc123",
    "status": "completed",
    "ended_at": "2024-12-02T11:00:00Z",
    "duration_seconds": 3600
  }
}
```

---

#### AI APIs (Python FastAPI)

```python
@router.post("/ai/suggest-questions")
async def suggest_questions(
    meeting_id: str,
    transcript: str,
    context: QuestionContext
):
    """
    실시간 질문 제안

    Args:
        meeting_id: 회의 ID
        transcript: 마지막 N턴 전사 텍스트
        context: 회의 유형, 체크리스트, 도메인 등

    Returns:
        {
            "questions": [
                {
                    "id": "q_1",
                    "priority": "critical",
                    "text": "LTV는 얼마인가요?",
                    "reason": "...",
                    "suggested_at": "2024-12-02T10:15:30Z"
                }
            ],
            "processing_time_ms": 1200
        }
    """
    # 1. 대화 단계 인식
    stage = await classify_conversation_stage(transcript)

    # 2. 정보 누락 감지
    missing_info = await detect_missing_info(transcript, context)

    # 3. 체크리스트 매칭
    unchecked_items = await match_checklist(context.checklist_id, transcript)

    # 4. 질문 생성 (LLM)
    questions = await generate_questions(
        transcript=transcript,
        stage=stage,
        missing_info=missing_info,
        checklist=unchecked_items
    )

    # 5. 우선순위 라벨링
    prioritized = await prioritize_questions(questions)

    return {"questions": prioritized}

---

@router.post("/ai/extract-actions")
async def extract_actions(
    meeting_id: str,
    transcript: str
):
    """
    액션 아이템 추출

    Returns:
        {
            "actions": [
                {
                    "id": "action_1",
                    "text": "재무 자료 요청",
                    "assignee": "김창업",
                    "due_date": "2024-12-09",
                    "confidence": 0.92
                }
            ]
        }
    """
    prompt = ACTION_EXTRACTION_PROMPT.format(transcript=transcript)
    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an action item extractor..."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )

    actions = json.loads(response.choices[0].message.content)
    return {"actions": actions}

---

@router.post("/rag/search")
async def search_context(
    user_id: str,
    query: str,
    meeting_id: str = None,
    participants: List[str] = None,
    top_k: int = 5
):
    """
    과거 회의 맥락 검색 (RAG)

    Returns:
        {
            "results": [
                {
                    "meeting_id": "meeting_old123",
                    "text": "저희는 주로 Google Ads를 사용합니다",
                    "speaker": "김창업",
                    "timestamp": "2024-11-15T10:15:00Z",
                    "relevance_score": 0.92
                }
            ]
        }
    """
    # 1. Query embedding
    query_vector = await get_embedding(query)

    # 2. Pinecone search
    results = pinecone_index.query(
        vector=query_vector,
        top_k=top_k,
        filter={
            "user_id": user_id,
            "participants": {"$in": participants} if participants else None
        }
    )

    # 3. Format results
    formatted = [
        {
            "meeting_id": r.metadata["meeting_id"],
            "text": r.metadata["text"],
            "speaker": r.metadata["speaker"],
            "timestamp": r.metadata["timestamp"],
            "relevance_score": r.score
        }
        for r in results.matches
    ]

    return {"results": formatted}
```

---

### 3-5. 외부 연동 (Integrations)

#### Notion API

```typescript
// OAuth Flow
GET /api/integrations/notion/auth
→ Redirect to Notion OAuth page
→ User approves
→ Notion redirects to /api/integrations/notion/callback
→ Exchange code for access_token
→ Store in database

// Task Creation
POST /api/integrations/notion/tasks
Request:
{
  "meeting_id": "meeting_abc123",
  "action": {
    "text": "재무 자료 요청",
    "due_date": "2024-12-09",
    "assignee": "김창업"
  },
  "database_id": "notion_db_123" // from user settings
}

// Notion API Call
POST https://api.notion.com/v1/pages
Headers:
  Authorization: Bearer <user_access_token>
  Notion-Version: 2022-06-28

Body:
{
  "parent": { "database_id": "notion_db_123" },
  "properties": {
    "Name": { "title": [{ "text": { "content": "재무 자료 요청" } }] },
    "Due Date": { "date": { "start": "2024-12-09" } },
    "Assignee": { "people": [{ "object": "user", "id": "..." }] },
    "Status": { "status": { "name": "To Do" } },
    "Meeting Link": { "url": "https://onno.app/meetings/meeting_abc123" }
  }
}

Response: 200
{
  "id": "notion_page_123",
  "url": "https://notion.so/..."
}

// Update DB
UPDATE action_items
SET integration_status = jsonb_set(
  integration_status,
  '{notion}',
  '{"id": "notion_page_123", "synced": true}'::jsonb
)
WHERE id = 'action_1';
```

---

### 3-6. 보안 (Security)

#### Authentication & Authorization

```typescript
// JWT Payload
interface JWTPayload {
  user_id: string;
  email: string;
  iat: number; // issued at
  exp: number; // expires at (7 days)
}

// Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Usage
app.get('/api/meetings', authenticate, getMeetings);
```

#### Data Encryption

```typescript
// Password Hashing (bcrypt)
const hashedPassword = await bcrypt.hash(password, 10);

// Audio Files (S3 Server-Side Encryption)
AWS KMS: AES-256

// Database (PostgreSQL)
- Encryption at rest: AWS RDS 자동 암호화
- SSL/TLS in transit: REQUIRED

// PIPA 준수
- 개인정보 (이메일, 이름): Encrypted column
- 녹음 파일: 자동 삭제 옵션 (30일, 60일, 90일)
- 사용자 명시적 동의 필수
```

#### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 100 requests
  message: 'Too many requests, please try again later'
});

// AI Endpoints (expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 10 requests
  message: 'AI request limit exceeded'
});

app.use('/api/', globalLimiter);
app.use('/api/ai/', aiLimiter);
```

---

## Part 3 완료

다음: **Part 4 - 마스터플랜 (18개월 로드맵, 릴리스 계획, KPI, 위험 관리)**

계속 작성하시겠습니까?
