# PocketAI Manager (P-A-M) MVP 전략 문서

**문서 버전**: v1.0
**작성일**: 2025-12-02
**목적**: 페르소나 분석부터 MVP 기능 선정까지의 전략 수립 과정 기록

---

## Executive Summary

**PocketAI Manager (P-A-M)**는 VC/PE 투자자, Accelerator, Company Builder를 위한 **실시간 대화 인텔리전스 도구**입니다.

### 핵심 차별점
- **During-the-fact** 솔루션: 회의 '후' 요약이 아닌, 회의 '중' 실시간 질문 제안
- **Vertical AI**: 투자/벤처 생태계 특화 (vs Otter/Fireflies의 범용 접근)
- **Agentic Workflow**: 질문 제안 → CRM 자동 업데이트까지 end-to-end

### MVP 목표 (6개월)
- Beta 유저 30명 확보 (Tier 2 VC/AC 중심)
- Week 4 Retention 60%+
- 유료 전환 6명, MRR $1,000 달성

---

## 1단계: 페르소나 기반 Pain Point 발굴

### 1.1 방법론
전통적인 인터뷰/설문 대신 **"내부자 시점 일기"** 형식으로 진정성 있는 Pain Point 포착:
- VC 5년차 심사역 "김준서" 페르소나
- AC 프로그램 매니저 "이서연" 페르소나
- Company Builder PO 실제 일기 분석

### 1.2 발견된 15개 Pain Points

#### 공통 Pain (모든 페르소나)
| # | Pain Point | 핵심 증상 |
|---|-----------|---------|
| 1 | **Question Timing Gap** | 질문을 '알지만' 적시에 '던지지' 못함 |
| 2 | **Surface Acceptance** | 그럴듯한 답변에 속아 넘어감 |
| 3 | **Checklist Dormancy** | 체크리스트가 회의 중 작동 안 함 |
| 4 | **Follow-up Weakness** | 회의 후 후속 액션 누락 |
| 13 | **Context Recall Failure** | 이전 회의 맥락 기억 못함 |

#### VC 특화 Pain
| # | Pain Point | 핵심 증상 |
|---|-----------|---------|
| 5 | **Stage Blindness** | Seed/Series A/B 단계별 필수 질문 놓침 |

#### AC 특화 Pain
| # | Pain Point | 핵심 증상 |
|---|-----------|---------|
| 6 | **Teaching Overload** | 같은 개념 매 팀에 반복 설명 |
| 7 | **Benchmark Lag** | 실시간 벤치마크 비교 불가 |
| 8 | **Cohort Tracking Gap** | 여러 팀 동시 관리 시 맥락 손실 |
| 12 | **Knowledge Evaporation** | 과거 회의 인사이트 증발 |
| 15 | **Manual Resource Matching** | 멘토/리소스 매칭 수작업 |

#### Company Builder 특화 Pain
| # | Pain Point | 핵심 증상 |
|---|-----------|---------|
| 9 | **Echo Chamber** | 내부 편향 검증 없이 진행 |
| 10 | **Reporting Data Gap** | 회의 → 보고서 변환 수작업 |
| 11 | **Interview Follow-up Weakness** | 사용자 인터뷰 후 후속 검증 누락 |
| 14 | **Validation Rigor Gap** | 가설 검증 체크리스트 미작동 |

### 1.3 페르소나별 핵심 Insight

**VC 김준서의 외침**:
> "나는 질문을 '알고' 있다. Notion에 완벽한 체크리스트가 있다.
> 하지만 회의 중에는 '듣기'에만 90% 에너지를 쓰고,
> '분석·기억·질문 생성'에는 10%밖에 못 쓴다."

**AC 이서연의 외침**:
> "20개 팀을 동시에 관리하는데, 각 팀과 회의할 때마다
> '이 팀이 지난주에 뭐 고민했지?'부터 떠올려야 한다.
> 그리고 또 CAC가 뭔지 설명한다. 10번째다."

**Company Builder PO의 외침**:
> "사용자 인터뷰 10건 했는데, 정작 '그래서 우리 가설이 맞았나?'
> 검증하려면 녹취록 10개를 다시 들어야 한다. 안 한다."

---

## 2단계: 시장 분석 및 경쟁 환경 이해

### 2.1 분석 자료
5개 문서 심층 분석:
1. **회의 솔루션 스타트업 성공 전략 분석** - 시장 진화 3단계 (Act 1~3)
2. **새로운 솔루션 시장 전망 분석** - VC 관점, Wrapper 경고
3. **회의 솔루션 시장 동향과 미래 기회** - 글로벌 플레이어 분석
4. **회의/미팅 솔루션 시장 조사 가이드** - 카테고리 분류, 전문가 의견
5. **벤처 생태계 워크플로우 혁신 방안** - 한국 VC 특화 Pain Point

### 2.2 시장 진화의 3막 (Act Model)

#### Act 1 (2022-2023): 요약 툴의 범람
- **대표 주자**: Otter, Fireflies, Tactiq
- **핵심 가치**: "회의록 자동 작성"
- **문제점**:
  - Horizontal 접근으로 차별화 없음
  - GPT Wrapper 수준 → 진입장벽 낮아 경쟁 과다
  - Zoom/MS Teams의 네이티브 전사 기능으로 Sherlocking 위험
- **결과**: Commoditization, 가격 경쟁

#### Act 2 (2024-2025): Vertical AI + Agentic Workflow ⬅️ **현재 P-A-M 위치**
- **대표 주자**:
  - Gong (Sales vertical, $7.25B 기업가치)
  - Ambience Healthcare (의료 기록 자동화, $100M 조달)
  - Harvey AI (법률 vertical, $1.5B 밸류)
- **핵심 가치**: "도메인 특화 + 업무 자동 실행"
- **성공 요인**:
  - Vertical 데이터 모트 (판례, EHR, Deal flow)
  - Agentic: 정보 제공 → 업무 수행 (CRM 업데이트, 계약서 초안 작성)
  - System of Action (SoA): Salesforce/Epic 같은 핵심 워크플로우에 깊이 통합
- **P-A-M의 기회**: VC/AC/CB vertical은 아직 공백

#### Act 3 (2026+): Service-as-Software
- **개념**: 소프트웨어가 아닌 '서비스'로 판매
- **예시**: "당신의 회의 준비 + 진행 + 후속 조치를 우리가 다 합니다" (월 $X)
- **가격 모델**: Seat-based → Outcome-based (예: 성사된 Deal당 과금)
- **P-A-M 장기 비전**: "AI Analyst-as-a-Service" (투자 심사 전 과정 자동화)

### 2.3 경쟁 분석 매트릭스

| 솔루션 | Vertical | During/After | Agentic | 차별점 | 약점 |
|--------|----------|--------------|---------|--------|------|
| **Fireflies** | ❌ Horizontal | After | ❌ 요약만 | 무료 플랜, 언어 지원 | 범용, Sherlocking 위험 |
| **Otter** | ❌ Horizontal | After | ❌ 요약만 | 교육 시장 강세 | 차별화 없음 |
| **Gong** | ✅ Sales | After | ✅ CRM 연동 | Salesforce 통합, 코칭 | $1,200/yr 고가, 대기업 타겟 |
| **Fellow** | ❌ Horizontal | During | ⚠️ 일부 | 회의 중 아젠다 관리 | 실시간 분석 약함 |
| **Fathom** | ❌ Horizontal | After | ⚠️ 일부 | Free-forever 모델 | 수익화 어려움 |
| **QuotaBook** (한국) | ✅ VC | N/A | ❌ Cap table만 | 한국 VC 시장 장악 | 회의 인텔리전스 없음 |
| **P-A-M** | ✅ VC/AC/CB | **During** | ✅ 질문+CRM | **실시간 질문 제안** | 초기 단계, 검증 필요 |

### 2.4 시장 기회 분석

**Why Now?**
1. **기술 성숙도**:
   - Real-time STT (Whisper, Deepgram) 정확도 95%+
   - LLM reasoning (GPT-4o) 충분히 빠름 (latency <2초)
   - RAG 기술로 과거 맥락 실시간 로드 가능

2. **시장 공백**:
   - Horizontal 시장은 포화 (Otter, Fireflies 경쟁)
   - Vertical 중 VC/투자 시장은 Gong(Sales)처럼 깊게 공략한 플레이어 없음
   - Korean VC 시장은 QuotaBook 있지만 회의 인텔리전스 부재

3. **고객 Pain의 명확성**:
   - VC/AC는 "질문 잘해야 성과 나는" 직군
   - 기존 도구(Notion, Airtable)는 회의 '전'에만 유용
   - 회의 '중' 인지 부하 해결하는 도구 부재

**TAM/SAM/SOM**
- **TAM** (전세계 VC/PE/Consultant): ~$500M
  - 글로벌 VC 6,000개 × 평균 10명 = 60,000명
  - PE/Consultant 추가 시 ~100,000명
  - ARPU $5,000 가정

- **SAM** (영어권 + 한국 VC/AC/CB): ~$20M
  - 미국 VC: 3,000개 × 5명 = 15,000명
  - 한국 VC/AC: 200개 × 5명 = 1,000명
  - CB/Studio: ~200명
  - ARPU $1,000 (초기 가격)

- **SOM** (5년 목표): $2M ARR
  - 한국 Tier 2 VC 30개 × 5명 × $500 = $75K
  - 미국 VC 200명 × $1,000 = $200K
  - 연간 성장 → 5년 후 2,000명 × $1,000

### 2.5 한국 시장 특수성

**기회 요인**:
1. **HWP 파일 지옥**: 한국 VC는 여전히 아래아한글 사용 → OCR/파싱 수요
2. **PIPA 규제**: 데이터 주권 이슈로 해외 SaaS 도입 꺼림 → 국내 솔루션 선호
3. **QuotaBook 파트너십**: Cap table 관리 1위와 연동 시 빠른 확산 가능
4. **Cohesive 생태계**: 한국 VC는 좁은 네트워크 → 1개 대형 VC 확보 시 레퍼런스 효과

**위험 요인**:
1. **작은 시장 규모**: 한국 VC 전체 ~1,000명 → 글로벌 확장 필수
2. **낮은 SaaS 지불 의향**: 미국 $1,000 vs 한국 $500 예상
3. **망분리**: 금융 계열 VC는 보안 이슈로 클라우드 SaaS 사용 불가

---

## 3단계: 핵심 문제의 재정의

### 3.1 문제의 본질: "인지적 병목 (Cognitive Bottleneck)"

15개 Pain Point의 공통 근본 원인:

> **인간은 실시간 대화 중에 4가지를 동시에 할 수 없다**

1. **듣기** (Listening): 상대방 발언 이해 → 60% 에너지 소모
2. **분석** (Analyzing): 발언의 논리적 허점, 누락된 정보 파악 → 20%
3. **기억** (Recalling): 과거 대화 맥락, 도메인 지식 상기 → 10%
4. **생성** (Generating): 다음 질문 구성 → 10%

**결과**: 90%를 "듣기"에 쓰고, 나머지에 10%만 남음
→ 질문을 '알지만' '던지지' 못하는 상황 발생

### 3.2 기존 솔루션의 한계

| 솔루션 | 해결하는 것 | 해결 못하는 것 |
|--------|-----------|--------------|
| **Fireflies/Otter** | 사후 '기억' (녹취록 검색) | 실시간 '분석·생성' |
| **Gong** | 사후 '분석' (코칭 피드백) | 실시간 '생성' (질문 제안) |
| **Fellow** | 사전 '준비' (아젠다) | 실시간 '적응' (맥락 변화 대응) |
| **Notion/Airtable** | 사전 '체크리스트' | 회의 중 '활성화' |

**P-A-M의 차별점**:
→ 회의 '중' **실시간 질문 생성**에 집중 (During-the-fact Question Generation)

### 3.3 고객의 진짜 요구

페르소나 분석에서 반복 등장한 문장:

- "내가 놓친 질문을 **지금 당장** 알려줘" (VC 김준서)
- "이 팀이 **지난주에** 뭐 고민했는지 **회의 시작하자마자** 띄워줘" (AC 이서연)
- "**회의 끝나고** 내가 할 일 **자동으로** Notion에 넣어줘" (CB PO)

**핵심 키워드**: "지금", "자동으로", "실시간"

---

## 4단계: P-A-M의 핵심 가치 제안 (3-Axis Model)

### 4.1 제품 철학

**"AI가 옆에서 속삭이는 두 번째 뇌"**

- ❌ 회의를 '대신' 하는 도구 (AI가 질문 자동 전송) → 신뢰 문제
- ✅ 회의를 '돕는' 도구 (질문 제안 → 인간이 선택·수정) → Human-in-the-Loop

### 4.2 3개 축 (MVP Core)

```
┌─────────────────────────────────────────────┐
│  Axis 1: Real-time Question Generation     │
│  "지금 던져야 할 질문"                        │
└─────────────────────────────────────────────┘
              ↓ 입력: STT 실시간 전사
              ↓ 처리: 대화 단계 인식, 정보 누락 탐지
              ↓ 출력: 우선순위별 질문 3~5개
                     🔴 Critical (필수)
                     🟡 Important (권장)
                     🟢 Follow-up (나중에 물어도 됨)

┌─────────────────────────────────────────────┐
│  Axis 2: Contextual Insight Layer          │
│  "이해를 돕는 배경 지식"                       │
└─────────────────────────────────────────────┘
              ↓ 입력: 발언 + 과거 대화 + 도메인 DB
              ↓ 처리: RAG 기반 맥락 로드, 벤치마크 비교
              ↓ 출력:
                - "지난주에 이 팀은 X 고민했음" 카드
                - "CAC $50 = 동종업계 상위 25%" 카드
                - "PMF 개념 설명" 팝업

┌─────────────────────────────────────────────┐
│  Axis 3: Workflow Bridge                   │
│  "회의 → 업무 자동 연결"                      │
└─────────────────────────────────────────────┘
              ↓ 입력: 회의 중 결정·액션 아이템
              ↓ 처리: NLU로 태스크 추출
              ↓ 출력:
                - Notion에 "다음 주까지 재무 자료 요청" 자동 생성
                - Calendar에 "2주 후 Follow-up 미팅" 자동 예약
                - Slack에 "팀원에게 X 공유" 메시지 초안
              ↓ 중요: Human Approval 필수 (자동 실행 X)
```

### 4.3 사용자 여정 (User Journey)

**회의 전 (Pre-meeting)**:
- P-A-M이 과거 대화 자동 로드: "지난번에 A팀은 마케팅 예산 고민 중이었음"
- 투자 단계 자동 인식: "오늘은 Series A 심사 → 필수 질문 20개 활성화"

**회의 중 (During-meeting)**:
- **0:05**: 창업자 "저희 MAU 5만입니다"
  - P-A-M: 🟡 "그중 Paying user 비율은?" (질문 제안)
  - P-A-M: 💡 "동종 SaaS의 MAU→Paying 전환율 평균 2~5%" (벤치마크 카드)

- **0:15**: 창업자 "CAC는 $30입니다"
  - P-A-M: 🔴 "LTV는 얼마인가요? CAC:LTV 비율 확인 필요" (Critical 질문)
  - P-A-M: 💡 "CAC = Customer Acquisition Cost (고객 획득 비용)" (개념 설명)

- **0:25**: 심사역 "다음 주까지 재무 자료 보내주세요"
  - P-A-M: ✅ Notion에 "A팀에게 재무 자료 요청 (Due: 12/9)" 태스크 초안 생성

**회의 후 (Post-meeting)**:
- 회의 요약 자동 생성 (기존 Otter/Fireflies와 동일)
- 던지지 못한 질문 리스트: "다음에 물어보세요" (🟢 Follow-up 질문들)
- Notion 자동 업데이트 (사용자 승인 후)

---

## 5단계: RICE 기반 MVP 기능 선정

### 5.1 선정 방법론: RICE Framework

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

- **Reach** (1~5점): 몇 명의 페르소나가 혜택을 받는가?
  - 5점 = 모든 페르소나 (VC + AC + CB)
  - 3점 = 2개 페르소나
  - 1점 = 1개 페르소나만

- **Impact** (1~5점): Pain 해결 강도
  - 5점 = "이거 없으면 회의 못해요" 수준
  - 3점 = "있으면 좋아요"
  - 1점 = "별로 안 중요해요"

- **Confidence** (0~1): 6개월 내 구현 가능성
  - 0.9 = 기존 API 조합으로 구현 (Whisper + GPT)
  - 0.6 = LLM fine-tuning 필요
  - 0.3 = 새로운 알고리즘 연구 필요

- **Effort** (1~12): 개발 Person-Month
  - 12 = 1년 소요
  - 6 = 6개월
  - 2 = 2개월

### 5.2 15개 Pain → RICE 평가 결과

| 순위 | Pain Point | 기능 (Feature) | RICE | 선정 |
|-----|-----------|---------------|------|------|
| 1 | Follow-up Weakness | 액션 아이템 자동 추출 + CRM 연동 | **4.50** | ✅ MVP |
| 2 | Teaching Overload | 자동 개념 설명 카드 | **4.05** | ✅ MVP |
| 3 | Context Recall Failure | 과거 회의 맥락 자동 로드 | **4.00** | ✅ MVP |
| 4 | Question Timing Gap | 실시간 질문 제안 엔진 | **2.50** | ✅ MVP |
| 5 | Stage Blindness | 투자 단계별 필수 질문 체크 | **2.40** | ✅ MVP |
| 6 | Checklist Dormancy | 맥락 인식 체크리스트 활성화 | **2.33** | ✅ MVP |
| 7 | Benchmark Lag | 실시간 벤치마크 카드 | **2.24** | ✅ MVP |
| 8 | Surface Acceptance | 발언 검증 레이어 (모순 탐지) | 1.71 | ⏸️ Phase 2 |
| 9 | Reporting Data Gap | 회의 → 보고서 자동 변환 | 1.60 | ⏸️ 한국 특화, 후순위 |
| 10 | Cohort Tracking Gap | Multi-team 맥락 스위칭 | 1.60 | ⏸️ AC 특화, 후순위 |
| 11 | Interview Follow-up | 인터뷰 후 자동 후속 질문 생성 | 1.58 | ⏸️ Phase 2 |
| 12 | Validation Rigor Gap | 가설 검증 추적기 | 1.44 | ⏸️ CB 특화, 후순위 |
| 13 | Knowledge Evaporation | 조직 지식 베이스 자동 구축 | 1.20 | ⏸️ Fireflies 중복 |
| 14 | Echo Chamber | Devil's Advocate 모드 | 0.67 | ❌ 실험적, MVP 제외 |
| 15 | Manual Resource Matching | 자동 멘토 매칭 추천 | 0.23 | ❌ 별도 서비스 영역 |

**선정 기준**:
- **RICE ≥ 2.0** = MVP 필수 포함 → 7개 기능 선정
- **1.5 ≤ RICE < 2.0** = Phase 2 검토
- **RICE < 1.5** = 제외 또는 장기 로드맵

### 5.3 MVP 최종 7대 기능

| 기능 | 3-Axis 분류 | 개발 우선순위 | 이유 |
|------|-----------|--------------|------|
| **1. 액션 아이템 자동 추출 + CRM 연동** | Axis 3 (Workflow) | **P0** | RICE 최고점(4.50), 즉시 가치 체감 |
| **2. 자동 개념 설명 카드** | Axis 2 (Insight) | **P0** | 구현 쉬움(Effort 2), Quick Win |
| **3. 과거 회의 맥락 자동 로드** | Axis 2 (Insight) | **P1** | RAG 기술 활용, 차별화 핵심 |
| **4. 실시간 질문 제안 엔진** | Axis 1 (Question) | **P0** | P-A-M의 정체성, 최우선 개발 |
| **5. 투자 단계별 필수 질문 체크** | Axis 1 (Question) | **P1** | VC vertical 강화 |
| **6. 맥락 인식 체크리스트 활성화** | Axis 1 (Question) | **P1** | Notion/Airtable 연동 |
| **7. 실시간 벤치마크 카드** | Axis 2 (Insight) | **P2** | DB 구축 필요, 3~4개월차 |

**3-Axis 균형 확인**:
- Axis 1 (Question Gen): 3개 기능 ✅
- Axis 2 (Insight Layer): 3개 기능 ✅
- Axis 3 (Workflow Bridge): 1개 기능 ✅

---

## 6단계: 6개월 MVP 개발 로드맵

### Phase 1: Foundation (Month 1-2)
**목표**: "듣고 → 행동하는" 최소 기능 구현

#### Week 1-2: STT 파이프라인
- Whisper API vs Deepgram 비교 테스트
- 한국어 정확도 95%+ 확보
- 실시간 latency <2초 달성

#### Week 3-4: 액션 아이템 추출 엔진
- GPT-4o Prompt Engineering
- "다음 주까지 X 확인" 패턴 인식
- False Positive <10% 목표

#### Week 5-6: Notion API 연동
- OAuth 인증 구현
- 자동 태스크 생성 (Database item creation)
- User Approval UI (자동 실행 전 확인)

#### Week 7-8: 개념 설명 DB
- VC/Startup 용어 50개 구축 (CAC, LTV, PMF, Churn 등)
- 자동 팝업 트리거 로직
- 설명 카드 UI 디자인

**성공 지표 (Month 2 종료 시)**:
- ✅ Beta 유저 10명 모집
- ✅ 회의당 평균 액션 아이템 3개 자동 생성
- ✅ "이거 없으면 회의 못해요" 피드백 3건+

---

### Phase 2: Intelligence (Month 3-4)
**목표**: "질문을 대신 생각해주는" 핵심 차별화

#### Week 9-10: 대화 맥락 분석 엔진
- 대화 단계 인식 모델 (Introduction → Problem → Solution → Financials → Close)
- 각 단계별 필수 정보 체크리스트 매핑
- 정보 누락 탐지 알고리즘

#### Week 11-12: 질문 생성 모델
- VC 체크리스트 500개 수집 (Notion/Airtable 크롤링, 공개 자료)
- GPT-4o fine-tuning (Question Generation task)
- A/B 테스트: Fine-tuned vs Prompt-only

#### Week 13-14: 실시간 질문 제안 UI
- 우선순위 라벨링 (🔴🟡🟢) 알고리즘
- Non-intrusive UI (화면 오른쪽 패널, 접기 가능)
- 질문 클릭 → 클립보드 복사 or 음성 읽기

#### Week 15-16: 투자 단계별 템플릿
- Seed / Series A / Series B / Series C+ 템플릿
- 각 단계별 필수 질문 20개 정의
- 자동 단계 인식 (회의 제목, 초기 발언 분석)

**성공 지표 (Month 4 종료 시)**:
- ✅ Beta 유저 30명으로 확대
- ✅ 회의당 질문 제안 8개, 실제 사용률 40%+
- ✅ "AI가 놓칠 뻔한 질문 잡아줬다" 피드백 5건+

---

### Phase 3: Memory (Month 5-6)
**목표**: "과거를 기억하는" 맥락 지능 구현

#### Week 17-18: RAG 파이프라인
- Vector DB 선정 (Pinecone vs Weaviate)
- 모든 과거 회의 임베딩 (OpenAI text-embedding-3)
- Semantic search 정확도 테스트

#### Week 19-20: 맥락 자동 로드 기능
- 회의 시작 시 "같은 상대와 이전 대화" 자동 검색
- "지난번에 X 약속했음" 카드 생성
- 시간 경과 가중치 (최근 회의 우선 표시)

#### Week 21-22: 벤치마크 DB 구축
- 100개 기업 데이터 수집 (공개 자료: Crunchbase, PitchBook)
- Industry × Stage × Metric 매트릭스
- "동종업계 상위 25%" 자동 계산 로직

#### Week 23-24: Production 전환 준비
- 보안 감사 (Penetration Test)
- PIPA 준수 확인 (개인정보 암호화, 동의 절차)
- Stripe 결제 시스템 연동
- Onboarding 플로우 최적화

**성공 지표 (Month 6 종료 시)**:
- ✅ 유료 전환율 20%+ (30명 중 6명)
- ✅ NPS 50+ (Fireflies 평균 40 vs)
- ✅ MRR $1,000 달성 ($166/month × 6명)

---

## 7단계: 성공 기준 및 Pivot 트리거

### 7.1 PMF 검증 지표 (6개월 후)

| 지표 | 목표 | 측정 방법 | Benchmark |
|-----|------|----------|-----------|
| **Sean Ellis Test** | "매우 실망" 40%+ | 설문: "P-A-M 없어지면 얼마나 실망?" | Superhuman 40%, Slack 51% |
| **Week 4 Retention** | 60%+ | 4주 후에도 주 3회 이상 사용 | SaaS 평균 35%, Best 60%+ |
| **Paying Customers** | 6명+ | Beta 30명 중 유료 전환 | 전환율 20% = 건강한 B2B SaaS |
| **Feature Usage** | 질문 제안 사용률 40%+ | 제안된 질문 중 실제 던진 비율 | GitHub Copilot 35% 참고 |
| **Workflow Integration** | Notion 연동 활성 80%+ | 액션 아이템 자동 생성 수락률 | Zapier 연동 평균 70% |
| **NPS** | 50+ | Promoter - Detractor | SaaS 평균 30, Excellent 50+ |

### 7.2 Go/No-Go Decision Tree

#### ✅ GO (계속 진행) 조건
- Sean Ellis Test ≥ 40% **AND**
- Week 4 Retention ≥ 50% **AND**
- Paying Customers ≥ 4명

→ **Series A 준비** (목표: $3M, 18개월 runway)

#### ⚠️ PIVOT (방향 전환) 트리거

**Scenario 1: Retention 붕괴 (<30%)**
- **신호**: 처음엔 쓰다가 4주 후 사용 중단
- **원인 가설**: 실시간 질문 제안이 방해됨 (Intrusive)
- **Pivot 방향**: During-the-fact 포기 → After-the-fact 강화 (Fireflies 경쟁)
- **액션**: 회의 '후' 코칭에 집중 (Gong 모델)

**Scenario 2: 질문 사용률 폭락 (<20%)**
- **신호**: 질문 제안은 보지만 실제로 안 던짐
- **원인 가설**: 질문이 부정확하거나 타이밍이 안 맞음
- **Pivot 방향**: "질문 생성" 포기 → "체크리스트 자동 활성화"에 집중
- **액션**: Notion/Airtable 플러그인으로 전환

**Scenario 3: 유료 전환 제로 (0명)**
- **신호**: "좋긴 한데 돈 낼 정도는 아니에요"
- **원인 가설**: Value proposition이 약함 or 가격 저항
- **Pivot 방향**: B2C 포기 → B2B2C (AC가 포트폴리오에게 제공)
- **액션**: AC/Venture Studio 번들 라이선스 모델

**Scenario 4: "Zoom/Teams에 이미 있어요" (Sherlocking)**
- **신호**: Microsoft가 Copilot에 비슷한 기능 추가 발표
- **원인**: Platform risk 현실화
- **Pivot 방향**: 더 깊은 Vertical 공략 (Legal AI, Healthcare)
- **액션**: 투자 심사 전체 프로세스로 확장 (Due Diligence 자동화)

### 7.3 북극성 지표 (North Star Metric)

**"회의당 던져진 AI 제안 질문 수"**

- **Why**: P-A-M의 핵심 가치를 직접 측정
- **목표**:
  - Month 2: 회의당 1개
  - Month 4: 회의당 3개
  - Month 6: 회의당 5개
- **Breakdown**:
  - 질문 제안 수 (Leading indicator)
  - 질문 클릭률 (Engagement)
  - 질문 실제 사용률 (Impact)

---

## 부록

### A. 기술 스택 (예정)

**Frontend**:
- React + TypeScript (Web App)
- Electron (Desktop App, optional)
- Real-time WebSocket for STT stream

**Backend**:
- Node.js + Express (API Server)
- Python FastAPI (ML Inference)
- PostgreSQL (User data, Meeting metadata)
- Redis (Cache, Real-time state)

**AI/ML**:
- OpenAI Whisper API (STT)
- GPT-4o (Question Generation, NLU)
- text-embedding-3 (RAG)
- Pinecone (Vector DB)

**Integrations**:
- Zoom SDK (Real-time audio capture)
- Google Meet API (대안)
- Notion API (Task creation)
- Calendar API (Follow-up 미팅 예약)

**Infrastructure**:
- AWS (Primary cloud)
- CloudFlare (CDN, DDoS protection)
- Sentry (Error tracking)
- Mixpanel (Product analytics)

### B. 경쟁사 심층 비교

| 차원 | Fireflies | Gong | Fellow | P-A-M |
|-----|-----------|------|--------|-------|
| **가격** | Free~$19/mo | $1,200/yr | $7~15/mo | **$10~20/mo** (예정) |
| **타겟** | SMB, 개인 | Enterprise Sales | Team meetings | VC/AC/CB |
| **차별점** | 무료 | Salesforce 통합 | 회의 아젠다 | 실시간 질문 제안 |
| **약점** | 차별화 없음 | 고가, 대기업 only | 분석 약함 | 초기, 검증 필요 |
| **Sherlocking 위험** | ⚠️ 높음 | ⚠️ 중간 | ⚠️ 높음 | ✅ 낮음 (Vertical) |
| **한국 시장** | ❌ 한국어 부족 | ❌ 없음 | ❌ 없음 | ✅ PIPA 준수 |

### C. 페르소나 상세 프로필

#### Persona 1: VC 심사역 "김준서 (Alex Kim)"
- **직급**: Associate (5년차)
- **소속**: Tier 2 VC (AUM $100M)
- **업무**: 초기 스크리닝, Due Diligence 보조, 포트폴리오 관리
- **Pain 강도**: Question Timing Gap ★★★★★, Stage Blindness ★★★★☆
- **Tool Stack**: Notion (체크리스트), Google Calendar, Slack, QuotaBook
- **지불 의향**: $15~20/month

#### Persona 2: AC 프로그램 매니저 "이서연 (Sarah Lee)"
- **직급**: Program Manager (3년차)
- **소속**: 정부 지원 AC (Cohort 20개 팀)
- **업무**: 멘토링, 교육, 데모데이 준비, 후속 투자 연결
- **Pain 강도**: Teaching Overload ★★★★★, Cohort Tracking ★★★★☆
- **Tool Stack**: Airtable (팀 관리), Zoom, Notion
- **지불 의향**: $10~15/month (회사 예산)

#### Persona 3: Company Builder PO
- **직급**: Product Owner / Venture Builder
- **소속**: Corporate Venture Studio
- **업무**: 아이디어 검증, 사용자 인터뷰, 내부 보고
- **Pain 강도**: Echo Chamber ★★★★★, Validation Rigor ★★★★☆
- **Tool Stack**: Miro, Notion, Google Docs, User Interview 도구
- **지불 의향**: $20/month (개인 비용 가능)

### D. 향후 로드맵 (12개월+)

**Month 7-9: Phase 4 (Korean Market)**
- HWP 파일 자동 파싱 (Upstage Document AI 연동)
- QuotaBook API 연동 (Cap table 데이터 자동 로드)
- 한국어 도메인 용어 DB 확장 (200개 → 500개)
- 한국 VC 20개 확보 목표

**Month 10-12: Phase 5 (US Expansion)**
- 영어 모델 fine-tuning
- US VC 타겟팅 (Y Combinator, 500 Startups 졸업생 중심)
- Calendly, HubSpot 연동 (미국 시장 주요 도구)
- ARR $100K 목표

**Year 2: Platform Expansion**
- API 공개 (타사 도구 연동 허용)
- Chrome Extension (Zoom/Google Meet 바로 사용)
- Mobile App (iOS/Android)
- Team Plan (조직 전체 지식 베이스 공유)

**Year 3: Service-as-Software**
- "AI Analyst-as-a-Service" 모델
- Due Diligence 전 과정 자동화
- Deal flow 자동 매칭 (LP ↔ GP)
- Outcome-based Pricing (성사된 투자당 과금)

---

## 문서 변경 이력

- **v1.0** (2025-12-02): 초안 작성 - 페르소나 분석부터 MVP 선정까지 전 과정 문서화

---

**다음 단계**:
- [ ] 기술 아키텍처 설계 (STT 파이프라인, LLM Orchestration)
- [ ] Go-to-Market 전략 (Beachhead 고객 30명 확보 방법)
- [ ] 가격 모델 설계 (Freemium vs Paid-only, Tier 구분)
- [ ] 와이어프레임/UX 설계 (실시간 질문 제안 UI)
- [ ] 초기 투자 유치 전략 (Pre-seed $500K 목표)
