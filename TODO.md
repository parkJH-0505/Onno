# Onno 개발 TODO

**최종 업데이트**: 2025-12-02
**현재 Phase**: Phase 0 완료 → Phase 1 준비

---

## 🎯 현재 우선순위 (Top 3)

```
1️⃣ 팀 구성 (CTO, ML Engineer 채용)
2️⃣ 자금 조달 (Pre-seed $170K)
3️⃣ 기술 검증 (STT, LLM Prompt)
```

---

## 📅 Week 1-2: 팀 구성 + 자금 조달

### 🔥 Critical (필수)

#### 팀 구성

- [ ] **CTO/Full-stack 채용**
  - [ ] 채용 공고 작성
    - 요구사항: Full-stack 5년+, WebSocket/WebRTC 경험, 스타트업 경험
    - 제안: Equity 10-15% + 초기 급여
  - [ ] 채용 플랫폼 게시
    - [ ] LinkedIn 게시
    - [ ] 원티드 게시
    - [ ] 로켓펀치 게시
    - [ ] Wanted, Jumpit 게시
  - [ ] 네트워크 활용
    - [ ] 지인 추천 요청 (5명 이상)
    - [ ] 스타트업 커뮤니티 게시 (slack, discord)
  - [ ] 1차 면접 (화상)
    - 질문: 기술 스택 경험, 스타트업 fit, 비전 공감
  - [ ] 2차 면접 (코딩 테스트)
    - 과제: 간단한 WebSocket 채팅 앱
  - [ ] 최종 결정 및 Offer

- [ ] **AI/ML Engineer 채용**
  - [ ] 채용 공고 작성
    - 요구사항: ML/AI 3년+, LLM 실전 경험, RAG 경험, Python FastAPI
    - 제안: Equity 5-10% + 초기 급여
  - [ ] 채용 플랫폼 게시
    - [ ] LinkedIn (AI/ML 그룹)
    - [ ] Reddit (r/MachineLearning)
    - [ ] Discord (AI 커뮤니티)
  - [ ] 대학원 네트워크
    - [ ] AI 대학원 (카이스트, 서울대 등) 게시판
    - [ ] 교수님께 추천 요청
  - [ ] 1차 면접
    - 질문: LLM 프로젝트 경험, Recommendation System 경험
  - [ ] 2차 면접 (기술 과제)
    - 과제: 간단한 LLM Prompt Engineering 또는 RAG 구현
  - [ ] 최종 결정 및 Offer

- [ ] **Co-founder 가능성 탐색**
  - [ ] CTO 역할을 Co-founder로 영입 검토
  - [ ] Equity 분배 협상 (20-30%)
  - [ ] 역할 및 책임 명확화

#### 자금 조달

- [ ] **정부지원사업 신청**
  - [ ] K-Startup 신청
    - [ ] 사업계획서 제출 (정부지원사업 제안서 활용)
    - [ ] 발표 자료 준비
  - [ ] TIPS 프로그램 신청
    - [ ] 추천 기업 확보 (AC, VC)
    - [ ] 사업계획서 제출
  - [ ] 예비창업패키지 신청
    - [ ] 지역별 공고 확인
    - [ ] 사업계획서 제출
  - [ ] 기타 정부지원사업 탐색
    - [ ] 창업도약패키지
    - [ ] 초기창업패키지

- [ ] **엔젤 투자자 컨택**
  - [ ] 피칭 덱 준비
    - [ ] 10-15 슬라이드
    - [ ] 핵심: During-the-fact, 개인화, 시장 기회
  - [ ] 타겟 투자자 리스트 (10명)
    - [ ] VC/스타트업 경험 투자자
    - [ ] B2B SaaS 투자 경험 투자자
    - [ ] AI/ML 관심 투자자
  - [ ] 1차 컨택 (5명)
    - [ ] 이메일 또는 LinkedIn 메시지
    - [ ] 간단한 소개 + 피칭 덱 첨부
  - [ ] 미팅 일정 조율
  - [ ] 피칭 미팅 (3-5명 목표)

- [ ] **AC 프로그램 지원**
  - [ ] SparkLabs 지원
  - [ ] 퓨처플레이 지원
  - [ ] 매쉬업엔젤스 지원
  - [ ] D.CAMP 지원
  - [ ] 기타 AC 탐색 (500 Startups Korea 등)

#### 개발 환경 세팅

- [ ] **GitHub Organization 생성**
  - [ ] Organization 생성: "Onno-AI" 또는 "OnnoHQ"
  - [ ] Repository 이전 (개인 → Organization)
  - [ ] 팀원 초대 (채용 완료 시)

- [ ] **협업 도구 세팅**
  - [ ] Slack 워크스페이스 생성
    - [ ] 채널 생성: #general, #dev, #product, #design
  - [ ] Notion 워크스페이스 생성
    - [ ] 프로젝트 관리 페이지
    - [ ] 개발 문서 페이지
    - [ ] 회의록 페이지
  - [ ] Figma 팀 생성
    - [ ] 와이어프레임 프로젝트
  - [ ] Linear 또는 Jira 세팅 (이슈 트래킹)

- [ ] **인프라 계정 생성**
  - [ ] AWS 계정
    - [ ] Organization 계정 (billing)
    - [ ] IAM 사용자 생성 (팀원별)
  - [ ] OpenAI API 계정
    - [ ] API Key 발급
    - [ ] Billing 설정 ($100 크레딧)
  - [ ] Pinecone 계정
    - [ ] Free Tier 시작
  - [ ] Vercel 계정
    - [ ] Team 플랜 (필요 시)
  - [ ] Stripe 계정
    - [ ] Test mode 세팅

---

## 📅 Week 3-4: 기술 검증 + 설계 확정

### 🔥 Critical (필수)

#### 기술 검증

- [ ] **STT 파이프라인 Prototype**
  - [ ] OpenAI Whisper API 테스트
    - [ ] 한국어 비즈니스 회의 샘플 5개 전사
    - [ ] 정확도 측정 (목표: 95%+)
    - [ ] Latency 측정 (목표: <2초)
  - [ ] Deepgram API 테스트 (대안)
    - [ ] 실시간 스트리밍 테스트
    - [ ] 정확도 비교
    - [ ] 가격 비교
  - [ ] 최종 STT 선택 결정
  - [ ] 간단한 Prototype 코드 작성
    ```python
    # prototype/stt_test.py
    # Whisper API 호출 → 전사 → 정확도 측정
    ```

- [ ] **LLM Prompt 초기 버전**
  - [ ] 질문 생성 Prompt v0.1 작성
    ```
    System: 당신은 VC 투자 심사 전문가입니다...
    User: [대화 전사] + [체크리스트]
    Assistant: [질문 3개 생성]
    ```
  - [ ] 테스트 케이스 10개 준비
    - 시나리오 1: CAC 언급, LTV 미언급
    - 시나리오 2: MRR 언급, Churn Rate 미언급
    - ... (10개)
  - [ ] GPT-4o로 테스트
    - [ ] 질문 품질 평가 (주관적)
    - [ ] 응답 시간 측정
  - [ ] Prompt 개선 (v0.2)

- [ ] **개인화 알고리즘 설계**
  - [ ] 선호도 점수 계산 로직 설계
    ```python
    def update_preference_score(current, action):
        if action == 'used':
            return min(current + 0.1, 1.0)
        elif action == 'ignored':
            return max(current - 0.05, 0.0)
    ```
  - [ ] XP 계산 로직 설계
    ```python
    def calculate_xp(meeting):
        base_xp = 10
        question_used_xp = len(meeting.questions_used) * 2
        action_item_xp = len(meeting.action_items) * 5
        return base_xp + question_used_xp + action_item_xp
    ```
  - [ ] 레벨업 조건 확정
    - Lv.1 → Lv.2: 100 XP (~5회)
    - Lv.2 → Lv.3: 300 XP (~15회)
    - ...
  - [ ] 간단한 Prototype 코드

#### 설계 확정

- [ ] **DB 스키마 확정**
  - [ ] PostgreSQL 스키마 설계
    - [ ] `users` 테이블
    - [ ] `user_domains` 테이블 (레벨 관리)
    - [ ] `meetings` 테이블
    - [ ] `ai_questions` 테이블
    - [ ] `question_feedback_log` 테이블
    - [ ] `user_question_preferences` 테이블
    - [ ] ... (전체 15개 테이블)
  - [ ] Pinecone 인덱스 설계
    - 차원: 3072 (text-embedding-3-large)
    - 메타데이터: user_id, meeting_id, created_at
  - [ ] Redis 캐싱 전략
    - 사용자 세션
    - LLM 응답 캐싱
  - [ ] ERD 다이어그램 작성 (draw.io 또는 Figma)

- [ ] **API 설계 확정**
  - [ ] RESTful API 엔드포인트 정의
    ```
    POST /api/auth/signup
    POST /api/auth/login
    GET  /api/users/:id
    POST /api/meetings
    GET  /api/meetings/:id
    POST /api/meetings/:id/complete
    POST /api/questions/:id/feedback
    GET  /api/users/:id/domains
    ...
    ```
  - [ ] WebSocket 이벤트 정의
    ```
    Client → Server:
    - audio_chunk
    - meeting_start
    - meeting_end

    Server → Client:
    - transcription
    - question_suggestion
    - insight
    ```
  - [ ] API 문서 초안 (Swagger/OpenAPI)

- [ ] **Figma 와이어프레임**
  - [ ] 화면 목록 작성
    1. 로그인/회원가입
    2. 온보딩 ("나만의 온노" 소개)
    3. 대시보드
    4. 새 회의 시작
    5. 회의 중 화면 (실시간 전사 + AI 제안)
    6. 회의 상세
    7. 인사이트 페이지
    8. 설정
  - [ ] 와이어프레임 작성
    - [ ] Lo-fi (저해상도, 빠르게)
    - [ ] 주요 화면 3개: 대시보드, 회의 중, 레벨업
  - [ ] 레벨업 애니메이션 컨셉
  - [ ] 페르소나 아이콘 디자인 (4개)

---

## 📅 Week 5-8: MVP 개발 시작

### 🔥 Critical (개발팀 투입)

**전제**: CTO, ML Engineer 채용 완료

#### Backend 기초

- [ ] **프로젝트 세팅**
  - [ ] `api/` 폴더 생성
  - [ ] Node.js + Express 초기 설정
    ```bash
    npm init -y
    npm install express prisma @prisma/client bcrypt jsonwebtoken
    npm install -D typescript @types/node @types/express ts-node nodemon
    ```
  - [ ] TypeScript 설정 (`tsconfig.json`)
  - [ ] ESLint + Prettier 설정
  - [ ] Folder 구조
    ```
    api/
    ├── src/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── middleware/
    │   ├── utils/
    │   └── index.ts
    ├── prisma/
    │   └── schema.prisma
    └── package.json
    ```

- [ ] **Database 세팅**
  - [ ] Prisma 스키마 작성 (`prisma/schema.prisma`)
  - [ ] PostgreSQL 로컬 설치 또는 Supabase 사용
  - [ ] Prisma migration
    ```bash
    npx prisma migrate dev --name init
    ```
  - [ ] Seed 데이터 작성 (테스트용 사용자, 회의)

- [ ] **회원가입/로그인 API**
  - [ ] `POST /api/auth/signup`
    - 이메일 중복 검증
    - 비밀번호 해싱 (bcrypt)
    - JWT 토큰 발급
  - [ ] `POST /api/auth/login`
    - 이메일/비밀번호 검증
    - JWT 토큰 발급
  - [ ] `GET /api/users/:id`
    - JWT 인증 미들웨어
    - 사용자 정보 반환
  - [ ] Unit Test 작성

#### Frontend 기초

- [ ] **회원가입/로그인 UI**
  - [ ] `/signup` 페이지
    - 이메일, 비밀번호 입력
    - Form validation
    - API 호출
  - [ ] `/login` 페이지
    - 이메일, 비밀번호 입력
    - API 호출
    - JWT 토큰 저장 (localStorage)
  - [ ] Zustand 상태 관리 세팅
    ```typescript
    // store/authStore.ts
    interface AuthState {
      user: User | null;
      token: string | null;
      login: (email, password) => void;
      logout: () => void;
    }
    ```

- [ ] **온보딩 플로우**
  - [ ] `/onboarding` 페이지
    - Step 1: 프로필 설정 (이름, 직책, 소속)
    - Step 2: 관심 도메인 선택
    - Step 3: "나만의 온노" 소개
    - Step 4: 샘플 회의 체험 (선택)
  - [ ] API 호출: `PATCH /api/users/:id/profile`
  - [ ] 완료 후 대시보드로 이동

- [ ] **대시보드 기본**
  - [ ] `/dashboard` 페이지
    - 인사말 + 레벨 표시 (Lv.1 고정)
    - "새 회의 시작" 버튼
    - 최근 회의 리스트 (빈 상태)
  - [ ] 레벨 UI 컴포넌트
    ```tsx
    <LevelBadge level={1} xp={0} nextLevelXp={100} />
    ```

#### 회의 플로우 (핵심)

- [ ] **새 회의 시작 API**
  - [ ] `POST /api/meetings`
    - 회의 제목, 유형, 참석자 입력
    - Meeting 레코드 생성
    - WebSocket URL 반환
  - [ ] 테스트

- [ ] **실시간 전사 (WebSocket)**
  - [ ] WebSocket 서버 세팅 (Socket.io)
    ```typescript
    // api/src/websocket.ts
    io.on('connection', (socket) => {
      socket.on('audio_chunk', async (data) => {
        // Whisper API 호출
        const transcript = await transcribe(data.audio);
        socket.emit('transcription', transcript);
      });
    });
    ```
  - [ ] Frontend WebRTC 오디오 캡처
    ```typescript
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // AudioContext로 오디오 스트림 처리
        // WebSocket으로 전송
      });
    ```
  - [ ] Whisper API 연동
  - [ ] 테스트 (실제 음성 입력)

- [ ] **회의 중 화면**
  - [ ] `/meeting/:id` 페이지
    - 좌측: 실시간 전사 표시
    - 우측: AI 제안 패널 (일단 비어있음)
    - 하단: 타이머, 일시정지, 종료 버튼
  - [ ] WebSocket 연결 및 실시간 업데이트

#### 개인화 Lv.1 (기본 학습)

- [ ] **질문 제안 v0.1**
  - [ ] AI/ML 서비스 세팅
    ```bash
    cd ml
    python -m venv venv
    source venv/bin/activate
    pip install fastapi uvicorn openai pinecone-client
    ```
  - [ ] `POST /ml/questions/generate` API
    ```python
    @app.post("/questions/generate")
    async def generate_questions(transcript: str, checklist: list):
        # LLM Prompt로 질문 생성
        questions = await openai_generate(transcript, checklist)
        return questions
    ```
  - [ ] Frontend에서 질문 표시
    - 우측 패널에 질문 3개 표시
    - 우선순위 라벨 (Critical, Important)
    - [사용하기] [무시] 버튼

- [ ] **질문 피드백 수집**
  - [ ] `POST /api/questions/:id/feedback` API
    - action: 'used', 'ignored', 'dismissed'
    - modified_text (수정한 경우)
  - [ ] `question_feedback_log` 테이블에 저장
  - [ ] Frontend 연동

- [ ] **경험치 시스템**
  - [ ] `POST /api/meetings/:id/complete` API
    - 경험치 계산 (기본 + 질문 사용 + 액션)
    - `user_domains` 업데이트
    - 레벨업 체크
  - [ ] 회의 종료 시 경험치 획득 화면
    ```
    🎉 경험치 획득!
    +25 XP

    투자 심사 Lv.1
    ████░░░░░░░░░░░░ 25/100
    ```

#### Notion 연동

- [ ] **Notion OAuth**
  - [ ] Notion Integration 생성
  - [ ] OAuth flow 구현
    - `GET /api/integrations/notion/auth` (리다이렉트)
    - `GET /api/integrations/notion/callback` (토큰 교환)
    - 토큰 저장
  - [ ] Frontend 연동 버튼

- [ ] **액션 아이템 자동 감지**
  - [ ] LLM으로 액션 추출
    ```python
    # ML 서비스
    @app.post("/actions/extract")
    async def extract_actions(transcript: str):
        # "다음 주까지 재무 자료 보내드릴게요" 감지
        actions = await openai_extract_actions(transcript)
        return actions
    ```
  - [ ] Frontend에서 승인 UI
    ```
    ✅ 액션 아이템 감지
    "재무 자료 요청"
    Due: 12/9

    → Notion에 추가하시겠어요?
    [승인] [수정] [무시]
    ```

- [ ] **Notion API 연동**
  - [ ] `POST /api/integrations/notion/tasks` API
    - Notion API 호출
    - 태스크 생성
  - [ ] 테스트

#### 통합 테스트

- [ ] **E2E 테스트 시나리오**
  1. 회원가입
  2. 온보딩 완료
  3. 새 회의 시작
  4. 오디오 입력 (샘플)
  5. 실시간 전사 확인
  6. 질문 제안 확인
  7. 질문 사용 피드백
  8. 액션 아이템 감지
  9. Notion 연동
  10. 회의 종료
  11. 경험치 획득 확인
  12. 대시보드에서 회의 목록 확인

- [ ] **내부 테스터 10명 모집**
  - [ ] 지인 요청
  - [ ] 피드백 양식 준비 (Google Form)
  - [ ] 1주일 테스트
  - [ ] 피드백 수집 및 분석

---

## 📅 Month 2: 내부 테스트 + 피드백 반영

### 목표

- 내부 테스터 10명 피드백 수집
- 버그 수정 및 UX 개선
- Beta 론칭 준비

### TODO

- [ ] **피드백 수집**
  - [ ] 사용성 문제 리스트업
  - [ ] 버그 리스트업
  - [ ] 개선 요청 사항

- [ ] **Bug Fix**
  - [ ] Critical 버그 수정 (서비스 중단)
  - [ ] Major 버그 수정 (기능 오작동)
  - [ ] Minor 버그 수정 (UI 이슈)

- [ ] **UX 개선**
  - [ ] 온보딩 플로우 개선
  - [ ] 레벨 UI 개선
  - [ ] 질문 제안 UI 개선

- [ ] **성공 지표 확인**
  - [ ] STT 정확도 95%+ 달성?
  - [ ] 학습 데이터 수집률 80%+?
  - [ ] "사용할 만하다" 평가 7/10명 이상?

---

## 📅 Month 3-4: Beta 론칭

### 목표

- Beta 유저 30명 확보
- AI 질문 제안 고도화
- Lv.2 개인화 구현

### TODO (TBD)

- Phase 2 개발 계획 수립
- Beta 유저 모집 전략
- 질문 생성 모델 개선
- ...

---

## 🎯 장기 목표 (참고)

### Month 5-6: Public Beta

- [ ] 100명 가입
- [ ] 유료 전환 6명+
- [ ] PMF 검증 (NPS 50+, Retention 60%+)

### Month 7-9: Scale

- [ ] 한국 VC 10개 확보
- [ ] 유료 고객 75명
- [ ] MRR $1,500

### Month 10-12: Grow

- [ ] Team 플랜 출시
- [ ] 유료 고객 150명
- [ ] ARR $36,000

---

## 📝 메모

### 의사결정 기록

- **2025-12-02**: ML Engineer를 Full-time으로 채용하기로 결정
  - 이유: 개인화가 핵심 차별화 포인트
  - 예산: Pre-seed $150K → $170K로 증액

### 리스크 모니터링

- **팀 구성 지연 리스크**: CTO/ML Engineer 채용이 2주 이상 지연될 경우
  - 대응: Freelancer로 일단 시작, 채용 병행

- **자금 조달 실패 리스크**: Pre-seed 미확보 시
  - 대응: Lean MVP로 시작, 기능 축소

---

**이 TODO는 살아있는 문서입니다. 지속적으로 업데이트하세요!**
