# Onno (온노)

**Real-Time Conversation Intelligence Platform**

회의 중 실시간으로 질문·인사이트를 제안하는 AI 대화 파트너

---

## 🎯 What is Onno?

Onno는 VC/투자심사, Accelerator 멘토링, Company Builder를 위한 **During-the-fact** 대화 인텔리전스 플랫폼입니다.

기존 회의 솔루션(Otter, Fireflies)과 달리, 회의 '후' 요약이 아닌 **회의 '중' 실시간 질문·인사이트 제공**에 집중합니다.

## ✨ Core Features

### 1. 실시간 질문 제안 (Real-time Question Generation)
- 🔴 Critical: 놓치면 안 되는 핵심 질문
- 🟡 Important: 추가 확인 권장
- 🟢 Follow-up: 나중에 물어도 됨

### 2. 맥락 인사이트 (Contextual Insight Layer)
- 과거 대화 기록 자동 로드
- 벤치마크 비교 (동종 업계 대비)
- 용어 자동 설명

### 3. 워크플로우 연결 (Workflow Bridge)
- Notion 자동 태스크 생성
- Google Calendar 미팅 예약
- Slack 메시지 연동

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Python FastAPI (예정)
- **AI/ML**: OpenAI Whisper (STT) + GPT-4o (Question Gen)
- **Database**: PostgreSQL + Pinecone (Vector DB)

## 🚀 Getting Started

### Development

```bash
cd web
npm install
npm run dev
```

App will be running at `http://localhost:5173`

### Build

```bash
npm run build
npm run preview
```

## 📅 Roadmap

### Phase 1: MVP (Month 1-2) - Current
- [x] 기본 랜딩 페이지
- [ ] STT 파이프라인
- [ ] 액션 아이템 추출
- [ ] Notion 연동

### Phase 2: Intelligence (Month 3-4)
- [ ] 실시간 질문 제안 엔진
- [ ] 용어 설명 DB
- [ ] 과거 맥락 로드

### Phase 3: Launch (Month 5-6)
- [ ] 검색·요약
- [ ] 개인화 시스템
- [ ] Beta 출시

## 📦 Project Structure

```
Onno/
├── docs/          # 기획 문서, 전략 문서
├── web/           # React 웹 앱
│   ├── src/
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
└── README.md
```

## 🎨 Design Principles

1. **During-the-fact > After-the-fact**: 회의 후가 아닌 회의 중
2. **Vertical > Horizontal**: 범용이 아닌 VC/AC 특화
3. **Personalized**: 나만의 Onno, 학습·레벨업

## 📄 License

MIT

---

**Status**: 🚧 In Development | **Version**: v0.1.0-alpha | **Target**: 2025 Q1 Beta Launch
