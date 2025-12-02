# Onno - PRD Part 2 업데이트: 개인화 시스템 통합

**기존 문서**: [PRD Part 2 (기능 명세)](./Onno%20-%20PRD%20Part%202%20(기능%20명세).md)
**신규 추가**: [나만의 온노 시스템](./Onno%20-%20나만의%20온노%20시스템%20(개인화%20상세%20기획).md)

---

## 기존 PRD Part 2에 추가할 내용

### FR-003: "나만의 온노" 개인화 시스템 (P0/P1/P2)

---

#### FR-003-1: 사용자 학습 엔진 (P0 - MVP 필수)

**기능**: 질문 사용 패턴 자동 학습

**프로세스**:
```
1. 사용자가 AI 질문 제안 받음
2. 액션:
   - [사용하기] 클릭 → 사용 데이터 저장
   - [무시] (아무 액션 없음) → 무시 데이터 저장
   - [X 닫기] → 거부 데이터 저장

3. 백그라운드 학습:
   - 질문 유형별 선호도 계산
   - 톤/언어 스타일 분석
   - 사용자 프로필 업데이트

4. 다음 회의:
   - 선호 질문 유형 우선 제안
   - 비선호 유형 줄임
```

**API**:
```typescript
POST /api/questions/:id/feedback

Request:
{
  "action": "used", // used, ignored, dismissed
  "modified_text": "혹시 LTV 공유 가능하실까요?", // 선택, 수정한 경우
  "feedback_tags": ["timing_good", "helpful"] // 선택
}

Response: 200 OK

// 백그라운드 작업 (Queue)
// → user_question_preferences 테이블 업데이트
// → preference_score 조정 (+0.1 for used, -0.05 for ignored)
```

**DB 스키마** (추가):
```sql
CREATE TABLE user_question_preferences (
  user_id UUID REFERENCES users(id),
  question_type VARCHAR(50), -- metrics, team, strategy, risk, growth
  preference_score FLOAT DEFAULT 0.5, -- 0.0 (싫어함) ~ 1.0 (선호)
  tone VARCHAR(20) DEFAULT 'formal', -- formal, casual, direct
  language_style VARCHAR(20) DEFAULT 'mixed', -- korean_only, mixed, english
  last_updated TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, question_type)
);
```

**학습 알고리즘** (Python AI Service):
```python
def update_question_preference(user_id, question_id, action):
    """
    질문 피드백 기반 선호도 업데이트
    """
    question = get_question(question_id)
    question_type = question.metadata['type'] # metrics, team, etc.

    current_score = get_preference_score(user_id, question_type)

    if action == 'used':
        new_score = min(current_score + 0.1, 1.0)
    elif action == 'ignored':
        new_score = max(current_score - 0.05, 0.0)
    elif action == 'dismissed':
        new_score = max(current_score - 0.1, 0.0)

    update_preference_score(user_id, question_type, new_score)
```

**질문 생성 시 반영**:
```python
@router.post("/ai/suggest-questions")
async def suggest_questions(meeting_id, transcript, user_id):
    # 1. 기본 질문 생성 (LLM)
    base_questions = await generate_questions_llm(transcript)

    # 2. 사용자 선호도 로드
    preferences = get_user_preferences(user_id)

    # 3. 선호도 기반 정렬
    scored_questions = []
    for q in base_questions:
        q_type = q['type']
        pref_score = preferences.get(q_type, 0.5) # 기본값 0.5
        q['score'] = q['base_score'] * pref_score
        scored_questions.append(q)

    # 4. 상위 5개 반환
    top_questions = sorted(scored_questions, key=lambda x: x['score'], reverse=True)[:5]

    return {"questions": top_questions}
```

**성공 기준**:
- 사용률 향상: 10회 회의 전 20% → 10회 후 35%+
- 사용자 피드백: "점점 나한테 맞는 질문이 나와요" 5/10명

---

#### FR-003-2: 도메인 레벨 시스템 (P0 - MVP)

**기능**: 도메인별 경험치(XP) 및 레벨 관리

**도메인 종류**:
- Investment Screening (투자 심사)
- Mentoring (멘토링)
- Sales (세일즈)
- Product Review (제품 리뷰)
- User Interview (사용자 인터뷰)
- Team 1:1 (조직 관리)

**XP 획득**:
```typescript
interface XPRule {
  action: string;
  xp: number;
}

const XP_RULES: XPRule[] = [
  { action: 'meeting_completed', xp: 10 },
  { action: 'question_used', xp: 5 },
  { action: 'feedback_provided', xp: 3 },
  { action: 'action_item_completed', xp: 2 },
];
```

**레벨 테이블**:
```
Lv.1: 0 XP (신규)
Lv.2: 100 XP (회의 10회)
Lv.3: 300 XP (회의 30회 누적)
Lv.4: 700 XP (회의 70회 누적)
Lv.5: 1500 XP (회의 150회 누적)
```

**레벨별 해금 기능**:
```typescript
const LEVEL_FEATURES = {
  1: ['basic_questions', 'transcription', 'action_extraction'],
  2: ['past_context', 'user_style_reflection'],
  3: ['benchmark_comparison', 'risk_detection', 'deep_questions'],
  4: ['predictive_questions', 'pattern_insights', 'self_coaching'],
  5: ['custom_templates', 'marketplace_contributor', 'ai_tuning'],
};
```

**API**:
```typescript
GET /api/users/:id/domains

Response:
{
  "domains": [
    {
      "name": "investment_screening",
      "level": 3,
      "current_xp": 350,
      "next_level_xp": 700,
      "progress_percent": 50,
      "unlocked_features": [
        "basic_questions",
        "past_context",
        "benchmark_comparison",
        "risk_detection"
      ]
    },
    {
      "name": "mentoring",
      "level": 2,
      "current_xp": 120,
      "next_level_xp": 300,
      "progress_percent": 40,
      "unlocked_features": [
        "basic_questions",
        "past_context"
      ]
    }
  ]
}

---

POST /api/users/:id/domains/:domain/xp

Request:
{
  "action": "meeting_completed",
  "xp": 10
}

Response:
{
  "domain": "investment_screening",
  "old_level": 2,
  "new_level": 3, // 레벨업 발생
  "current_xp": 300,
  "leveled_up": true,
  "unlocked_features": ["benchmark_comparison", "risk_detection"]
}
```

**레벨업 이벤트**:
```typescript
// 회의 종료 시 자동 호출
async function onMeetingEnd(meeting_id: string, user_id: string) {
  const meeting = await getMeeting(meeting_id);
  const domain = meeting.type; // investment_screening

  // XP 부여
  const xp_earned = 10; // 기본 회의 완료
  const result = await addXP(user_id, domain, xp_earned);

  // 레벨업 발생 시
  if (result.leveled_up) {
    // 1. 사용자에게 알림
    await sendNotification(user_id, {
      type: 'level_up',
      title: `${domain} Lv.${result.new_level} 달성!`,
      body: `새로운 기능이 해금되었습니다: ${result.unlocked_features.join(', ')}`,
    });

    // 2. 이메일 발송
    await sendEmail(user_id, 'level_up_template', result);

    // 3. 대시보드 배지 표시
    await createBadge(user_id, domain, result.new_level);
  }
}
```

**UI - 대시보드**:
```
┌─────────────────────────────────────────┐
│  👋 안녕하세요, 준서님                   │
├─────────────────────────────────────────┤
│                                         │
│  투자 심사 ⭐⭐⭐☆☆ Lv.3               │
│  ████████████░░░░ 50% (다음까지 350 XP) │
│                                         │
│  해금된 기능:                            │
│  ✅ 벤치마크 실시간 비교                 │
│  ✅ 리스크 자동 감지                    │
│                                         │
│  ──────────────────────────────────    │
│                                         │
│  멘토링 ⭐⭐☆☆☆ Lv.2                   │
│  ███████░░░░░░░░░ 40% (다음까지 180 XP)│
│                                         │
│  [도메인 관리]                           │
└─────────────────────────────────────────┘
```

**레벨업 모달**:
```
┌───────────────────────────────────────┐
│  🎉 레벨업!                            │
├───────────────────────────────────────┤
│                                       │
│      투자 심사 Lv.3 달성!              │
│                                       │
│      ⭐⭐⭐☆☆                        │
│                                       │
│  새로 해금된 기능:                     │
│  ✅ 벤치마크 실시간 비교                │
│  ✅ 리스크 자동 감지                   │
│  ✅ 심화 질문 템플릿 50개               │
│                                       │
│  다음 레벨 (Lv.4)까지: 400 XP          │
│  "예측적 질문 + 패턴 인사이트"          │
│                                       │
│  [확인] [소셜 공유]                    │
└───────────────────────────────────────┘
```

**DB 스키마** (기존 확장):
```sql
ALTER TABLE user_domains
ADD COLUMN unlocked_features TEXT[] DEFAULT '{}';

CREATE TABLE level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  domain VARCHAR(50),
  old_level INT,
  new_level INT,
  xp_at_level_up INT,
  unlocked_features TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

**성공 기준**:
- Retention 향상: Lv.2 달성 사용자 Week 8 Retention 70%+
- Gamification 효과: "레벨업이 재밌어요" 피드백 7/10명

---

#### FR-003-3: 과거 맥락 개인화 (P1 - Lv.2 해금)

**기능**: Lv.2 달성 시 해금, 과거 회의 맥락 자동 로드 (개인화)

**Lv.1 vs Lv.2 차이**:

**Lv.1 (범용)**:
```
회의 시작 시:
"과거 대화 기록이 없습니다."

또는

"A팀과 2회 미팅 기록이 있습니다." (단순 표시)
```

**Lv.2 (개인화)**:
```
회의 시작 시:
"A팀과 2주 전에 미팅했습니다.

📌 당시 주요 내용:
• MAU 5만 달성
• Google Ads 채널 집중
• CAC $30 수준

⚠️  당시 놓친 질문:
• LTV 미확인
• Churn Rate 확인 필요

💡 오늘 추천 질문:
1. 지난번 약속한 재무 자료 받으셨나요?
2. LTV는 확인하셨나요?
3. Google Ads 외 채널 실험 시작하셨나요?"
```

**API**:
```typescript
GET /api/meetings/:id/personalized-context
Headers: Authorization: Bearer <token>

// user_id에서 level 체크
// Lv.2 미만 → 403 Forbidden

Response:
{
  "past_meetings": [
    {
      "meeting_id": "meeting_old123",
      "date": "2024-11-15",
      "title": "A팀 1차 미팅",
      "key_points": ["MAU 5만", "CAC $30"],
      "missed_questions": ["LTV 미확인"],
      "suggested_follow_ups": [
        "지난번 약속한 재무 자료 받으셨나요?",
        "LTV는 확인하셨나요?"
      ]
    }
  ],
  "personalized_insights": [
    {
      "type": "pattern",
      "text": "당신은 평소 재무 지표를 먼저 확인하는 편입니다. 오늘도 MRR부터 물어보시는 게 좋겠습니다."
    }
  ]
}
```

**UI**:
```
┌───────────────────────────────────────┐
│  A팀 Series A 심사 준비               │
├───────────────────────────────────────┤
│                                       │
│  🔓 Lv.2 기능: 과거 맥락 자동 로드     │
│                                       │
│  📅 지난 미팅 (11/15)                  │
│  • MAU 5만 달성                       │
│  • Google Ads 집중                     │
│                                       │
│  ⚠️  당시 놓친 질문:                   │
│  • LTV 미확인 → 오늘 꼭 확인!          │
│                                       │
│  💡 개인화 제안:                       │
│  "당신은 보통 재무 지표부터 확인합니다.│
│   오늘도 MRR부터 시작하세요."          │
│                                       │
│  [시작하기]                            │
└───────────────────────────────────────┘
```

---

#### FR-003-4: 페르소나 시스템 (P2 - Phase 3, Lv.3+)

**기능**: 4가지 온노 페르소나 선택

**페르소나**:
1. 📊 **Analyst Onno** (분석가)
   - 숫자·데이터 중심 질문
   - 벤치마크 비교 강조
   - 리스크 정량화

2. 🤝 **Buddy Onno** (동료)
   - 협력적·공감 중심 질문
   - 부드러운 톤
   - 팀·문화 관점 질문

3. 🛡️ **Guardian Onno** (수호자)
   - 위험 관리·리스크 중심
   - 보수적 관점
   - 검증 질문 강화

4. 🚀 **Visionary Onno** (비전가)
   - 기회·미래 중심 질문
   - 성장 가능성 탐색
   - 긍정적 시나리오 강조

**API**:
```typescript
PATCH /api/meetings/:id/persona

Request:
{
  "persona": "analyst" // analyst, buddy, guardian, visionary
}

Response:
{
  "meeting_id": "meeting_abc123",
  "persona": "analyst",
  "persona_config": {
    "question_bias": {
      "metrics": 0.9,
      "team": 0.3,
      "risk": 0.8,
      "growth": 0.5
    },
    "tone": "direct",
    "priority_order": ["metrics", "risk", "strategy", "team"]
  }
}
```

**질문 생성 시 페르소나 반영**:
```python
PERSONA_PROMPTS = {
    'analyst': """
당신은 데이터 중심 분석가입니다.
숫자, 지표, 벤치마크를 우선으로 질문하세요.
톤은 직설적이고 정확해야 합니다.
""",
    'buddy': """
당신은 협력적인 동료입니다.
팀, 문화, 사람에 대한 질문을 우선으로 하세요.
톤은 부드럽고 공감적이어야 합니다.
""",
    'guardian': """
당신은 위험 관리자입니다.
리스크, 문제점, 검증이 필요한 부분을 우선으로 질문하세요.
톤은 보수적이고 신중해야 합니다.
""",
    'visionary': """
당신은 미래 지향적 비전가입니다.
성장 기회, 혁신, 차별화를 우선으로 질문하세요.
톤은 긍정적이고 미래 지향적이어야 합니다.
"""
}

@router.post("/ai/suggest-questions")
async def suggest_questions(meeting_id, transcript, persona='analyst'):
    # 페르소나별 Prompt 선택
    system_prompt = PERSONA_PROMPTS[persona]

    # LLM 호출
    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"대화: {transcript}\n\n질문을 생성하세요."}
        ]
    )

    return response
```

**UI - 페르소나 선택**:
```
┌───────────────────────────────────────┐
│  오늘 회의는 어떤 온노와?              │
├───────────────────────────────────────┤
│                                       │
│  📊 Analyst                           │
│  "숫자·데이터 중심"                    │
│  [선택]                                │
│                                       │
│  🤝 Buddy                             │
│  "협력·공감 중심"                      │
│  [선택]                                │
│                                       │
│  🛡️ Guardian                          │
│  "리스크·검증 중심"                    │
│  [선택]                                │
│                                       │
│  🚀 Visionary                         │
│  "기회·미래 중심"                      │
│  [선택]                                │
│                                       │
│  💡 추천: Analyst (투자 심사에 적합)   │
└───────────────────────────────────────┘
```

**회의 중 페르소나 전환**:
```
우측 상단:
┌─────────────┐
│ 📊 Analyst  │
│ [변경]       │
└─────────────┘

클릭 → 즉시 전환 가능
```

**DB 스키마**:
```sql
ALTER TABLE meetings
ADD COLUMN persona VARCHAR(20) DEFAULT 'analyst';

CREATE TABLE persona_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  meeting_id UUID REFERENCES meetings(id),
  persona VARCHAR(20),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);
```

**성공 기준**:
- 페르소나 전환율: 30%+ (회의 중 페르소나 변경)
- 만족도: "페르소나별로 질문이 다르다" 8/10명

---

## 요약: 기존 PRD Part 2에 추가된 내용

### 새로 추가된 FR (Functional Requirements)

**FR-003: "나만의 온노" 개인화 시스템**
- **FR-003-1**: 사용자 학습 엔진 (P0)
- **FR-003-2**: 도메인 레벨 시스템 (P0)
- **FR-003-3**: 과거 맥락 개인화 (P1, Lv.2 해금)
- **FR-003-4**: 페르소나 시스템 (P2, Phase 3)

### DB 스키마 추가

```sql
-- 사용자 질문 선호도
CREATE TABLE user_question_preferences (...);

-- 사용자 맥락 프로필
CREATE TABLE user_context_profile (...);

-- 질문 피드백
CREATE TABLE question_feedback (...);

-- 레벨 히스토리
CREATE TABLE level_history (...);

-- 페르소나 사용 로그
CREATE TABLE persona_usage_log (...);
```

### API 엔드포인트 추가

```
POST /api/questions/:id/feedback
GET /api/users/:id/domains
POST /api/users/:id/domains/:domain/xp
GET /api/meetings/:id/personalized-context
PATCH /api/meetings/:id/persona
```

### 개발 우선순위

- **Phase 1 (MVP)**: FR-003-1, FR-003-2 (학습 + 레벨 Lv.1~2)
- **Phase 2**: FR-003-3 (Lv.3~4 기능)
- **Phase 3**: FR-003-4 (페르소나 시스템)

---

**다음**: User Flow 문서에도 개인화 시나리오 추가 필요
