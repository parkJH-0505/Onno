# Onno: Real-time Decision Intelligence for Investment Professionals
## 프로젝트 정의 및 문제 도출 보고서

**작성일:** 2025-12-01
**작성자:** Onno Strategic Planning Team

---

## 1. 프로젝트 개요

**Onno**는 회의 후 단순 요약(After-the-fact)을 넘어, **회의 도중(During-the-fact)** 실시간으로 개입하여 의사결정의 질을 높이는 **B2B Vertical AI Agent**입니다.

*   **핵심 가치:** Real-time Decision Intelligence & Workflow Layer
*   **타겟 고객:** VC(벤처캐피탈), AC(액셀러레이터), Company Builder(벤처스튜디오) 등 "질문과 대화가 성과로 직결되는" 전문가 그룹
*   **차별점:**
    *   **Coaching:** 실시간 질문 추천 및 리스크 감지
    *   **Augmentation:** 도메인 지식 및 맥락 실시간 제공
    *   **Action:** 대화 내용을 CRM 및 워크플로우 툴(SaaS)에 즉시 연동

---

## 2. 타겟 페르소나 및 Pain Point 분석

### A. VC 심사역 (Venture Capitalist)
*   **역할:** 유망 스타트업 발굴 및 투자 심사, 펀드 관리
*   **상황:** 하루 5~6개의 이종 도메인 미팅, 깊이 있는 기술 검증 필요
*   **Key Pain Points:**
    *   **Context Switching:** 다양한 산업군을 넘나들며 발생하는 인지 부하로 인해 핵심 질문을 놓침.
    *   **전문성 공백:** 낯선 기술/분야 미팅 시 깊이 있는 검증(Unit Economics, Tech Stack 등) 실패.
    *   **Admin Fatigue:** 미팅 후 CRM/투자심의보고서 작성을 위한 단순 데이터 입력 반복.

### B. AC 매니저 (Accelerator Manager)
*   **역할:** 초기 스타트업 선발(Batch), 보육, 멘토링
*   **상황:** 단기간에 대량의 팀 스크리닝, 반복적인 멘토링 수행
*   **Key Pain Points:**
    *   **Volume Overload:** 하루 10개 이상의 팀을 만나며 기억이 혼재됨(Who is who?).
    *   **Zero-Data Dilemma:** 지표가 없는 초기 팀을 검증할 정교한 질문 프레임 부재.
    *   **Follow-up 누락:** 멘토링 시 약속한 액션 아이템이나 과제 확인을 놓침.

### C. 컴퍼니빌더 PO (Company Builder / Venture Studio)
*   **역할:** 내부 아이디어 검증, 스핀오프, 팀 빌딩(채용)
*   **상황:** 내부 팀원 간의 아이디어 회의, 채용 면접, 주주 보고
*   **Key Pain Points:**
    *   **Echo Chamber:** 내부 인원끼리의 회의에서 발생하는 확증 편향(Groupthink).
    *   **Hiring Risk:** 면접 시 지원자의 역량/핏을 검증할 꼬리 질문(Deep Dive) 실패.
    *   **Knowledge Leak:** 실패한 프로젝트의 교훈과 데이터가 자산화되지 않고 증발.

---

## 3. 핵심 문제 정의 (Core Problems)

단순한 불편함이 아닌, **'Alpha(초과 수익)' 창출을 저해하는 구조적 병목** 3가지

### 1) 인지 대역폭의 초과 (Cognitive Bandwidth Overload)
*   **"듣는 동시에 생각하고, 기억하고, 판단할 수 없다."**
*   인간의 작업 기억(Working Memory) 한계로 인해 기록(Typing)과 사고(Thinking)가 양립 불가.
*   **결과:** 영혼 없는 리팅, 비언어적 신호(Non-verbal Signal) 포착 실패.

### 2) 실시간 전문성의 부재 (The "Right Now" Gap)
*   **"가장 중요한 질문은 항상 미팅이 끝난 뒤에 떠오른다."**
*   미팅 현장에서 즉각적으로 리스크를 짚어주거나, 모르는 도메인을 설명해줄 전문가(Co-pilot)의 부재.
*   **결과:** 검증되지 않은 리스크를 안고 투자 집행(False Positive) 또는 좋은 딜 놓침(Missed Alpha).

### 3) 대화와 워크플로우의 단절 (The Data Silo)
*   **"미팅은 휘발되고, 데이터는 쌓이지 않는다."**
*   비정형 데이터(대화)를 정형 데이터(CRM, 보고서)로 변환하는 과정에서의 막대한 비효율과 정보 누락.
*   **결과:** 조직 전체의 학습 속도 저하, 고연봉 인력의 행정 업무 낭비.

---

## 4. Onno 솔루션 방향성

**"요약(Summary)"이 아닌 "증강(Augmentation)과 연결(Bridge)"**

1.  **Cognitive Augmentation (인지 증강):**
    *   사용자의 뇌를 대신해 맥락을 기억하고, 실시간으로 필요한 정보를 팝업.
2.  **Real-time Navigation (실시간 항해):**
    *   도메인 특화 질문 추천, 리스크 알림을 통해 전문가 수준의 인터뷰 유도.
3.  **Workflow Bridge (워크플로우 연결):**
    *   대화 중 발생한 데이터를 CRM, PM 툴, 문서에 자동으로 구조화하여 입력.
