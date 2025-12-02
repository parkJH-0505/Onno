# Onno 프로젝트 가이드

**Real-Time Conversation Intelligence Platform**

**최종 업데이트**: 2025-12-02
**프로젝트 상태**: 기획 완료 → 개발 착수 준비
**GitHub**: https://github.com/parkJH-0505/Onno

---

## 🎯 프로젝트 한 줄 요약

> 회의 중 실시간으로 "무엇을 물어봐야 하는지" 제안하고,
> 사용할수록 나를 더 잘 아는 AI 대화 파트너

**핵심 차별점**:
- ❌ 회의 후 요약 (Fireflies, Otter, MS Copilot)
- ✅ **회의 중 질문 제안** (유일무이)

**핵심 경쟁력**:
- 🎯 **During-the-fact**: 실시간 질문·인사이트
- 🎓 **개인화**: 사용할수록 똑똑해지는 AI (Lv.1-5)
- 🎭 **페르소나**: 상황별 AI 성격 전환 (4가지)
- 💾 **데이터 모트**: 3개월 사용 = 타 서비스 전환 불가

---

## 📋 목차

1. [빠른 시작 (5분 안에 프로젝트 이해하기)](#1-빠른-시작)
2. [프로젝트 현황](#2-프로젝트-현황)
3. [핵심 개념](#3-핵심-개념)
4. [개발 로드맵](#4-개발-로드맵)
5. [기술 스택](#5-기술-스택)
6. [팀 역할 및 온보딩](#6-팀-역할-및-온보딩)
7. [개발 시작 가이드](#7-개발-시작-가이드)
8. [문서 구조](#8-문서-구조)
9. [FAQ](#9-faq)

---

## 1. 빠른 시작

### 1-1. 이 프로젝트가 해결하는 문제

**상황**: VC 심사역이 스타트업 투자 심사 미팅 중

```
창업가: "저희 CAC는 $30입니다."

심사역: (속으로) "LTV를 물어봐야 하는데... 뭐라고 물어보지?"
        (결국 안 물어봄)

→ 회의 종료 후 "아, LTV 물어볼 걸..." 후회

→ 재회의 필요 (시간·비용 낭비)
```

**Onno 솔루션**:

```
창업가: "저희 CAC는 $30입니다."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Onno 실시간 제안:

🔴 Critical
"LTV(생애 가치)는 얼마인가요?"

💬 이유: CAC만으로는 수익성 판단이 어렵습니다.
        LTV:CAC 비율이 3:1 이상이어야 합니다.

[사용하기] ← 클릭하면 즉시 질문 가능
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

심사역: (클릭) "LTV는 얼마인가요?"

→ 회의 중 리스크 발견
→ 재회의 불필요
→ 의사결정 품질 향상
```

### 1-2. 3가지 핵심 기능

#### 1) 실시간 질문 제안 (During-the-fact)

- 회의 **진행 중** 실시간으로 질문 3-5개 제안
- 우선순위 라벨 (Critical, Important, Follow-up)
- 질문 이유 설명 포함

#### 2) 도메인 특화 인사이트

- 언급된 지표 자동 추출 (MRR, CAC, LTV 등)
- 벤치마크 자동 비교 ("SaaS 평균 대비 높음")
- 리스크 자동 감지 ("LTV 미언급")

#### 3) 나만의 온노 (개인화)

- **레벨 시스템** (Lv.1 → Lv.5)
  - Lv.1: 기본 질문 (모든 사용자 동일)
  - Lv.2: 과거 맥락 자동 로드 ⭐
  - Lv.3: 벤치마크 비교 ⭐
  - Lv.4: 예측 질문 ⭐
  - Lv.5: 커스텀 템플릿 생성 ⭐

- **페르소나 시스템** (4가지)
  - 📊 Analyst (데이터 중심)
  - 🤝 Buddy (팀·문화 중심)
  - 🛡️ Guardian (리스크 중심)
  - 🌟 Visionary (성장 중심)

### 1-3. 시장 기회

```
글로벌 회의 솔루션 시장:
2024: $4.5B → 2030: $15B+ (CAGR 22%)

한국 타깃 시장:
VC/AC: ~250명
스타트업: ~5,000명
컨설팅·세일즈: ~95,000명

3년 목표:
Year 1: ARR $36K (150명)
Year 2: ARR $288K (1,200명)
Year 3: ARR $1M+ (4,500명)
```

---

## 2. 프로젝트 현황

### 2-1. 현재 상태 (2025-12-02)

```
✅ Phase 0: 전략·기획 완료 (100%)
   - 시장 조사 완료
   - 페르소나 분석 완료
   - 문제 정의 완료
   - 제품 기획 완료 (PRD 4부작)
   - 개인화 시스템 설계 완료
   - User Flow 설계 완료
   - 기술 아키텍처 설계 완료
   - 18개월 마스터플랜 완료

🔄 Phase 1: Foundation (진행 예정)
   - 팀 구성 (CTO, ML Engineer 채용)
   - 개발 환경 세팅
   - STT 파이프라인 구축
   - MVP 개발 (Month 1-2)

⏳ Phase 2-6: 후속 단계 (대기)
```

### 2-2. 주요 마일스톤

| 시점 | 마일스톤 | 상태 | 검증 기준 |
|-----|---------|------|----------|
| **2025-11** | 전략 수립 | ✅ 완료 | 페르소나 3개, Pain Point 15개 |
| **2025-12** | 기획 완료 | ✅ 완료 | PRD 4부작, User Flow, 기술 설계 |
| **2025-12** | 팀 구성 | 🔄 진행 중 | CTO, ML Engineer 채용 |
| **2026-01** | MVP 개발 시작 | ⏳ 대기 | W1: STT 95%+ |
| **2026-02** | 내부 테스트 | ⏳ 대기 | 10명 테스터, 피드백 수집 |
| **2026-04** | Beta 론칭 | ⏳ 대기 | 30명 Beta 유저 |
| **2026-06** | Public Beta | ⏳ 대기 | 100명, 유료 6명+ |

### 2-3. 현재 우선순위

**🔥 지금 당장 해야 할 일**:

1. **팀 구성** (Week 1-2)
   - [ ] CTO/Full-stack 채용 또는 Co-founder 확보
   - [ ] AI/ML Engineer Full-time 채용
   - [ ] 개발 환경 세팅 (GitHub, Slack, Notion)

2. **자금 조달** (Week 1-4)
   - [ ] Pre-seed $170K 투자 유치
   - [ ] 정부지원사업 신청
   - [ ] 엔젤 투자자 컨택

3. **기술 검증** (Week 3-4)
   - [ ] STT 파이프라인 Prototype (Whisper API)
   - [ ] LLM Prompt 초기 버전 테스트
   - [ ] 개인화 학습 알고리즘 설계

---

## 3. 핵심 개념

### 3-1. During-the-fact vs After-the-fact

**기존 솔루션 (After-the-fact)**:
```
회의 진행 → 회의 종료 → 녹음 파일 전사 → 요약 생성
                       (5-10분 소요)
```

**Onno (During-the-fact)**:
```
회의 진행 → 실시간 전사 → 즉시 분석 → 질문 제안
         (<2초 latency)      (<2초 latency)
```

**핵심 차이**:
- 기존: 문제를 **회의 후에 발견** (손 쓸 수 없음)
- Onno: 문제를 **회의 중에 발견** (즉시 해결 가능)

### 3-2. 개인화 시스템 (나만의 온노)

#### 레벨 시스템

```
사용 횟수에 따른 경험치(XP) 획득
↓
레벨업 (Lv.1 → Lv.2 → Lv.3 → Lv.4 → Lv.5)
↓
각 레벨마다 실제 기능 언락
↓
높은 전환 비용 (Switching Cost)
```

**예시**:

| 레벨 | 필요 XP | 회의 수 | 언락 기능 |
|-----|--------|--------|----------|
| Lv.1 | 0 | 0 | 기본 질문 제안 |
| Lv.2 | 100 | ~5회 | **과거 맥락 자동 로드** |
| Lv.3 | 300 | ~15회 | **벤치마크 비교** |
| Lv.4 | 700 | ~35회 | **예측 질문** |
| Lv.5 | 1500 | ~75회 | **커스텀 템플릿 생성** |

#### 5가지 학습 신호

1. **질문 사용 패턴**: 어떤 질문을 사용/무시하는가?
2. **반복되는 맥락**: 같은 참석자/프로젝트가 반복되는가?
3. **명시적 피드백**: 👍/👎, 수정, 의견
4. **회의 후 행동**: 어떤 액션을 실행했는가?
5. **팀 패턴**: 팀 전체의 질문 패턴

#### 페르소나 시스템

| 페르소나 | 질문 스타일 | 사용 상황 |
|---------|------------|----------|
| 📊 **Analyst** | "구체적인 수치는?", "지표로 측정하면?" | 투자 심사, 실적 검토 |
| 🤝 **Buddy** | "팀 분위기는?", "협업 방식은?" | 멘토링, 팀 빌딩 |
| 🛡️ **Guardian** | "리스크는?", "대비책은?" | 리스크 리뷰, DD |
| 🌟 **Visionary** | "3년 후는?", "확장 계획은?" | 전략 회의, IR |

### 3-3. 데이터 모트 (Data Moat)

```
3개월 사용 (50+ 회의)
↓
축적된 데이터:
- 선호 질문 타입
- 과거 회의 맥락
- 개인 패턴
- 팀 지식
↓
타 서비스로 전환 시:
→ 모든 학습 데이터 리셋
→ 다시 Lv.1부터 시작
↓
높은 전환 비용
↓
장기 리텐션 + LTV 증가

예상:
Lv.1 LTV: $400
Lv.3+ LTV: $600 (+50%)
```

---

## 4. 개발 로드맵

### 4-1. 전체 타임라인 (18개월)

```
2025 Q1          Q2          Q3          Q4    │ 2026 Q1-Q2
───────────────────────────────────────────────┼──────────────
[준비]      [MVP]   [Beta]  [Launch] [Scale]  │ [Platform]
Now         M1-2    M3-4    M5-6     M7-9      │ M13-18
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━
현재 위치: 팀 구성 + 자금 조달
```

### 4-2. Phase별 목표 및 주요 기능

#### Phase 1: Foundation (Month 1-2) 🎯 현재 다음 단계

**목표**: "듣고 → 행동하는" 최소 기능

**주요 기능**:
- ✅ 실시간 STT (Whisper API)
- ✅ 회의 전사
- ✅ 액션 아이템 자동 추출
- ✅ Notion 연동
- 🎓 개인화 Lv.1: 질문 피드백 수집 시작

**성공 지표**:
- STT 정확도 95%+
- Latency <2초
- 내부 테스터 10명 피드백
- 학습 데이터 수집률 80%+

**팀**: 3명 (CEO/PM, CTO, ML Engineer)

---

#### Phase 2: Intelligence (Month 3-4)

**목표**: "질문을 대신 생성하는" 핵심 차별화

**주요 기능**:
- ✅ AI 질문 제안 v1
- ✅ 과거 맥락 자동 로드 (RAG)
- ✅ 용어 설명 DB (100개)
- ✅ 체크리스트 연동
- 🎓 개인화 Lv.2: 스타일 반영, 선호도 학습

**성공 지표**:
- Beta 유저 30명
- 질문 사용률 30%+
- Lv.2 달성률 50%+
- Week 2 Retention 50%+

**팀**: 4명 (Frontend +1)

---

#### Phase 3: Launch (Month 5-6)

**목표**: Production 출시 + 고급 개인화

**주요 기능**:
- ✅ 전체 회의 검색 (Semantic Search)
- ✅ 회의 요약 자동 생성
- ✅ 결제 시스템 (Stripe)
- ✅ 보안·PIPA 준수
- 🎓 개인화 Lv.3-4: 벤치마크, 예측 질문
- 🎭 페르소나 시스템 v1 (4가지)

**성공 지표** (🎯 PMF 검증):
- Public Beta 100명
- 유료 전환 6명+ (6%+)
- Lv.3 달성률 20%+
- 페르소나 사용률 30%+
- NPS 50+
- **Week 4 Retention 60%+**

**팀**: 4명

---

#### Phase 4: Scale (Month 7-9)

**목표**: 한국 VC 시장 공략

**주요 기능**:
- ✅ 한국 VC 특화 (HWP 파싱, QuotaBook 연동)
- ✅ 벤치마크 DB 100개 기업
- ✅ 체크리스트 Marketplace
- 🎓 개인화 Lv.5: 커스텀 템플릿, Marketplace 기여

**성공 지표**:
- 한국 VC 10개 확보
- 유료 고객 75명
- Lv.4 달성률 30%+
- MRR $1,500

**팀**: 7명 (Growth, CS 추가)

---

#### Phase 5: Grow (Month 10-12)

**목표**: B2B 세일즈 + Team 플랜

**주요 기능**:
- ✅ Team 플랜 (팀 공유 지식 베이스)
- ✅ 관리자 대시보드
- ✅ Calendar 연동
- 🎓 팀 레벨 개인화 (조직 학습)

**성공 지표** (🎯 Year 1 종료):
- 유료 고객 150명
- Team 플랜 5개 조직
- MRR $3,000
- **ARR $36,000**

**팀**: 7명

---

#### Phase 6: Platform (Month 13-18)

**목표**: 글로벌 플랫폼 + API 생태계

**주요 기능**:
- ✅ 플로팅 앱 (Electron)
- ✅ API 공개
- ✅ Enterprise 플랜 (SSO, 감사 로그)
- ✅ 미국 진출

**성공 지표**:
- 유료 고객 1,200명
- MRR $24,000
- ARR $288,000
- 미국 고객 비율 20%+

**팀**: 12명

---

### 4-3. 현재 우선순위 (Week 1-8)

#### Week 1-2: 팀 구성 + 자금 조달

```
🔥 Critical (지금 당장)
□ CTO/Full-stack 채용 또는 Co-founder 확보
□ AI/ML Engineer Full-time 채용
□ Pre-seed $170K 투자 유치
  - 정부지원사업 신청
  - 엔젤 투자자 컨택
  - AC 프로그램 지원
□ 개발 환경 세팅
  - GitHub Organization 생성
  - Slack 워크스페이스
  - Notion 워크스페이스
  - AWS 계정
```

#### Week 3-4: 기술 검증 + 설계

```
🔥 Critical
□ STT 파이프라인 Prototype
  - Whisper API 테스트 (한국어 정확도)
  - Deepgram 대안 테스트
  - Latency 측정
□ LLM Prompt 초기 버전
  - 질문 생성 Prompt v0.1
  - 테스트 케이스 10개
□ 개인화 알고리즘 설계
  - 선호도 점수 계산 로직
  - XP 계산 로직
  - 레벨업 조건
□ DB 스키마 확정
  - PostgreSQL 스키마 설계
  - Pinecone 인덱스 설계
  - Redis 캐싱 전략
□ Figma 와이어프레임
  - 대시보드
  - 회의 중 화면
  - 레벨업 UX
```

#### Week 5-8: MVP 개발 시작

```
🔥 Critical (개발팀 투입)
□ 회원가입/로그인
□ 온보딩 플로우 ("나만의 온노" 소개)
□ 새 회의 시작
□ 실시간 전사 (WebSocket)
□ 질문 제안 + 피드백 수집
□ 경험치 시스템
□ 레벨 표시 UI
□ Notion 연동
```

---

## 5. 기술 스택

### 5-1. 전체 아키텍처

```
┌─────────────────────────────────────────────────┐
│  Frontend (React + Vite)                        │
│  - WebSocket (실시간 전사)                       │
│  - WebRTC (오디오 캡처)                          │
└─────────────────────────────────────────────────┘
                      ↓ HTTPS/WSS
┌─────────────────────────────────────────────────┐
│  API Gateway (CloudFlare)                       │
└─────────────────────────────────────────────────┘
                      ↓
┌──────────────┬──────────────┬──────────────────┐
│ API Server   │ WebSocket    │ AI/ML Service    │
│ (Node.js)    │ (Socket.io)  │ (Python FastAPI) │
└──────────────┴──────────────┴──────────────────┘
                      ↓
┌──────────────┬──────────────┬──────────────────┐
│ PostgreSQL   │ Pinecone     │ Redis            │
│ (Primary DB) │ (Vector DB)  │ (Cache)          │
└──────────────┴──────────────┴──────────────────┘
```

### 5-2. 기술 스택 상세

#### Frontend
```
- React 18.3+
- Vite 5.0+
- TypeScript 5.0+
- Zustand (상태 관리)
- Tailwind CSS 3.4+
- Socket.io-client (WebSocket)
- WebRTC API (오디오 캡처)
```

#### Backend API
```
- Node.js 20+
- Express 4.18+
- Prisma 5.0+ (ORM)
- PostgreSQL 16+
- Redis 7.0+
- JWT (인증)
```

#### AI/ML Service
```
- Python 3.11+
- FastAPI 0.104+
- OpenAI API
  - GPT-4o (질문 생성)
  - Whisper (STT)
  - text-embedding-3-large
- Pinecone (Vector DB)
- LangChain (RAG)
```

#### Infrastructure
```
- Vercel (웹앱 배포)
- AWS
  - EC2 (API 서버)
  - RDS (PostgreSQL)
  - S3 (오디오 파일)
- CloudFlare (CDN, DDoS 방어)
- Stripe (결제)
```

#### DevOps
```
- GitHub Actions (CI/CD)
- Docker (컨테이너)
- Sentry (에러 트래킹)
- Datadog (모니터링)
```

### 5-3. 핵심 기술 결정

| 의사결정 | 선택 | 대안 | 이유 |
|---------|------|------|------|
| **STT** | OpenAI Whisper | Deepgram, Google STT | 한국어 정확도 95%+, 가격 |
| **LLM** | GPT-4o | Claude, Gemini | 한국어 품질, API 안정성 |
| **Vector DB** | Pinecone | Weaviate, Qdrant | 관리형 서비스, 확장성 |
| **ORM** | Prisma | TypeORM, Sequelize | TypeScript 통합, DX |
| **배포** | Vercel + AWS | All AWS, GCP | 프론트 최적화 + 백엔드 유연성 |

---

## 6. 팀 역할 및 온보딩

### 6-1. 현재 팀 구성 목표 (Month 1-3)

#### CEO/PM (1명) - 박준홍

**역할**:
- 제품 비전 및 전략
- 투자 유치
- 파트너십 (VC, AC)
- PRD 작성 및 업데이트
- KPI 관리

**필요 역량**:
- VC/스타트업 생태계 이해
- 제품 기획 경험
- B2B SaaS 경험

---

#### CTO/Full-stack (1명) - 채용 필요 🔥

**역할**:
- 시스템 아키텍처 설계
- 백엔드 개발 (Node.js + Express)
- 프론트엔드 개발 (React + Vite)
- DevOps (AWS, Docker, CI/CD)
- 기술 의사결정

**필요 역량**:
- Full-stack 개발 5년+ 경험
- B2B SaaS 아키텍처 설계 경험
- WebSocket, WebRTC 경험
- 스타트업 CTO 경험 우대

**온보딩 체크리스트**:
```
Week 1:
□ 프로젝트 문서 전체 읽기 (PRD 4부작)
□ 기술 스택 검토 및 피드백
□ 개발 환경 세팅
□ GitHub 코드 리뷰

Week 2:
□ 아키텍처 설계 리뷰
□ DB 스키마 확정
□ API 설계 확정
□ Week 5-8 개발 계획 수립

Week 3-4:
□ 기술 검증 (STT, LLM Prompt)
□ Prototype 개발
□ Frontend 엔지니어 채용 지원
```

---

#### AI/ML Engineer (1명) - 채용 필요 🔥

**역할**:
- 개인화 학습 알고리즘 설계
- LLM Prompt Engineering
- RAG 파이프라인 구축
- 질문 생성 모델 개발
- 벤치마크 DB 구축

**필요 역량**:
- ML/AI 개발 3년+ 경험
- LLM (GPT, Claude) 실전 경험
- RAG (Retrieval-Augmented Generation) 구현 경험
- Recommendation System 경험 우대
- Python FastAPI 개발 경험

**온보딩 체크리스트**:
```
Week 1:
□ 개인화 시스템 문서 읽기
□ 나만의 온노 시스템 상세 기획 읽기
□ 5가지 학습 신호 이해
□ 레벨 시스템 로직 검토

Week 2:
□ LLM Prompt v0.1 작성
□ 질문 생성 테스트 (10개 케이스)
□ 선호도 점수 계산 알고리즘 설계
□ XP 계산 로직 구현

Week 3-4:
□ RAG 파이프라인 Prototype
□ Pinecone 인덱스 설계
□ 개인화 학습 엔진 v0.1
```

---

### 6-2. 추후 채용 계획

#### Frontend Engineer (Month 4)

**역할**: React 컴포넌트, 레벨업 UX, 페르소나 UI

**필요 역량**: React 3년+, TypeScript, Tailwind CSS

---

#### Growth Marketer (Month 7)

**역할**: PLG 전략, 콘텐츠 마케팅, LinkedIn

**필요 역량**: B2B SaaS 마케팅 경험, VC/스타트업 네트워크

---

#### Customer Success (Month 7)

**역할**: 온보딩 지원, 피드백 수집, 리텐션 관리

**필요 역량**: B2B SaaS CS 경험, VC/AC 도메인 이해

---

## 7. 개발 시작 가이드

### 7-1. 로컬 환경 세팅 (개발자용)

#### 1. Repository Clone

```bash
git clone https://github.com/parkJH-0505/Onno.git
cd Onno
```

#### 2. Frontend 세팅

```bash
cd web
npm install
npm run dev

# http://localhost:5173 에서 확인
```

#### 3. Backend 세팅 (준비 중)

```bash
# 향후 추가 예정
cd api
npm install
cp .env.example .env
# .env 파일 수정 (DB, API Key 등)
npm run dev

# http://localhost:3000 에서 API 실행
```

#### 4. AI/ML 서비스 세팅 (준비 중)

```bash
# 향후 추가 예정
cd ml
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .env 파일 수정 (OpenAI API Key 등)
uvicorn main:app --reload

# http://localhost:8000 에서 ML API 실행
```

### 7-2. 개발 워크플로우

#### Branch 전략

```
main (프로덕션)
  ↑
develop (개발)
  ↑
feature/기능명 (기능 개발)
```

**예시**:
```bash
# 새 기능 개발 시작
git checkout develop
git pull
git checkout -b feature/question-generation

# 개발 완료 후
git add .
git commit -m "feat: Add question generation engine"
git push origin feature/question-generation

# PR 생성 → 코드 리뷰 → develop에 머지
```

#### Commit 메시지 규칙

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드, 설정 등
```

#### 코드 리뷰 프로세스

1. PR 생성
2. CTO 리뷰 (필수)
3. 다른 팀원 리뷰 (권장)
4. 승인 후 머지

### 7-3. 테스트 전략

#### Unit Test (단위 테스트)

```typescript
// 예시: 선호도 점수 계산 로직
describe('updatePreferenceScore', () => {
  it('사용한 질문은 +0.1', () => {
    const current = 0.5;
    const result = updatePreferenceScore(current, 'used');
    expect(result).toBe(0.6);
  });

  it('무시한 질문은 -0.05', () => {
    const current = 0.5;
    const result = updatePreferenceScore(current, 'ignored');
    expect(result).toBe(0.45);
  });
});
```

#### Integration Test (통합 테스트)

```typescript
// 예시: 회의 시작 → 전사 → 질문 제안 E2E
describe('Meeting Flow', () => {
  it('회의 시작부터 질문 제안까지', async () => {
    // 1. 회의 시작
    const meeting = await startMeeting({ title: 'Test Meeting' });

    // 2. 오디오 스트림
    await sendAudioChunk(meeting.id, audioData);

    // 3. 전사 확인
    const transcript = await getTranscript(meeting.id);
    expect(transcript).toContain('CAC는 $30입니다');

    // 4. 질문 제안 확인
    const questions = await getQuestions(meeting.id);
    expect(questions[0].text).toContain('LTV');
  });
});
```

---

## 8. 문서 구조

### 8-1. 전체 문서 맵

```
Onno/
├── PROJECT_GUIDE.md ⭐ (이 문서)
│   └── 프로젝트 전체 가이드 (누구나 이 문서부터 시작)
│
├── README.md
│   └── GitHub 프로젝트 소개 (간단 버전)
│
├── docs/
│   ├── README.md
│   │   └── 문서 구조 가이드
│   │
│   ├── Onno - PRD (Product Requirement Document).md
│   │   └── Part 1: 제품 전략 (Why)
│   │
│   ├── Onno - PRD Part 2 업데이트 (개인화 통합).md
│   │   └── Part 2: 기능 명세 (What)
│   │
│   ├── Onno - PRD Part 3 (기술 아키텍처).md
│   │   └── Part 3: 기술 아키텍처 (How)
│   │
│   ├── Onno - PRD Part 4 업데이트 (개인화 통합).md
│   │   └── Part 4: 마스터플랜 (When)
│   │
│   ├── Onno - User Flow 업데이트 (개인화 통합).md
│   │   └── 사용자 여정 및 UX 설계
│   │
│   ├── Onno - 나만의 온노 시스템 (개인화 상세 기획).md
│   │   └── 개인화 시스템 상세 스펙
│   │
│   ├── 정부지원사업 제안서.md
│   │   └── 정부지원사업 신청용
│   │
│   └── research/
│       └── 시장 조사 자료 (참고용)
│
├── web/
│   └── 웹 애플리케이션 (React + Vite)
│
├── api/ (준비 중)
│   └── API 서버 (Node.js + Express)
│
└── ml/ (준비 중)
    └── AI/ML 서비스 (Python + FastAPI)
```

### 8-2. 문서 읽기 순서 (역할별)

#### 신규 팀원 (모든 역할)

```
1. PROJECT_GUIDE.md ⭐ (이 문서)
   → 30분 안에 프로젝트 전체 이해

2. docs/README.md
   → 문서 구조 파악

3. Onno - PRD Part 1 (전략)
   → 왜 이걸 만드는가?

4. 역할별 추가 문서 (아래 참조)
```

#### 개발자 (CTO, Frontend, Backend)

```
5. Onno - PRD Part 2 (기능 명세)
   → 무엇을 만드는가?

6. Onno - PRD Part 3 (기술 아키텍처)
   → 어떻게 만드는가?

7. Onno - User Flow (UX 설계)
   → 사용자 관점에서 어떻게 동작하는가?
```

#### AI/ML 엔지니어

```
5. Onno - 나만의 온노 시스템 (개인화 상세 기획)
   → 개인화 알고리즘 상세

6. Onno - PRD Part 2 (FR-003)
   → 개인화 기능 요구사항

7. Onno - PRD Part 4 (마스터플랜)
   → 개발 우선순위
```

#### 디자이너

```
5. Onno - User Flow (UX 설계)
   → 화면별 상세 설계

6. Onno - PRD Part 2 (기능 명세)
   → UI 요구사항

7. Onno - 나만의 온노 시스템
   → 개인화 UX 컨셉
```

#### PM / Growth

```
5. Onno - PRD Part 4 (마스터플랜)
   → 실행 계획 및 KPI

6. Onno - PRD Part 1 (전략)
   → 시장 기회, 경쟁 분석

7. 정부지원사업 제안서
   → 대외 커뮤니케이션
```

---

## 9. FAQ

### 9-1. 제품 관련

**Q: Onno와 Fireflies/Otter의 차이는?**

A: 시점과 가치 제안이 다릅니다.

- **Fireflies/Otter**: 회의 **후** 요약 (After-the-fact)
  - 가치: 기록 (System of Record)
  - 문제: 회의 끝난 후엔 손 쓸 수 없음

- **Onno**: 회의 **중** 질문 제안 (During-the-fact)
  - 가치: 실행·의사결정 지원 (System of Action)
  - 효과: 회의 진행 중 문제 발견·해결

---

**Q: MS Teams Copilot이 무료로 제공하면 경쟁이 안 되는 거 아닌가?**

A: 3가지 차별화로 Sherlocking 방어합니다.

1. **시점**: MS는 After (회의 후 요약), Onno는 During (회의 중 질문)
2. **깊이**: MS는 범용, Onno는 도메인 특화 (VC/컨설팅/세일즈)
3. **개인화**: MS는 모든 사용자 동일, Onno는 사용할수록 성장 (데이터 모트)

---

**Q: 개인화가 정말 차별화 포인트가 되나?**

A: 네, 3개월 사용 데이터가 **전환 장벽**이 됩니다.

- 3개월 = 50+ 회의 학습
- 타 서비스 전환 시 모든 학습 리셋
- Lv.4 사용자가 Lv.1로 돌아가기 싫어함
- 결과: Lv.3+ LTV $600 (Lv.1 $400 대비 +50%)

---

### 9-2. 기술 관련

**Q: STT 정확도 95%는 현실적인가?**

A: 네, OpenAI Whisper로 달성 가능합니다.

- Whisper Large-v3: 한국어 정확도 95%+ (벤치마크)
- 우리 테스트: 비즈니스 회의 맥락에서 95%+ 확인
- 대안: Deepgram (실시간 스트리밍 특화)

---

**Q: 실시간 질문 제안 Latency <2초는 어떻게?**

A: 3단계 최적화로 달성합니다.

1. **STT**: Whisper API 또는 Deepgram (스트리밍)
2. **질문 생성**: GPT-4o + 프롬프트 캐싱
3. **인프라**: WebSocket + Redis 캐싱

예상 Latency:
- STT: 0.5-1초
- LLM: 0.5-1초
- Total: 1-2초

---

**Q: 개인화 알고리즘이 복잡해 보이는데 MVP에서 가능한가?**

A: Phase별로 단계적으로 구현합니다.

- **Phase 1 (MVP)**: 기본 학습만 (질문 피드백 수집)
- **Phase 2**: Lv.2 개인화 (선호도 반영)
- **Phase 3**: Lv.3-4 고급 기능
- **Phase 4-5**: Lv.5 마스터 기능

초기엔 간단한 선호도 점수 계산 (Rule-based)으로 시작합니다.

---

### 9-3. 비즈니스 관련

**Q: 타겟 시장이 너무 작은 거 아닌가? (한국 VC ~200명)**

A: Wedge 전략입니다. 작지만 확산력이 높은 시장부터 시작합니다.

1. **1차** (Year 1): VC/AC (~250명) → 네트워크 촘촘, 빠른 확산
2. **2차** (Year 2): Professional Services (~95,000명) → 컨설팅, 세일즈
3. **3차** (Year 3+): 글로벌 확장 → 미국 VC, 아시아

Year 3 목표: 4,500명 (충분히 큰 시장)

---

**Q: 유료 전환율 30%는 현실적인가?**

A: B2B SaaS Freemium 평균은 2-5%이지만, 우리는 다릅니다.

**근거**:
1. **명확한 ROI**: 재회의 1번 방지 = $600 절감 > $20/month
2. **Freemium 제약**: 월 5회 제한 → 주 1회 회의 직군은 부족함
3. **개인화 Lock-in**: Lv.2 달성 시 전환율 높음
4. **벤치마크**: Superhuman (프리미엄 이메일) 전환율 ~40%

보수적 목표: 20% (우리는 30% 목표)

---

**Q: Pre-seed $170K로 6개월 버틸 수 있나?**

A: 네, Lean 운영으로 가능합니다.

**Burn Rate**:
- 인건비: $10K/month (3명)
- 인프라: $2K/month
- 마케팅: $3K/month
- 기타: $2K/month
- **Total**: $17K/month

**Runway**:
- $170K ÷ $17K/month = **10개월**
- 6개월 목표 + 4개월 버퍼

---

### 9-4. 팀 관련

**Q: 3명으로 MVP 개발이 가능한가?**

A: 네, 역할 분담과 외주 활용으로 가능합니다.

**팀**:
- CEO/PM: 제품 기획, 투자 유치
- CTO: 백엔드 + 프론트 (간단한 UI)
- ML Engineer: 개인화 + LLM

**외주/도구 활용**:
- UI 디자인: Figma 템플릿 + Tailwind CSS
- 인프라: Vercel (프론트), AWS (백엔드) → 관리 최소화
- STT/LLM: OpenAI API (직접 개발 불필요)

Phase 2 (Month 3-4)부터 Frontend 엔지니어 채용

---

**Q: AI/ML Engineer를 왜 처음부터 Full-time으로?**

A: 개인화가 **핵심 차별화 포인트**이기 때문입니다.

- 개인화 없으면 → 범용 회의 솔루션 (MS/Zoom과 경쟁)
- 개인화 있으면 → 유일무이한 가치 (데이터 모트)

따라서 ML Engineer는 **절대 Part-time 불가**, Month 1부터 Full-time 필수

---

## 10. 다음 액션 (Next Actions)

### 10-1. 지금 당장 해야 할 일 (Week 1-2)

```
🔥 Priority 1: 팀 구성
□ CTO/Full-stack 채용
  - 채용 공고 작성
  - LinkedIn, 원티드, 로켓펀치 게시
  - 네트워크 통해 추천 요청

□ AI/ML Engineer 채용
  - 채용 공고 작성
  - AI 커뮤니티 게시 (Reddit, Discord)
  - 대학원 네트워크 활용

□ Co-founder 가능성 탐색
  - CTO 역할 Co-founder로 영입
  - Equity 협상

🔥 Priority 2: 자금 조달
□ 정부지원사업 신청
  - K-Startup, TIPS, 예비창업패키지
  - 제안서 제출

□ 엔젤 투자자 컨택
  - 피칭 덱 준비
  - 5명 컨택

□ AC 프로그램 지원
  - SparkLabs, 퓨처플레이, 매쉬업엔젤스
```

### 10-2. 다음 단계 (Week 3-4)

```
□ 기술 검증
  - STT Prototype
  - LLM Prompt v0.1
  - 개인화 알고리즘 설계

□ 설계 확정
  - DB 스키마
  - API 설계
  - Figma 와이어프레임
```

### 10-3. MVP 개발 (Week 5-8)

```
□ Phase 1 기능 개발
  - 회원가입/로그인
  - 실시간 전사
  - 질문 제안 v0.1
  - Notion 연동
  - 개인화 Lv.1
```

---

## 📞 문의 및 지원

### 연락처

- **PM/CEO**: 박준홍
- **Email**: pocket.bjh@gmail.com
- **GitHub**: https://github.com/parkJH-0505/Onno

### 리소스

- **GitHub Repository**: https://github.com/parkJH-0505/Onno
- **문서 위치**: `/docs`
- **Vercel 배포**: (TBD)

---

## 📝 문서 업데이트 히스토리

- **2025-12-02**: 초안 작성 (프로젝트 가이드 v1.0)
  - 전체 프로젝트 개요
  - 개발 로드맵 (18개월)
  - 팀 구성 및 온보딩
  - 개발 시작 가이드
  - FAQ

---

**이 문서는 Onno 프로젝트의 중심 가이드입니다.**
**모든 팀원은 이 문서를 읽고 시작하세요!**

🚀 **Let's build Onno!**
