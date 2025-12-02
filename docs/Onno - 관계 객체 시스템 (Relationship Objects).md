# Onno - 관계 객체 시스템 (Relationship Objects)

**연결 문서**: [PRD Part 3 (기술 아키텍처)](./Onno%20-%20PRD%20Part%203%20(기술%20아키텍처).md) | [나만의 온노 시스템](./Onno%20-%20나만의%20온노%20시스템%20(개인화%20상세%20기획).md)

**작성일**: 2025-12-02
**목적**: 각 거래처/고객/스타트업별 정보 저장소 시스템 설계

---

## 문제 정의

### 현재 아키텍처의 한계

**현재 (PRD Part 3)**:
```sql
-- user_context_profile: 엔티티 이름만 추적
CREATE TABLE user_context_profile (
  user_id UUID,
  entity_type VARCHAR(50), -- company, product, metric, person
  entity_name VARCHAR(255), -- "A팀", "김창업"
  frequency INT,
  last_mentioned TIMESTAMP
);
```

**문제점**:
- ❌ 단순 이름 문자열 - 구조화된 정보 없음
- ❌ 관계별 맥락 분리 안 됨 (A팀과 B팀 대화가 섞임)
- ❌ 파일/데이터 첨부 불가
- ❌ 프로젝트 타임라인 추적 불가
- ❌ 자동 컨텍스트 로드 한계

### 사용자가 원하는 것

**예시 시나리오**:

```
VC 투자심사관 박준서:

1. A팀 (Series A 투자 검토 중)
   - 지난 3번의 미팅 전사록
   - 받은 피칭덱 (PDF)
   - 재무 자료 (Excel)
   - 핵심 지표: MRR $50K, Churn 3%
   - 다음 미팅: 2024-12-15

2. B팀 (포트폴리오, 멘토링 중)
   - 투자 후 분기별 미팅 10회
   - 성장 지표 추이 (MRR $10K → $80K)
   - 주요 고민: 채용, 마케팅
   - 다음 미팅: 2024-12-10

→ 오늘 A팀 미팅 시작하면
  온노가 자동으로 "A팀 카드"를 로드
  → 지난 대화, 파일, 지표 즉시 활용
```

---

## 해결 방안: Relationship Objects (관계 객체)

### 핵심 개념

**Relationship Object = 거래처/고객/스타트업별 전용 저장소**

```
┌─────────────────────────────────────────┐
│  Relationship Object (관계 객체)        │
├─────────────────────────────────────────┤
│  - 기본 정보 (이름, 유형, 업종, 단계)    │
│  - 대화 히스토리 (미팅 N회)              │
│  - 파일 저장소 (문서, 재무자료)          │
│  - 구조화된 데이터 (지표, 타임라인)      │
│  - 관계 상태 (진행 단계, 다음 액션)      │
└─────────────────────────────────────────┘
```

**유형별 객체**:
- **Deal** (투자 검토 중인 스타트업)
- **Portfolio** (포트폴리오 회사)
- **Client** (세일즈 고객)
- **Candidate** (채용 후보)
- **Partner** (비즈니스 파트너)
- **Custom** (사용자 정의)

---

## Part 1: 데이터 모델

### 1-1. Relationship Objects Table

```sql
CREATE TABLE relationship_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- 기본 정보
  name VARCHAR(255) NOT NULL, -- "A팀", "B사"
  type VARCHAR(50) NOT NULL, -- deal, portfolio, client, candidate, partner
  status VARCHAR(50) DEFAULT 'active', -- active, archived, completed, passed

  -- 분류
  industry VARCHAR(100), -- "SaaS", "E-commerce", "FinTech"
  stage VARCHAR(50), -- "Series A", "Seed", "Growth"
  tags TEXT[], -- ["B2B", "AI", "Korea"]

  -- 연락처
  primary_contact JSONB, -- { name, email, phone, title }
  team_members JSONB[], -- [{ name, email, role }, ...]

  -- 타임라인
  first_contact_date DATE,
  last_interaction_date TIMESTAMP,
  next_meeting_date TIMESTAMP,

  -- 메타데이터
  description TEXT,
  notes TEXT,
  custom_fields JSONB, -- 사용자 정의 필드

  -- 관계 강도 (자동 계산)
  engagement_score FLOAT, -- 0.0 ~ 1.0 (미팅 빈도, 최근성 기반)
  importance_level VARCHAR(20), -- high, medium, low

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relationship_objects_user_id ON relationship_objects(user_id);
CREATE INDEX idx_relationship_objects_type ON relationship_objects(type);
CREATE INDEX idx_relationship_objects_status ON relationship_objects(status);
```

---

### 1-2. Relationship Data (구조화된 데이터)

```sql
-- 관계 객체별 구조화된 데이터 (지표, KPI 등)
CREATE TABLE relationship_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationship_objects(id) ON DELETE CASCADE,

  -- 데이터 유형
  category VARCHAR(50) NOT NULL, -- metrics, financials, product, team
  key VARCHAR(100) NOT NULL, -- "MRR", "CAC", "Team Size"

  -- 값 (다양한 타입 지원)
  value_text TEXT,
  value_number FLOAT,
  value_date DATE,
  value_json JSONB, -- 복잡한 구조

  -- 메타데이터
  unit VARCHAR(20), -- "$", "%", "명"
  source VARCHAR(100), -- "피칭덱 p.12", "2024 Q3 재무자료"
  confidence VARCHAR(20), -- verified, estimated, unverified

  -- 이력 관리
  recorded_at TIMESTAMP, -- 데이터 기준 시점
  meeting_id UUID REFERENCES meetings(id), -- 어느 미팅에서 나온 정보인지

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relationship_data_relationship_id ON relationship_data(relationship_id);
CREATE INDEX idx_relationship_data_category ON relationship_data(category);

-- 예시 데이터
INSERT INTO relationship_data VALUES
  (gen_random_uuid(), 'rel_a팀', 'metrics', 'MRR', NULL, 50000, NULL, NULL, '$', '2024-11 피칭덱', 'verified', '2024-11-01', 'meeting_123'),
  (gen_random_uuid(), 'rel_a팀', 'metrics', 'Churn Rate', NULL, 3.0, NULL, NULL, '%', '자사 데이터', 'verified', '2024-11-01', 'meeting_123'),
  (gen_random_uuid(), 'rel_a팀', 'team', 'Team Size', NULL, 12, NULL, NULL, '명', '대화 중 언급', 'estimated', '2024-11-15', 'meeting_456');
```

---

### 1-3. Relationship Files (파일 저장소)

```sql
-- 관계 객체별 파일/문서
CREATE TABLE relationship_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationship_objects(id) ON DELETE CASCADE,

  -- 파일 정보
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- pdf, xlsx, docx, pptx, image
  file_size_bytes BIGINT,
  file_url TEXT NOT NULL, -- S3 URL

  -- 분류
  category VARCHAR(50), -- pitch_deck, financial, contract, product_demo
  tags TEXT[],

  -- 메타데이터
  description TEXT,
  uploaded_by UUID REFERENCES users(id),
  meeting_id UUID REFERENCES meetings(id), -- 어느 미팅에서 받았는지

  -- 파싱 결과 (AI 분석)
  extracted_text TEXT, -- OCR/PDF 파싱 결과
  ai_summary TEXT, -- GPT가 생성한 요약
  key_insights JSONB, -- [{ type: "metric", key: "MRR", value: 50000 }, ...]

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relationship_files_relationship_id ON relationship_files(relationship_id);
CREATE INDEX idx_relationship_files_category ON relationship_files(category);
```

---

### 1-4. Meeting ↔ Relationship 연결

```sql
-- 기존 meetings 테이블 확장
ALTER TABLE meetings
ADD COLUMN relationship_id UUID REFERENCES relationship_objects(id);

CREATE INDEX idx_meetings_relationship_id ON meetings(relationship_id);

-- 이제 미팅 생성 시 관계 객체와 연결
INSERT INTO meetings (user_id, title, type, relationship_id) VALUES
  ('user_123', 'A팀 Series A 심사', 'investment_screening', 'rel_a팀');

-- 쿼리: A팀과의 모든 미팅 조회
SELECT * FROM meetings
WHERE relationship_id = 'rel_a팀'
ORDER BY started_at DESC;
```

---

## Part 2: 사용자 경험 (UX)

### 2-1. 관계 객체 관리 화면

```
┌────────────────────────────────────────────────────────┐
│  관계 객체 (Relationships)                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [+ 새 관계 추가]                   [🔍 검색]          │
│                                                        │
│  필터: [전체 ▾] [진행 중 ▾] [업종 ▾]                   │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ 📊 A팀                               🟢 Active │     │
│  │ SaaS · Series A · B2B                         │     │
│  │                                               │     │
│  │ MRR: $50K  |  Churn: 3%  |  Team: 12명        │     │
│  │ 마지막 미팅: 2024-11-28                        │     │
│  │ 다음 미팅: 2024-12-05                          │     │
│  │                                               │     │
│  │ [상세보기] [미팅 시작]                          │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ 💼 B사                               🔵 Portfolio │  │
│  │ E-commerce · Growth · 포트폴리오               │     │
│  │                                               │     │
│  │ MRR: $80K  |  Growth: 10%/mo  |  Team: 25명   │     │
│  │ 마지막 미팅: 2024-11-20                        │     │
│  │                                               │     │
│  │ [상세보기] [미팅 시작]                          │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 2-2. 관계 객체 상세 페이지

```
┌─────────────────────────────────────────────────────────┐
│  ← 돌아가기                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 A팀                                      [편집]     │
│  SaaS · Series A · B2B                                  │
│  🟢 Active - 투자 검토 중                                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 탭: [개요] [데이터] [파일] [미팅] [노트]         │   │
│  ├─────────────────────────────────────────────────┤   │
│  │                                                 │   │
│  │  📌 기본 정보                                    │   │
│  │  ├ 대표자: 김창업 (kim@example.com)             │   │
│  │  ├ 팀원: 이CTO, 박디자이너, ...                 │   │
│  │  ├ 첫 컨택: 2024-10-15                          │   │
│  │  └ 다음 미팅: 2024-12-05 14:00                  │   │
│  │                                                 │   │
│  │  📊 핵심 지표                                    │   │
│  │  ├ MRR: $50,000 (2024-11)                       │   │
│  │  ├ Churn Rate: 3% (2024-11)                     │   │
│  │  ├ CAC: $30 (2024 Q3)                           │   │
│  │  ├ Team Size: 12명                              │   │
│  │  └ [+ 지표 추가]                                │   │
│  │                                                 │   │
│  │  📁 최근 파일 (3)                                │   │
│  │  ├ 📄 피칭덱_2024.pdf (2024-11-15)              │   │
│  │  ├ 📊 재무자료_Q3.xlsx (2024-11-20)             │   │
│  │  └ 📝 사업계획서.docx (2024-10-20)              │   │
│  │  [모두 보기]                                    │   │
│  │                                                 │   │
│  │  💬 미팅 히스토리 (3회)                          │   │
│  │  ├ 2024-11-28: Series A 심사 2차 (1h 15m)      │   │
│  │  ├ 2024-11-15: Series A 심사 1차 (50m)         │   │
│  │  └ 2024-10-20: 초기 미팅 (30m)                  │   │
│  │  [모두 보기]                                    │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [🎯 새 미팅 시작]  [📁 파일 업로드]  [🗒️ 노트 작성]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 2-3. 미팅 시작 시 자동 컨텍스트 로드

**현재 문제**:
```
미팅 시작 → 온노가 범용 질문만 제안
사용자가 수동으로 "저번에 MRR $50K라고 했는데..." 기억해야 함
```

**관계 객체 적용 후**:
```
┌─────────────────────────────────────────────┐
│  새 미팅 시작                                │
├─────────────────────────────────────────────┤
│                                             │
│  누구와 미팅하시나요?                        │
│  [🔍 검색 또는 선택]                         │
│                                             │
│  추천:                                       │
│  ☑️  📊 A팀 (다음 미팅 예정: 오늘 14:00)    │
│  □  💼 B사                                   │
│  □  🏢 C코퍼레이션                           │
│                                             │
│  또는 [새 관계 추가]                         │
│                                             │
│  [계속]                                      │
└─────────────────────────────────────────────┘

A팀 선택 후:
┌─────────────────────────────────────────────┐
│  A팀 미팅 준비 완료                          │
├─────────────────────────────────────────────┤
│                                             │
│  📋 로드된 컨텍스트:                         │
│  ✅ 지난 미팅 2회 (2024-11-28, 11-15)       │
│  ✅ 핵심 지표 4개 (MRR, Churn, CAC, Team)   │
│  ✅ 파일 3개 (피칭덱, 재무자료, 사업계획서)   │
│                                             │
│  🎯 추천 질문 (지난 미팅 기반):              │
│  • MRR 업데이트 확인 (지난 달 $50K)          │
│  • Churn 개선 계획 (지난번 논의)            │
│  • 신규 채용 진행 상황                       │
│                                             │
│  [미팅 시작]                                 │
└─────────────────────────────────────────────┘
```

**미팅 중 실시간**:
```
[회의 중]
김창업: "요즘 마케팅에 고민이 많아요..."

온노 (자동 제안):
🟡 Important
"A팀은 지난 미팅에서 CAC $30이라고 하셨는데,
 현재 마케팅 채널별 성과는 어떤가요?"

→ 과거 컨텍스트 자동 활용
→ 사용자가 기억 안 해도 됨
```

---

## Part 3: AI 활용 (자동화)

### 3-1. 자동 데이터 추출

```python
# 미팅 후 자동 파이프라인
async def post_meeting_pipeline(meeting_id: str):
    meeting = await get_meeting(meeting_id)
    relationship_id = meeting.relationship_id

    if not relationship_id:
        # 관계 객체 미연결 시 제안
        await suggest_relationship_creation(meeting_id)
        return

    # 1. 전사록에서 구조화된 데이터 추출
    transcript = await get_full_transcript(meeting_id)
    extracted_data = await extract_structured_data(transcript)

    # extracted_data 예시:
    # {
    #   "metrics": [
    #     { "key": "MRR", "value": 55000, "unit": "$", "source": "대화 중 언급" },
    #     { "key": "Churn Rate", "value": 2.8, "unit": "%", "source": "김창업 발언" }
    #   ],
    #   "team": [
    #     { "key": "Team Size", "value": 15, "unit": "명" }
    #   ],
    #   "decisions": [
    #     "다음 주 재무자료 공유",
    #     "2주 후 2차 미팅"
    #   ]
    # }

    # 2. relationship_data에 저장
    for metric in extracted_data['metrics']:
        await create_relationship_data(
            relationship_id=relationship_id,
            category='metrics',
            key=metric['key'],
            value_number=metric['value'],
            unit=metric['unit'],
            source=metric['source'],
            meeting_id=meeting_id,
            recorded_at=datetime.now()
        )

    # 3. 사용자에게 확인 요청
    await notify_user(f"""
        A팀 미팅에서 새로운 정보를 추출했습니다:
        - MRR: $50K → $55K (10% 증가)
        - Churn: 3% → 2.8% (개선)

        관계 카드에 저장할까요?
        [✓ 저장] [수정] [무시]
    """)
```

---

### 3-2. 파일 자동 분석

```python
# 파일 업로드 시 자동 파싱
async def analyze_uploaded_file(file_id: str, relationship_id: str):
    file = await get_file(file_id)

    # 1. 텍스트 추출
    if file.file_type == 'pdf':
        text = await pdf_to_text(file.file_url)
    elif file.file_type in ['xlsx', 'csv']:
        text = await excel_to_text(file.file_url)

    # 2. AI 분석
    prompt = f"""
    다음 문서를 분석하여 핵심 정보를 추출하세요:

    문서 유형: {file.category}
    문서 이름: {file.file_name}

    내용:
    {text[:5000]}

    추출 항목:
    1. 핵심 지표 (MRR, CAC, Churn 등)
    2. 재무 데이터 (매출, 비용, 성장률)
    3. 팀 정보 (인원, 주요 인물)
    4. 중요 날짜 (마일스톤)

    JSON 형식으로 반환:
    {{
      "metrics": [{{ "key": "...", "value": ..., "unit": "..." }}],
      "financials": [...],
      "team": [...],
      "timeline": [...]
    }}
    """

    result = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    insights = json.loads(result.choices[0].message.content)

    # 3. relationship_data에 자동 저장
    for metric in insights['metrics']:
        await create_relationship_data(
            relationship_id=relationship_id,
            category='metrics',
            key=metric['key'],
            value_number=metric['value'],
            unit=metric['unit'],
            source=f"{file.file_name} (자동 추출)",
            confidence='estimated'  # 사용자 검증 필요
        )

    # 4. 파일 메타데이터 업데이트
    await update_file(file_id, {
        'ai_summary': insights.get('summary'),
        'key_insights': insights
    })
```

---

### 3-3. 스마트 리마인더

```python
# 매일 실행되는 백그라운드 작업
async def daily_relationship_check():
    users = await get_all_active_users()

    for user in users:
        relationships = await get_user_relationships(user.id, status='active')

        for rel in relationships:
            # 1. 다음 미팅 임박
            if rel.next_meeting_date:
                days_until = (rel.next_meeting_date - datetime.now()).days

                if days_until == 1:  # 내일 미팅
                    await send_notification(user.id, f"""
                        내일 {rel.name}과 미팅이 있습니다.

                        📋 준비된 컨텍스트:
                        - 지난 미팅: {rel.last_meeting_count}회
                        - 핵심 지표: MRR ${rel.latest_mrr}
                        - 미해결 질문: {rel.missed_questions_count}개

                        [미팅 준비하기]
                    """)

            # 2. 오랫동안 소통 없음
            days_since_last = (datetime.now() - rel.last_interaction_date).days

            if days_since_last > 30 and rel.importance_level == 'high':
                await send_notification(user.id, f"""
                    {rel.name}과 30일째 소통이 없습니다.
                    팔로업 미팅을 잡으시겠어요?

                    [미팅 일정 잡기]
                """)

            # 3. 데이터 업데이트 필요
            stale_data = await get_stale_relationship_data(rel.id, days=60)

            if len(stale_data) > 0:
                await send_notification(user.id, f"""
                    {rel.name}의 지표가 오래되었습니다:
                    - MRR (60일 전 데이터)
                    - Churn Rate (45일 전 데이터)

                    다음 미팅에서 업데이트를 요청할까요?
                    [자동 질문 추가]
                """)
```

---

## Part 4: API 설계

### 4-1. Relationship Objects API

```typescript
// Relationship CRUD
POST   /api/relationships
GET    /api/relationships
GET    /api/relationships/:id
PATCH  /api/relationships/:id
DELETE /api/relationships/:id

// Relationship Data
POST   /api/relationships/:id/data
GET    /api/relationships/:id/data
PATCH  /api/relationships/:id/data/:data_id

// Relationship Files
POST   /api/relationships/:id/files
GET    /api/relationships/:id/files
DELETE /api/relationships/:id/files/:file_id

// Relationship Meetings
GET    /api/relationships/:id/meetings
POST   /api/relationships/:id/meetings (새 미팅 시작)

// Analytics
GET    /api/relationships/:id/insights
GET    /api/relationships/:id/timeline
```

---

### 4-2. API 예시

```typescript
// POST /api/relationships
Request:
{
  "name": "A팀",
  "type": "deal",
  "industry": "SaaS",
  "stage": "Series A",
  "tags": ["B2B", "AI", "Korea"],
  "primary_contact": {
    "name": "김창업",
    "email": "kim@example.com",
    "title": "CEO"
  },
  "next_meeting_date": "2024-12-05T14:00:00Z"
}

Response: 201
{
  "relationship": {
    "id": "rel_abc123",
    "name": "A팀",
    "type": "deal",
    "status": "active",
    "engagement_score": 0.0,
    "created_at": "2024-12-02T10:00:00Z"
  }
}

---

// POST /api/relationships/:id/data
Request:
{
  "category": "metrics",
  "key": "MRR",
  "value_number": 50000,
  "unit": "$",
  "source": "피칭덱 p.12",
  "confidence": "verified",
  "recorded_at": "2024-11-01"
}

Response: 201
{
  "data": {
    "id": "data_xyz789",
    "relationship_id": "rel_abc123",
    "category": "metrics",
    "key": "MRR",
    "value_number": 50000,
    "unit": "$",
    "created_at": "2024-12-02T10:05:00Z"
  }
}

---

// GET /api/relationships/:id/insights
Response: 200
{
  "relationship": {
    "id": "rel_abc123",
    "name": "A팀"
  },
  "insights": {
    "meeting_frequency": {
      "total": 3,
      "last_30_days": 2,
      "avg_duration_minutes": 55
    },
    "data_trends": [
      {
        "key": "MRR",
        "values": [
          { "date": "2024-10-01", "value": 45000 },
          { "date": "2024-11-01", "value": 50000 },
          { "date": "2024-12-01", "value": 55000 }
        ],
        "trend": "up",
        "growth_rate": 22.2  // 45K → 55K
      }
    ],
    "missing_data": [
      "Churn Rate (60일 이상 업데이트 없음)",
      "Team Size (추정치만 존재)"
    ],
    "suggested_questions": [
      "최근 Churn Rate 업데이트 요청",
      "신규 채용 진행 상황 확인"
    ]
  }
}
```

---

## Part 5: 구현 우선순위

### MVP (Phase 1: Month 1-6)

**P0 (Must Have)**:
- [ ] `relationship_objects` 테이블 기본 CRUD
- [ ] `meetings.relationship_id` 연결
- [ ] 미팅 시작 시 관계 선택 UX
- [ ] 기본 관계 정보 표시 (이름, 지난 미팅 횟수)

**제외 (Post-MVP)**:
- ❌ `relationship_data` (구조화된 데이터) → Phase 2
- ❌ `relationship_files` (파일 저장) → Phase 2
- ❌ AI 자동 추출 → Phase 3

---

### Intelligence (Phase 2: Month 7-12)

**P1 (Should Have)**:
- [ ] `relationship_data` 구조화된 데이터 저장
- [ ] 미팅 후 자동 데이터 추출 (AI)
- [ ] 관계 객체 상세 페이지
- [ ] 데이터 트렌드 시각화

---

### Platform (Phase 3: Month 13-18)

**P2 (Nice to Have)**:
- [ ] `relationship_files` 파일 저장소
- [ ] 파일 자동 분석 (PDF/Excel 파싱)
- [ ] 스마트 리마인더
- [ ] 관계 강도 자동 계산 (`engagement_score`)
- [ ] 팀 단위 관계 공유

---

## Part 6: 경쟁 우위

### 기존 솔루션 vs Onno

| 기능 | Notion/Airtable | Salesforce | Onno |
|------|----------------|------------|------|
| **관계 저장** | ✅ 수동 입력 | ✅ 수동 입력 | ✅ **자동 추출** |
| **미팅 연동** | ❌ 별도 관리 | ❌ 별도 관리 | ✅ **실시간 연동** |
| **AI 질문 제안** | ❌ 없음 | ❌ 없음 | ✅ **컨텍스트 기반** |
| **파일 분석** | ❌ 수동 | ❌ 수동 | ✅ **AI 자동 파싱** |

### 핵심 차별점

**기존 CRM**:
```
사용자가 수동으로 모든 데이터 입력
→ 번거로움
→ 업데이트 누락
→ 실제 활용률 낮음
```

**Onno**:
```
미팅 중 자동으로 데이터 추출
→ 전사록 → AI 분석 → 자동 저장
→ 사용자 확인만 하면 됨
→ 실시간 업데이트

미팅 시작 시 자동 컨텍스트 로드
→ 과거 대화 + 지표 + 파일 즉시 활용
→ "준비 없이도 준비된 느낌"
```

---

## 요약

### 관계 객체 시스템이란

**한 줄 정의**:
> "각 거래처/고객/스타트업별 전용 저장소 + AI 자동 업데이트"

**핵심 가치**:
1. **자동화**: 미팅 → 자동 데이터 추출 → 저장
2. **컨텍스트**: 미팅 시작 → 과거 정보 즉시 로드
3. **인사이트**: 트렌드 분석, 누락 데이터 감지
4. **효율**: 수동 입력 최소화

### 구현 순서

- **Phase 1 (MVP)**: 기본 관계 연결 (미팅 ↔ 관계 객체)
- **Phase 2**: 구조화된 데이터 + AI 자동 추출
- **Phase 3**: 파일 분석 + 스마트 리마인더

### 차별점

**Notion/Salesforce**: 수동 CRM
**Onno**: **AI-Native Relationship Intelligence**

→ "대화하면 자동으로 관계 카드가 채워진다"
