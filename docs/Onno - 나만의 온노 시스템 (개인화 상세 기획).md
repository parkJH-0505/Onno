# Onno - "나만의 온노" 개인화 시스템 상세 기획

**연결 문서**: [PRD Part 2](./Onno%20-%20PRD%20Part%202%20(기능%20명세).md) | [User Flow](./Onno%20-%20User%20Flow%20및%20상세%20기획.md)

**작성일**: 2025-12-02
**목적**: "나만의 온노" 개인화·학습·성장 시스템 완전 명세

---

## 개요: "나만의 온노"란?

### 한 줄 정의

> **"처음엔 똑똑한 회의 도우미 → 쓸수록 '나와 우리 팀에 특화된' 대화 코치로 성장하는 AI 파트너"**

### 핵심 차별점

기존 AI 도구와의 차이:

| 기존 AI 도구 | 나만의 온노 |
|------------|------------|
| 모든 사용자에게 동일한 답변 | **사용자별로 다른 질문·인사이트 제공** |
| 사용 횟수와 무관하게 동일 | **쓸수록 나를 이해하고 정교해짐** |
| 도구 (Tool) | **파트너 (Partner)** |
| 일회용 | **성장형 (Level-up)** |

### 전략적 중요성 (Why This Matters)

**1. 대체 불가능성 (전환 비용 ↑)**
```
3개월 사용 후:
- 내 포트폴리오 100건 학습
- 내 질문 스타일 500개 데이터
- 내 팀 회의 패턴 50건 이해

→ 타 서비스 전환 시 처음부터 다시 시작
→ "저쪽 툴도 요약 잘하는데, 나를 이렇게 아는 애는 없어"
```

**2. 심리적·정서적 Lock-in**
```
"이건 내 온노야"
- 레벨 4 달성한 투자 심사 온노
- 지난 6개월 함께 성장한 히스토리
- 캐릭터/페르소나 설정

→ 단순 SaaS가 아닌 "옆에서 함께 일하는 파트너" 인식
```

**3. 데이터 해자 (Data Moat)**
```
개인/팀별 온노가 쌓은 데이터:
- 대화 패턴 (누구와, 언제, 무엇을)
- 질문 선호도 (어떤 질문을 자주 쓰나)
- 의사결정 기준 (무엇을 중요하게 보나)

→ 경쟁사가 따라올 수 없는 로컬 데이터셋
→ 시간이 갈수록 격차 벌어짐
```

---

## Part 1: 온노가 "나를 알아가는" 학습 메커니즘

### 1-1. 학습 소스 (5가지 신호)

온노가 사용자를 이해하기 위해 수집하는 데이터:

#### Signal 1: 질문 사용 패턴

**수집 데이터**:
```typescript
interface QuestionUsageSignal {
  question_id: string;
  suggested_text: string;
  action: 'used' | 'ignored' | 'dismissed';
  modified_text?: string; // 사용자가 수정한 경우
  timestamp: Date;
  meeting_context: {
    type: string; // investment_screening, mentoring, etc.
    stage: string; // introduction, financials, etc.
  };
}
```

**학습 내용**:
- **질문 유형 선호도**:
  ```
  사용자 A:
  - "숫자·지표 질문" 사용률 80% → 데이터 중심 성향
  - "팀·리더십 질문" 사용률 20% → 사람 관점 약함

  → 온노 학습: "이 사용자는 숫자 중심 질문 선호"
  → 다음부터: 숫자 질문 우선 제안
  ```

- **말투·톤 조정**:
  ```
  온노 제안: "LTV는 얼마인가요?"
  사용자 수정: "혹시 생애 가치(LTV) 공유 가능하실까요?"

  → 온노 학습: "이 사용자는 공손한 톤 선호"
  → 다음부터: 존댓말 + 간접 표현 사용
  ```

- **언어 믹스**:
  ```
  사용자가 자주 수정하는 패턴:
  "CAC" → "CAC(고객 획득 비용)"

  → 온노 학습: "이 사용자는 용어 설명 병기 선호"
  → 다음부터: 자동으로 병기
  ```

**DB 저장**:
```sql
CREATE TABLE user_question_preferences (
  user_id UUID,
  question_type VARCHAR(50), -- metrics, team, strategy, risk
  preference_score FLOAT, -- 0.0 ~ 1.0
  tone VARCHAR(20), -- formal, casual, direct
  language_style VARCHAR(20), -- korean_only, mixed, english_preferred
  updated_at TIMESTAMP
);
```

---

#### Signal 2: 반복되는 맥락

**수집 데이터**:
```typescript
interface ContextSignal {
  user_id: string;
  frequent_entities: {
    companies: string[]; // "A팀", "B사" (자주 등장)
    products: string[]; // "X 서비스", "Y 플랫폼"
    metrics: string[]; // "MRR", "CAC", "NPS" (자주 확인)
    people: string[]; // "김창업", "이CTO" (자주 미팅)
  };
  meeting_types: {
    type: string;
    frequency: number;
  }[];
}
```

**학습 내용**:
```
사용자 A의 패턴:
- 포트폴리오: A팀, B팀, C팀 (매주 미팅)
- 주요 지표: MRR, Churn Rate (항상 확인)
- 회의 유형: 투자 심사 70%, 멘토링 30%

→ 온노 학습:
  "이 사용자는 SaaS 포트폴리오 관리자"
  "MRR, Churn을 항상 확인하므로 미리 준비"

→ 회의 시작 전 자동 제안:
  "A팀과 오늘 미팅이네요.
   지난주 MRR $50K였는데, 이번 주 업데이트 확인하시겠어요?"
```

**DB 저장**:
```sql
CREATE TABLE user_context_profile (
  user_id UUID,
  entity_type VARCHAR(50), -- company, product, metric, person
  entity_name VARCHAR(255),
  frequency INT, -- 등장 횟수
  last_mentioned TIMESTAMP,
  importance_score FLOAT -- 0.0 ~ 1.0
);
```

---

#### Signal 3: 피드백 (명시적 학습)

**UI**:
```
┌───────────────────────────────┐
│ 🔴 Critical 질문               │
│ "LTV는 얼마인가요?"            │
│                               │
│ 이 질문이 도움됐나요?          │
│ [👍 좋았어요] [👎 별로예요]    │
└───────────────────────────────┘

클릭 후:
👍 → "어떤 점이 좋았나요?"
     [✓] 타이밍이 좋았음
     [✓] 내 스타일과 맞음
     [ ] 질문이 정확했음

👎 → "어떤 점이 별로였나요?"
     [ ] 타이밍이 안 맞음
     [✓] 너무 공격적임
     [ ] 질문이 부정확함
```

**학습 내용**:
```
사용자 피드백:
- 질문 타이밍: 👍 (좋았음)
- 질문 톤: 👎 (너무 공격적)

→ 온노 학습:
  "이 사용자는 타이밍 감각은 좋아하지만,
   톤이 너무 직설적인 건 싫어함"

→ 다음부터:
  질문 타이밍 유지 + 톤 부드럽게 조정
```

**DB 저장**:
```sql
CREATE TABLE question_feedback (
  id UUID PRIMARY KEY,
  user_id UUID,
  question_id UUID,
  rating VARCHAR(20), -- thumbs_up, thumbs_down
  feedback_tags TEXT[], -- timing_good, too_aggressive, etc.
  created_at TIMESTAMP
);
```

---

#### Signal 4: 회의 후 행동

**수집 데이터**:
```typescript
interface PostMeetingSignal {
  meeting_id: string;
  user_actions: {
    revisited_transcripts: boolean; // 전사록 다시 봤는지
    exported_summary: boolean; // 요약 내보냈는지
    created_follow_up: boolean; // 후속 미팅 잡았는지
    used_missed_questions: boolean; // 놓친 질문 활용했는지
  };
  time_spent_on_review: number; // 리뷰에 쓴 시간 (초)
}
```

**학습 내용**:
```
사용자 A:
- 회의 후 항상 전사록 정독 (평균 10분)
- 놓친 질문 리스트를 다음 미팅에 활용

→ 온노 학습:
  "이 사용자는 사후 리뷰를 중요하게 여김"

→ 최적화:
  회의 후 요약을 더 상세하게 제공
  놓친 질문을 다음 미팅 체크리스트에 자동 추가
```

---

#### Signal 5: 팀 단위 패턴 (조직 학습)

**수집 데이터** (Team 플랜):
```typescript
interface TeamSignal {
  team_id: string;
  shared_contexts: {
    investment_criteria: string[]; // "B2B SaaS 위주", "Series A 이상"
    common_questions: string[]; // 팀원들이 공통으로 자주 쓰는 질문
    decision_patterns: string[]; // "재무 지표 중시", "팀 구성 중시"
  };
}
```

**학습 내용**:
```
VC 펀드 팀:
- 공통 투자 기준: "B2B SaaS, ARR $1M+, 성장률 10%+/month"
- 공통 질문: "Unit Economics 확인", "Churn Rate 확인"

→ 온노 학습:
  "이 팀은 B2B SaaS에 특화"

→ 신입 팀원도:
  첫 미팅부터 팀 기준에 맞는 질문 자동 제안
  "우리 펀드는 보통 이런 질문을 합니다"
```

---

### 1-2. 학습 알고리즘 (간략)

```python
# 사용자 프로필 업데이트 (매 회의 후)
def update_user_profile(user_id, meeting_id):
    # 1. 질문 사용 패턴 분석
    question_signals = get_question_usage(meeting_id)

    for signal in question_signals:
        if signal.action == 'used':
            # 사용한 질문 유형 가중치 증가
            increment_preference(user_id, signal.question_type, +0.1)
        elif signal.action == 'dismissed':
            # 무시한 질문 유형 가중치 감소
            increment_preference(user_id, signal.question_type, -0.05)

        if signal.modified_text:
            # 톤 조정 학습
            learn_tone_preference(user_id, signal)

    # 2. 맥락 엔티티 추출
    entities = extract_entities(meeting_id)
    for entity in entities:
        # 빈도 증가
        increment_entity_frequency(user_id, entity)

    # 3. 도메인 레벨 업데이트
    domain = get_meeting_domain(meeting_id)
    add_experience_points(user_id, domain, xp=10)
    check_level_up(user_id, domain)

    # 4. 피드백 반영
    feedbacks = get_user_feedbacks(meeting_id)
    for feedback in feedbacks:
        adjust_question_strategy(user_id, feedback)
```

---

## Part 2: 레벨 시스템 (Domain Leveling)

### 2-1. 도메인별 레벨 정의

```typescript
interface UserDomainLevel {
  user_id: string;
  domain: string; // investment_screening, mentoring, sales, etc.
  level: number; // 1 ~ 5
  experience_points: number; // XP
  next_level_xp: number; // 다음 레벨까지 필요 XP
  unlocked_features: string[]; // 레벨별 해금 기능
}
```

**도메인 종류**:
- Investment Screening (투자 심사)
- Mentoring (멘토링)
- Sales (세일즈)
- Product Review (제품 리뷰)
- Team 1:1 (조직 관리)
- User Interview (사용자 인터뷰)
- Campaign Review (마케팅 캠페인)

**XP 획득**:
```
회의 1회 완료: +10 XP
AI 질문 사용: +5 XP
피드백 제공: +3 XP
후속 조치 완료 (Notion 연동): +2 XP
```

**레벨별 필요 XP**:
```
Lv.1 → Lv.2: 100 XP (회의 10회)
Lv.2 → Lv.3: 200 XP (회의 20회)
Lv.3 → Lv.4: 400 XP (회의 40회)
Lv.4 → Lv.5: 800 XP (회의 80회)

총 Lv.5 달성: 150회 회의 필요
```

---

### 2-2. 레벨별 기능 차이 (실제 변화)

#### Lv.1: 기본 온노 (범용)

**제공 기능**:
- 도메인별 기본 질문 템플릿
- 범용 용어 설명
- 기본 액션 추출

**예시 (투자 심사)**:
```
질문:
- "주요 지표는 무엇인가요?"
- "팀 구성은 어떻게 되나요?"
- "시장 규모는 어느 정도인가요?"

→ 모든 Lv.1 사용자에게 동일
```

---

#### Lv.2: 나를 아는 온노

**해금 기능**:
- ✅ 과거 회의 맥락 자동 로드
- ✅ 사용자 질문 스타일 반영

**예시**:
```
회의 시작 전:
"A팀과 2주 전에도 미팅했습니다.
 그때 논의했던 마케팅 예산 고민,
 오늘 확인해보시겠어요?"

회의 중:
"당신은 평소 '숫자 중심 질문'을 선호하시니까,
 여기서 MRR 증가율을 물어보는 건 어떨까요?"
```

**차별점**:
- Lv.1: 범용 질문
- **Lv.2: 내 과거 회의 + 내 스타일 반영**

---

#### Lv.3: 깊이 있는 온노

**해금 기능**:
- ✅ 도메인 특화 심화 질문
- ✅ 벤치마크 비교 (실시간)
- ✅ 리스크 자동 감지

**예시**:
```
회의 중:
"CAC $30 언급하셨는데,
 SaaS Series A 평균은 $30~50입니다.

 다만, Churn Rate를 아직 확인 안 하셨는데,
 LTV 계산에 필수이므로 지금 물어보시는 게 좋겠습니다."

→ 단순 질문이 아닌 "왜 필요한지" 맥락 설명
```

**차별점**:
- Lv.2: 내 스타일 반영
- **Lv.3: 도메인 전문성 + 리스크 감지**

---

#### Lv.4: 전문가 온노

**해금 기능**:
- ✅ 예측적 질문 (다음 단계 미리 제안)
- ✅ 패턴 기반 인사이트
- ✅ 팀 비교 (나 vs 팀 평균)

**예시**:
```
회의 중:
"지난 10건 Series A 심사에서
 당신은 평균 8개 재무 질문, 3개 팀 질문을 했습니다.

 이번 미팅은 팀 질문이 아직 1개뿐이네요.
 리더십·조직 관점 질문도 추가해보는 건 어떨까요?"

→ 내 과거 패턴 기반 자기 개선 제안
```

**차별점**:
- Lv.3: 도메인 전문성
- **Lv.4: 자기 개선 코칭**

---

#### Lv.5: 마스터 온노

**해금 기능**:
- ✅ 커스텀 질문 템플릿 자동 생성
- ✅ 팀 지식 베이스 기여
- ✅ AI 튜닝 (Prompt 직접 조정 가능)

**예시**:
```
온노 제안:
"당신이 지난 6개월간 사용한 질문 패턴을 분석해
 '준서님만의 투자 심사 체크리스트'를 자동 생성했습니다.

 다른 팀원들과 공유하시겠어요?"

→ Marketplace에 업로드 → 다른 사용자가 구매 가능
→ 수익 배분 (70% 사용자, 30% Onno)
```

**차별점**:
- Lv.4: 자기 개선
- **Lv.5: 지식 생산자 + 수익화**

---

### 2-3. 레벨업 UX

```
┌───────────────────────────────────────┐
│  🎉 레벨업!                            │
├───────────────────────────────────────┤
│                                       │
│      투자 심사 Lv.3 달성!              │
│                                       │
│      ⭐⭐⭐☆☆                        │
│                                       │
│  해금된 기능:                          │
│  ✅ 벤치마크 실시간 비교                │
│  ✅ 리스크 자동 감지                   │
│  ✅ 심화 질문 템플릿 (50개 추가)        │
│                                       │
│  다음 레벨까지: 280 XP (28회의)        │
│                                       │
│  [확인]                                │
└───────────────────────────────────────┘
```

**레벨업 시 보상**:
- 새 기능 해금
- 배지 획득
- 이메일 축하 메시지
- (선택) 소셜 공유 ("투자 심사 Lv.3 달성!")

---

## Part 3: 페르소나/캐릭터 시스템

### 3-1. 페르소나 컨셉

**핵심**: 귀여운 캐릭터가 아닌, **질문·인사이트 전략이 다른 AI 모드**

```
┌─────────────────────────────────────────────────┐
│  온노 페르소나 선택                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Analyst Onno (분석가)                       │
│  "숫자·데이터 중심 질문"                         │
│  - 지표 중심 질문 우선                           │
│  - 벤치마크 비교 강조                            │
│  - 리스크 정량화                                 │
│  [선택]                                          │
│                                                 │
│  🤝 Buddy Onno (동료)                           │
│  "협력적·공감 중심 질문"                         │
│  - 부드러운 톤                                   │
│  - 팀·문화 관점 질문                             │
│  - 긍정적 피드백 강조                            │
│  [선택]                                          │
│                                                 │
│  🛡️ Guardian Onno (수호자)                      │
│  "위험 관리·리스크 중심 질문"                     │
│  - 리스크 우선 탐지                              │
│  - 보수적 관점                                   │
│  - 검증 질문 강화                                │
│  [선택]                                          │
│                                                 │
│  🚀 Visionary Onno (비전가)                     │
│  "기회·미래 중심 질문"                           │
│  - 성장 가능성 탐색                              │
│  - 혁신·차별화 질문                              │
│  - 긍정적 시나리오 강조                          │
│  [선택]                                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 3-2. 페르소나별 질문 차이 (실제 예시)

**상황**: 스타트업이 "저희 성장률이 월 5%입니다"라고 말함

#### Analyst Onno (분석가)
```
🔴 Critical:
"5%는 MoM인가요 YoY인가요?
 정확한 기간과 계산 방식을 확인해주세요."

💡 인사이트:
"SaaS Series A 평균 MoM 성장률은 10~15%입니다.
 5%는 다소 낮은 편이니, 성장 둔화 원인을 파악하세요."
```

#### Buddy Onno (동료)
```
🟡 Important:
"월 5% 성장 축하드립니다!
 혹시 성장을 가속화할 계획이 있으신가요?"

💡 인사이트:
"안정적인 성장세네요.
 팀이 어떤 부분에서 가장 어려움을 겪고 계신지 궁금합니다."
```

#### Guardian Onno (수호자)
```
🔴 Critical:
"5% 성장의 지속 가능성을 검증해야 합니다.
 Churn Rate와 비교했을 때 Net Growth는 얼마인가요?"

💡 인사이트:
"성장률만으로는 판단이 어렵습니다.
 고객 이탈률(Churn)을 함께 확인하세요.
 Churn 5% 이상이면 실제 성장은 정체 상태입니다."
```

#### Visionary Onno (비전가)
```
🟢 Follow-up:
"5% 성장을 10%로 끌어올릴 수 있는
 가장 큰 기회는 무엇이라고 보시나요?"

💡 인사이트:
"현재는 안정기이지만, 새로운 채널이나 제품 라인 확장으로
 성장 곡선을 바꿀 수 있는 시점일 수 있습니다."
```

---

### 3-3. 페르소나 전환 UX

**회의 시작 전 선택**:
```
┌───────────────────────────────┐
│ 오늘 회의는 어떤 온노와?        │
├───────────────────────────────┤
│ A팀 Series A 심사              │
│                               │
│ 추천: 📊 Analyst Onno          │
│ (투자 심사는 보통 분석가 모드)  │
│                               │
│ 또는 다른 페르소나:             │
│ [🤝 Buddy] [🛡️ Guardian] [🚀 Visionary] │
│                               │
│ [시작하기]                     │
└───────────────────────────────┘
```

**회의 중 전환 가능**:
```
우측 상단:
┌─────────────┐
│ 현재: 📊 Analyst │
│ [변경]       │
└─────────────┘

클릭 시:
→ 즉시 다른 페르소나로 전환
→ "Visionary 모드로 전환했습니다.
    이제 성장·기회 중심 질문을 제안합니다."
```

---

### 3-4. 페르소나 학습

**시간이 지나면서**:
```
사용자 A:
- Analyst 모드 80% 사용
- Guardian 모드 15% 사용
- Buddy 모드 5% 사용

→ 온노 학습:
  "이 사용자는 분석·리스크 중심"

→ 자동 추천:
  새 회의 시작 시 기본값 = Analyst
  다만, 멘토링 회의는 Buddy 추천
```

**팀 단위 학습**:
```
VC 펀드 팀:
- Analyst: 60%
- Guardian: 30%
- Visionary: 10%

→ 팀 문화 = "보수적·분석적"
→ 신입도 팀 기본값 Analyst로 시작
```

---

## Part 4: 구현 우선순위

### Phase 1: MVP (Month 1-6) - 기본 개인화

**P0 (Must Have)**:
- [ ] 질문 사용/무시 트래킹
- [ ] 기본 사용자 프로필 (관심 도메인)
- [ ] 도메인별 XP 시스템
- [ ] Lv.1 → Lv.2 기능 차이 (과거 맥락 로드)

**제외 (Post-MVP)**:
- ❌ 페르소나 시스템 (Phase 2)
- ❌ Lv.3+ 기능 (Phase 2)
- ❌ 팀 학습 (Phase 3)

---

### Phase 2: Intelligence (Month 7-12) - 레벨 시스템

**P1 (Should Have)**:
- [ ] Lv.3 기능 (벤치마크, 리스크 감지)
- [ ] Lv.4 기능 (예측적 질문, 패턴 인사이트)
- [ ] 레벨업 UX (축하 애니메이션, 배지)
- [ ] 피드백 시스템 (👍👎)

---

### Phase 3: Platform (Month 13-18) - 페르소나 & 팀

**P2 (Nice to Have)**:
- [ ] 페르소나 시스템 (Analyst, Buddy, Guardian, Visionary)
- [ ] Lv.5 기능 (커스텀 템플릿 생성)
- [ ] 팀 학습 (조직 단위 프로필)
- [ ] Marketplace (템플릿 판매)

---

## Part 5: 데이터 모델 (추가)

### DB Schema 추가

```sql
-- 사용자 도메인 레벨 (기존 확장)
ALTER TABLE user_domains
ADD COLUMN unlocked_features JSONB, -- ["past_context", "benchmark", ...]
ADD COLUMN persona VARCHAR(20) DEFAULT 'analyst'; -- analyst, buddy, guardian, visionary

-- 질문 선호도
CREATE TABLE user_question_preferences (
  user_id UUID REFERENCES users(id),
  question_type VARCHAR(50), -- metrics, team, strategy, risk
  preference_score FLOAT DEFAULT 0.5, -- 0.0 ~ 1.0
  tone VARCHAR(20) DEFAULT 'formal', -- formal, casual, direct
  language_style VARCHAR(20) DEFAULT 'mixed', -- korean_only, mixed
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, question_type)
);

-- 사용자 맥락 프로필
CREATE TABLE user_context_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(50), -- company, product, metric, person
  entity_name VARCHAR(255),
  frequency INT DEFAULT 1,
  last_mentioned TIMESTAMP,
  importance_score FLOAT DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 질문 피드백
CREATE TABLE question_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES ai_questions(id),
  rating VARCHAR(20), -- thumbs_up, thumbs_down
  feedback_tags TEXT[], -- timing_good, too_aggressive, helpful, etc.
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 레벨 히스토리
CREATE TABLE level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  domain VARCHAR(50),
  old_level INT,
  new_level INT,
  xp_at_level_up INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Part 6: 마케팅 포지셔닝

### "나만의 온노" 메시지

**랜딩 페이지**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
쓸수록 나를 이해하는 AI 대화 파트너
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

처음엔 똑똑한 회의 도우미
3개월 후엔 나만 아는 전략 코치

"같은 Onno를 써도,
 당신의 Onno는 다릅니다"
```

**기능 설명**:
```
┌─────────────────────────────────┐
│  회의 10회: Lv.2 달성            │
│  "과거 회의 맥락 자동 로드"      │
│                                 │
│  회의 30회: Lv.3 달성            │
│  "벤치마크 비교 + 리스크 감지"   │
│                                 │
│  회의 70회: Lv.4 달성            │
│  "AI가 내 패턴 분석 + 코칭"      │
└─────────────────────────────────┘

→ "온노와 함께 성장하세요"
```

---

## 요약

### "나만의 온노"란

1. **학습하는 AI**: 질문 사용·피드백·맥락을 학습
2. **성장하는 파트너**: 레벨 시스템 (Lv.1~5)
3. **다양한 페르소나**: Analyst, Buddy, Guardian, Visionary
4. **높은 전환 비용**: 3개월 사용 후 대체 불가능

### 구현 순서

- **Phase 1 (MVP)**: 기본 학습 + Lv.1~2
- **Phase 2**: 레벨 3~4 + 피드백 시스템
- **Phase 3**: 페르소나 + Lv.5 + Marketplace

### 차별점

**Fireflies**: 모든 사용자에게 동일한 요약
**Onno**: 쓸수록 나에게 맞는 질문·인사이트

→ "회의 도구에서 대화 파트너로"
