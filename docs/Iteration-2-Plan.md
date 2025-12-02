# Iteration 2: 핵심 기능 고도화 계획

**작성일**: 2025-12-03
**담당**: 박준홍 + Claude
**기간**: 10-14일
**목표**: 프로덕션 수준의 핵심 기능 완성 및 개인화 기반 구축

---

## 📋 Iteration 2 개요

### 🎯 목표 (Goal)

1. **화자 분리**: 누가 말했는지 구분하여 대화 맥락 파악 향상
2. **회의 저장 시스템**: 회의록 저장, 히스토리 관리, 검색
3. **개인화 Lv.1**: 질문 사용 패턴 학습 및 선호도 반영
4. **맥락 인식 질문**: 이미 언급된 내용은 질문하지 않음
5. **UI/UX 개선**: 실제 사용 가능한 수준의 인터페이스

### 🔗 Iteration 1 결과 기반

**달성된 것**:
- ✅ STT 정확도 93%+ (목표: 90%+)
- ✅ E2E Latency 5.67초 (목표: <8초)
- ✅ AI 질문 생성 정상 동작
- ✅ 실시간 WebSocket 통신

**개선 필요**:
- ⚠️ 화자 구분 없음 → 누가 말했는지 모름
- ⚠️ 저장 기능 없음 → 회의 끝나면 사라짐
- ⚠️ 개인화 없음 → 모든 사용자에게 동일한 질문
- ⚠️ 맥락 무시 → 이미 답변된 내용도 질문

---

## 📊 성공 기준 (Success Criteria)

### 필수 (Must-have)

| 항목 | 기준 | 측정 방법 |
|------|------|----------|
| 화자 분리 정확도 | 85%+ | 10분 대화 샘플 수동 검증 |
| 회의 저장 | 100% 저장 성공 | 저장 후 복원 테스트 |
| 개인화 반영 | 3회 사용 후 차이 발생 | A/B 비교 |
| 중복 질문 제거 | 90%+ | 언급된 내용 재질문 비율 |

### 목표 (Should-have)

| 항목 | 기준 |
|------|------|
| 화자 분리 정확도 | 90%+ |
| 회의 검색 | 키워드 검색 동작 |
| 개인화 체감 | 사용자 피드백 4.0+/5.0 |
| UI 만족도 | 사용자 피드백 4.0+/5.0 |

---

## 📅 Phase별 실행 계획

### Phase 2-1: 화자 분리 (Speaker Diarization)

**예상 소요**: 2-3일
**우선순위**: 🔥 Critical

#### 목표
- Daglo Async API를 활용한 화자 분리
- "화자1 00:02" 형식의 타임스탬프 표시
- 투자자/창업자 역할 자동 추정

#### 작업 내용

**Task 2.1.1: Daglo Async API 연동**
```python
# ai-service/app/services/stt.py 수정
async def transcribe_with_diarization(audio_url: str) -> dict:
    """
    Daglo Async API로 화자 분리 전사

    Returns:
        {
            "text": "전체 텍스트",
            "formatted_text": "화자1 00:02\n내용...",
            "segments": [
                {
                    "speaker": "화자1",
                    "text": "발화 내용",
                    "startTime": 2.5,
                    "endTime": 8.3
                }
            ]
        }
    """
```

**Task 2.1.2: 오디오 파일 업로드 서비스**
- S3 또는 Cloudflare R2에 오디오 임시 저장
- Daglo Async API에 URL 전달
- 처리 완료 후 자동 삭제

**Task 2.1.3: 실시간 화자 표시 UI**
```typescript
// frontend/src/components/TranscriptPanel.tsx 수정
interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string;
  speakerRole?: 'investor' | 'founder' | 'unknown';
}

// 화자별 색상 구분
const SPEAKER_COLORS = {
  '화자1': '#4CAF50',
  '화자2': '#2196F3',
  '화자3': '#FF9800'
};
```

**Task 2.1.4: 화자 역할 추정**
```python
# 발화 패턴으로 역할 추정
def estimate_speaker_role(segments: list) -> dict:
    """
    투자자: 질문 비율 높음, "MRR", "CAC" 등 지표 질문
    창업자: 설명 비율 높음, "저희", "우리" 등 사용
    """
```

#### 완료 조건
- [ ] Daglo Async API 연동 완료
- [ ] 화자별 타임스탬프 표시
- [ ] UI에서 화자 구분 색상 표시
- [ ] 화자 분리 정확도 85%+ 달성

---

### Phase 2-2: 회의 저장 시스템

**예상 소요**: 3-4일
**우선순위**: 🔥 Critical

#### 목표
- 회의 데이터 영구 저장 (PostgreSQL)
- 회의 목록 조회 및 상세 보기
- 전사 내용 검색

#### 데이터베이스 스키마

**Task 2.2.1: PostgreSQL 스키마 설계**
```sql
-- 회의 테이블
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255),

  -- 회의 정보
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_seconds INT,

  -- 메타데이터
  meeting_type VARCHAR(50), -- investment_screening, mentoring, etc.
  status VARCHAR(20) DEFAULT 'active', -- active, ended, archived

  -- 요약 (AI 생성)
  summary TEXT,
  key_topics TEXT[],

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 전사 테이블
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,

  -- 전사 내용
  speaker VARCHAR(50),
  speaker_role VARCHAR(20), -- investor, founder, unknown
  text TEXT NOT NULL,

  -- 타이밍
  start_time FLOAT,
  end_time FLOAT,

  -- STT 메타
  provider VARCHAR(20), -- daglo, whisper
  confidence FLOAT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- AI 질문 테이블
CREATE TABLE suggested_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,

  -- 질문 내용
  text TEXT NOT NULL,
  priority VARCHAR(20), -- critical, important, follow_up
  reason TEXT,
  category VARCHAR(50), -- metrics, team, strategy, risk

  -- 사용자 액션
  action VARCHAR(20), -- used, ignored, dismissed
  action_at TIMESTAMP,

  -- 트리거된 전사 ID
  triggered_by_transcript_id UUID REFERENCES transcripts(id),

  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_started_at ON meetings(started_at DESC);
CREATE INDEX idx_transcripts_meeting_id ON transcripts(meeting_id);
CREATE INDEX idx_transcripts_text ON transcripts USING gin(to_tsvector('korean', text));
```

**Task 2.2.2: Backend API 구현**
```typescript
// backend/src/routes/meetings.ts

// 회의 목록 조회
GET /api/meetings
Query: { page, limit, search, type, status }

// 회의 상세 조회
GET /api/meetings/:id
Response: { meeting, transcripts, questions }

// 회의 시작
POST /api/meetings
Body: { title, type }

// 회의 종료
PUT /api/meetings/:id/end
Body: { summary }

// 회의 검색
GET /api/meetings/search
Query: { q, from, to }
```

**Task 2.2.3: 회의 히스토리 UI**
```typescript
// frontend/src/pages/MeetingHistory.tsx
- 회의 목록 (카드 그리드)
- 검색 및 필터
- 회의 상세 모달/페이지

// frontend/src/pages/MeetingDetail.tsx
- 전사 내용 타임라인
- 생성된 질문 목록
- AI 요약
```

#### 완료 조건
- [ ] PostgreSQL 스키마 생성
- [ ] Backend CRUD API 구현
- [ ] 회의 목록 페이지 구현
- [ ] 회의 상세 페이지 구현
- [ ] 전사 내용 검색 동작

---

### Phase 2-3: 개인화 시스템 Lv.1

**예상 소요**: 3-4일
**우선순위**: 🔥 Critical

#### 목표
- 질문 사용 패턴 학습
- 선호도 기반 질문 우선순위 조정
- 말투/톤 학습

#### 개인화 데이터 모델

**Task 2.3.1: 사용자 프로필 스키마**
```sql
-- 사용자 질문 선호도
CREATE TABLE user_question_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- 질문 유형별 선호도 (0.0 ~ 1.0)
  metrics_preference FLOAT DEFAULT 0.5,
  team_preference FLOAT DEFAULT 0.5,
  strategy_preference FLOAT DEFAULT 0.5,
  risk_preference FLOAT DEFAULT 0.5,

  -- 말투 선호
  tone VARCHAR(20) DEFAULT 'formal', -- formal, casual, direct
  include_term_explanation BOOLEAN DEFAULT false,
  language_style VARCHAR(20) DEFAULT 'mixed', -- korean, mixed, english

  -- 학습 데이터
  total_questions_seen INT DEFAULT 0,
  total_questions_used INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 질문 액션 로그 (학습 데이터)
CREATE TABLE question_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID REFERENCES suggested_questions(id),

  -- 원본 질문
  original_text TEXT,
  category VARCHAR(50),
  priority VARCHAR(20),

  -- 사용자 액션
  action VARCHAR(20), -- used, used_modified, ignored, dismissed
  modified_text TEXT, -- 수정한 경우

  -- 컨텍스트
  meeting_type VARCHAR(50),
  meeting_stage VARCHAR(50), -- introduction, financials, closing

  created_at TIMESTAMP DEFAULT NOW()
);
```

**Task 2.3.2: 학습 알고리즘**
```python
# ai-service/app/services/personalization.py

class PersonalizationEngine:
    def update_preferences(self, user_id: str, action_log: dict):
        """
        사용자 액션을 기반으로 선호도 업데이트

        - used: 해당 카테고리 선호도 +0.05
        - ignored: 해당 카테고리 선호도 -0.02
        - dismissed: 해당 카테고리 선호도 -0.05
        """

    def adjust_question_priority(
        self,
        questions: list,
        user_preferences: dict
    ) -> list:
        """
        사용자 선호도에 따라 질문 우선순위 재정렬
        """

    def learn_tone(self, original: str, modified: str):
        """
        사용자가 수정한 패턴을 학습
        - 공손한 톤 선호 감지
        - 용어 설명 추가 선호 감지
        """
```

**Task 2.3.3: 질문 생성 시 개인화 적용**
```python
# ai-service/app/services/question_generator.py 수정

async def generate_questions_personalized(
    transcript: str,
    user_id: str,
    context: dict
) -> dict:
    """
    1. 기본 질문 생성
    2. 사용자 선호도 로드
    3. 우선순위 재정렬
    4. 말투 조정
    5. 반환
    """
```

#### 완료 조건
- [ ] 선호도 DB 스키마 구현
- [ ] 액션 로깅 시스템 구현
- [ ] 학습 알고리즘 구현
- [ ] 질문 생성 시 개인화 적용
- [ ] 3회 사용 후 차이 발생 확인

---

### Phase 2-4: 맥락 인식 질문 (Context-Aware)

**예상 소요**: 2-3일
**우선순위**: 🔥 Critical

#### 목표
- 이미 언급된 내용은 질문하지 않음
- 대화 흐름에 맞는 질문 타이밍

#### 구현 내용

**Task 2.4.1: 전사 내용 분석**
```python
# ai-service/app/services/context_analyzer.py

class ContextAnalyzer:
    def extract_mentioned_topics(self, transcripts: list) -> dict:
        """
        전사 내용에서 이미 언급된 주제 추출

        Returns:
            {
                "metrics_mentioned": ["MRR", "CAC", "Churn"],
                "topics_discussed": ["비즈니스모델", "팀구성", "경쟁사"],
                "questions_answered": ["고객획득비용", "월매출"]
            }
        """

    def filter_redundant_questions(
        self,
        questions: list,
        mentioned_topics: dict
    ) -> list:
        """
        이미 언급된 내용과 관련된 질문 제거
        """
```

**Task 2.4.2: 프롬프트 개선**
```python
CONTEXT_AWARE_PROMPT = """
당신은 경험이 풍부한 VC 투자 심사 전문가입니다.

## 대화 전사:
{transcript}

## 이미 언급된 내용 (질문하지 마세요):
{mentioned_topics}

## 이미 답변된 질문:
{answered_questions}

위 내용을 제외하고, 아직 확인되지 않은 중요한 정보를 묻는 질문을 생성하세요.
"""
```

**Task 2.4.3: 질문 타이밍 최적화**
```python
def should_generate_questions(
    transcript_length: int,
    last_question_time: datetime,
    conversation_stage: str
) -> bool:
    """
    질문 생성 타이밍 결정

    - 최소 전사 길이 충족
    - 마지막 질문 후 일정 시간 경과
    - 대화 단계에 적합한 타이밍
    """
```

#### 완료 조건
- [ ] 언급된 주제 추출 로직 구현
- [ ] 중복 질문 필터링 동작
- [ ] 프롬프트에 맥락 반영
- [ ] 중복 질문 비율 10% 미만

---

### Phase 2-5: UI/UX 개선

**예상 소요**: 2-3일
**우선순위**: ⭐ Important

#### 목표
- 실제 사용 가능한 수준의 UI
- 반응형 디자인
- 로딩/에러 상태 처리

#### 작업 내용

**Task 2.5.1: 디자인 시스템**
```css
/* 색상 팔레트 */
:root {
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --gray-50: #F9FAFB;
  --gray-900: #111827;
}

/* 타이포그래피 */
--font-heading: 'Pretendard', sans-serif;
--font-body: 'Pretendard', sans-serif;
```

**Task 2.5.2: 컴포넌트 개선**
- 로딩 스켈레톤
- 에러 바운더리
- 토스트 알림
- 모달 시스템

**Task 2.5.3: 페이지 구조**
```
/                    → 대시보드 (회의 시작, 최근 회의)
/meeting/:id         → 실시간 회의 화면
/history             → 회의 히스토리
/history/:id         → 회의 상세
/settings            → 설정 (프로필, 개인화)
```

**Task 2.5.4: 반응형 디자인**
- 데스크톱 (1280px+)
- 태블릿 (768px - 1279px)
- 모바일 (~ 767px) - 기본 지원

#### 완료 조건
- [ ] 디자인 시스템 적용
- [ ] 모든 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 반응형 레이아웃 (데스크톱/태블릿)

---

## 🏗️ 기술 스택 추가

### 새로 추가되는 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| Database | PostgreSQL | 회의 데이터 저장 |
| ORM | Prisma | DB 쿼리 |
| Storage | Cloudflare R2 | 오디오 파일 임시 저장 |
| Auth | (Phase 3) | 사용자 인증 |

### 인프라 구성

```
┌─────────────────────────────────────────────────────┐
│                    Vercel                            │
│                  (Frontend)                          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                    Render                            │
│              (Backend + AI Service)                  │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│ PostgreSQL│  │   R2      │  │  Daglo    │
│ (Render)  │  │(Cloudflare)│ │   API     │
└───────────┘  └───────────┘  └───────────┘
```

---

## 📁 산출물 (Deliverables)

### 코드
- [ ] 화자 분리 STT 서비스
- [ ] 회의 CRUD API
- [ ] 개인화 엔진
- [ ] 맥락 분석기
- [ ] 개선된 UI 컴포넌트

### 문서
- [ ] `docs/test-results/iteration-2-diarization.md`
- [ ] `docs/test-results/iteration-2-personalization.md`
- [ ] `docs/test-results/iteration-2-e2e.md`

### 데이터베이스
- [ ] PostgreSQL 스키마
- [ ] 마이그레이션 스크립트

---

## ⏱️ 일정 요약

| Phase | 작업 내용 | 예상 소요 |
|-------|----------|----------|
| 2-1 | 화자 분리 | 2-3일 |
| 2-2 | 회의 저장 시스템 | 3-4일 |
| 2-3 | 개인화 Lv.1 | 3-4일 |
| 2-4 | 맥락 인식 질문 | 2-3일 |
| 2-5 | UI/UX 개선 | 2-3일 |
| **Total** | | **12-17일** |

---

## 🚀 다음 Iteration (Preview)

### Iteration 3: 관계 객체 & 확장
- 관계 객체 시스템 (Deal, Portfolio)
- Notion 연동
- 회의 요약 리포트 생성
- 사용자 인증 (OAuth)

### Iteration 4: 프로덕션 준비
- 성능 최적화
- 보안 강화
- 모니터링/로깅
- 정식 배포

---

**작성자**: Claude
**최종 업데이트**: 2025-12-03
