# Onno: Product Requirement Document (PRD)
## Real-time Decision Intelligence & Workflow Agent for Investment Professionals

**Version:** 1.0.0
**Date:** 2025-12-01
**Status:** Draft

---

## 1. Product Overview (제품 개요)

### 1.1 Definition
**Onno(온노)**는 고관여 비즈니스 미팅(VC 투자 심사, 스타트업 멘토링, 채용 면접 등)에서 **실시간으로 질문과 인사이트를 제공**하고, 대화 결과를 **기존 업무 시스템(CRM, 문서, 메일)과 자동으로 연결**해주는 **B2B Vertical AI Agent**입니다.

### 1.2 Core Value Proposition
*   **From Recording to Navigating:** 단순 기록(Recording)이 아닌, 대화의 방향을 잡는 항해(Navigation) 도구.
*   **From Admin to Action:** 행정 업무(Admin)를 자동화하고, 즉각적인 실행(Action)으로 연결.
*   **From Tool to Partner:** 사용자와 함께 성장하며 도메인 지식을 축적하는 나만의 AI 파트너.

### 1.3 Target Audience
*   **Primary:** VC/PE 심사역, AC 매니저, 팁스 운영사 (질문의 질 = 딜 퀄리티)
*   **Secondary:** 컴퍼니빌더 PO, 엔터프라이즈 세일즈, 전문 컨설턴트

---

## 2. Product Architecture (제품 구조)

Onno는 **"Dual Interface Strategy"**를 채택하여, 미팅 현장과 업무 관리 환경을 분리하면서도 유기적으로 연결합니다.

### 2.1 The Floating Companion (현장용 HUD)
*   **형태:** PC 화면 최상단에 뜨는 투명/반투명 플로팅 위젯 (Always On Top).
*   **역할:** 미팅 도중(During-the-fact)의 실시간 인텔리전스 제공.
*   **핵심 UX:**
    *   **Ghost Mode:** 평상시에는 방해되지 않는 작은 Orb 형태.
    *   **Active Mode:** 대화 감지 시 카드 형태로 확장되어 정보 제공.

### 2.2 The Command Center (관리용 대시보드)
*   **형태:** 웹/데스크탑 기반의 메인 애플리케이션.
*   **역할:** 미팅 전(Pre) 준비, 후(Post) 분석, 데이터 관리 및 설정.
*   **핵심 UX:**
    *   **Deal Pipeline:** 미팅 결과가 반영된 딜 진행 현황 시각화.
    *   **Knowledge Base:** 조직별 질문 템플릿, 금기어, 연동 설정.

---

## 3. Key Features (핵심 기능 상세)

### 3.1 Real-time Question Radar (실시간 질문 레이더)
*   **기능:** 대화 맥락을 실시간 분석하여, 현재 단계(검증/협상/탐색)에 맞는 최적의 질문 추천.
*   **Logic:**
    *   **Risk Detection:** "경쟁사 언급 회피" 감지 시 -> *"경쟁사 A 대비 구체적인 차별점 질문 필요"* 알림.
    *   **Fact Check:** "매출 2배 성장" 발언 시 -> *"전년 동기 대비(YoY)인지, 전분기 대비(QoQ)인지 확인 필요"* 팁 제공.
*   **User Value:** 주니어 심사역도 시니어급의 날카로운 검증 가능.

### 3.2 Domain Knowledge Augmentation (도메인 지식 증강)
*   **기능:** 대화 중 등장하는 전문 용어, 기술 스택, 시장 데이터를 실시간 팝업 설명.
*   **Logic:**
    *   **Entity Linking:** "RAG 파이프라인" 감지 -> *"RAG: 검색 증강 생성. LLM의 환각을 줄이는 기술. 주요 구성 요소는 Vector DB 등."*
*   **User Value:** 모르는 분야의 미팅에서도 전문성 유지 및 주도권 확보.

### 3.3 Workflow Bridge (워크플로우 브리지)
*   **기능:** 대화 내용을 구조화된 데이터로 변환하여 외부 툴(CRM, Notion, Slack)로 즉시 전송.
*   **Logic:**
    *   **Auto-Filling:** 미팅 종료 시 CRM 필드(기업명, 대표자, 투자단계, 매출)에 맞게 데이터 자동 매핑.
    *   **Action Trigger:** "다음 주 자료 송부" 발언 감지 -> 캘린더 일정 등록 및 이메일 초안 생성.
*   **User Value:** 미팅 후 행정 업무 시간 90% 단축.

### 3.4 Personalized Growth System (성장형 페르소나)
*   **기능:** 사용자의 피드백과 데이터를 학습하여 진화하는 AI 파트너.
*   **Logic:**
    *   **Level-up:** 사용 빈도와 피드백에 따라 특정 도메인(예: 바이오, SaaS) 레벨 상승.
    *   **Persona Selection:** 상황에 따라 '냉철한 분석가(Analyst)', '창의적 조력자(Visionary)' 등 페르소나 변경.
*   **User Value:** 단순 툴이 아닌 '나만의 비서'를 키우는 재미와 Lock-in 효과.

---

## 4. User Journey (사용자 시나리오)

### Scenario: VC 심사역의 시리즈 A 스타트업 미팅

1.  **Pre-Meeting (준비):**
    *   대시보드에서 오늘 미팅할 기업의 **[Pre-Briefing]** 확인. (지난 미팅 핵심 이슈, 오늘 확인해야 할 지표 리마인드)
2.  **In-Meeting (진행):**
    *   Zoom 실행 시 **[Floating Companion]** 자동 활성화.
    *   창업자의 "유저 10만 명 달성" 발언에 Onno가 **[검증]** 카드 제시: *"MAU(월 활성 사용자) 기준인지, 누적 가입자 기준인지 질문하세요."*
    *   심사역이 질문을 클릭하면, 해당 질문은 '검증 완료'로 태깅됨.
3.  **Post-Meeting (정리):**
    *   미팅 종료 후 **[Summary & Action]** 패널 팝업.
    *   추출된 핵심 데이터(매출, 투자금, 리스크) 확인 후 **[Sync to CRM]** 버튼 클릭.
    *   **[Draft Email]** 버튼을 눌러 "자료 요청 메일" 발송 후 퇴근.

---

## 5. Technology Stack & Feasibility

*   **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn/UI (대시보드), Electron (플로팅 앱)
*   **AI Engine:**
    *   **STT:** Real-time Streaming API (Deepgram or Whisper Turbo)
    *   **LLM:** GPT-4o or Claude 3.5 Sonnet (Context Analysis & Reasoning)
    *   **Vector DB:** Pinecone (Domain Knowledge Retrieval)
*   **Integration:** OAuth 2.0 (Google, Slack, Notion, Salesforce)

---

## 6. Roadmap (개발 로드맵)

*   **Phase 1 (MVP):** 핵심 기능 구현 (실시간 STT, 기본 질문 추천, 대시보드 뷰)
*   **Phase 2 (Integration):** 주요 툴 연동 (Notion, Slack, Google Calendar)
*   **Phase 3 (Personalization):** 사용자 피드백 루프 및 페르소나 시스템 도입
*   **Phase 4 (Enterprise):** 사내 구축형(On-premise) 및 보안 강화 버전 출시
