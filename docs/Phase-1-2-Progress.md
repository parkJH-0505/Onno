# Phase 1-2: STT 서비스 구현 진행 상황

**날짜**: 2025-12-02
**담당**: 박준홍 + Claude
**상태**: 부분 완료 (OpenAI API 할당량 제한으로 Mock 모드로 전환)

---

## 📋 완료된 작업

### 1. STT 테스트 스크립트 작성 ✅

**파일**: [ai-service/test_stt.py](../ai-service/test_stt.py)

**기능**:
- OpenAI Whisper API를 사용한 음성-텍스트 전사 테스트
- 배치 테스트 지원 (여러 오디오 파일 동시 처리)
- 성능 지표 측정 (Latency, 정확도, 처리 속도)
- 테스트 결과 요약 및 목표 달성 여부 확인

**주요 기능**:
```python
# 개별 오디오 파일 테스트
python test_stt.py path/to/audio.mp3

# 기본 샘플 파일 배치 테스트
python test_stt.py
```

**출력 예시**:
```
[TEST] Testing: sample-1-vc-pitch.mp3
  File size: 2.34 MB
  Latency: 1.85s
  Audio length: 45.2s
  Processing speed: 24.4x
  Status: PASS (goal: <3s)
```

---

### 2. Question Generation 테스트 스크립트 작성 ✅

**파일**: [ai-service/test_question_gen.py](../ai-service/test_question_gen.py)

**기능**:
- GPT-4o 기반 VC 질문 생성 테스트
- 3가지 시나리오 (Early Stage SaaS, Growth Stage E-commerce, Pre-Revenue AI)
- 질문 품질 분석 (카테고리 분포, 우선순위 분포)
- JSON 형식 결과 저장

**테스트 시나리오**:
1. **Scenario 1**: Early Stage SaaS Startup (MRR, 성장률, 고객층)
2. **Scenario 2**: Growth Stage E-commerce (GMV, Take Rate, 마케팅)
3. **Scenario 3**: Pre-Revenue AI Startup (MVP, 정확도, 규제)

**실행 방법**:
```bash
cd ai-service
python test_question_gen.py
```

---

### 3. Mock 데이터 서비스 구현 ✅

**파일**: [ai-service/app/services/mock_data.py](../ai-service/app/services/mock_data.py)

**목적**:
OpenAI API 크레딧이 없거나 테스트 목적으로 프로토타입을 실행할 때 사용

**주요 함수**:
- `mock_transcribe_audio()`: 랜덤 Mock 전사 텍스트 반환
- `mock_generate_questions()`: 미리 정의된 VC 질문 반환

**Mock 데이터 예시**:
```python
# Mock 전사 텍스트
"저희 서비스는 AI 기반 B2B SaaS 솔루션입니다"
"현재 월간 활성 사용자는 약 5만명 수준이고요"

# Mock 질문
{
  "text": "현재 CAC(고객 획득 비용)는 얼마이며, LTV 대비 비율은 어떻게 되나요?",
  "priority": "critical",
  "reason": "유닛 이코노믹스는 투자 의사결정의 핵심 지표...",
  "category": "metrics"
}
```

**성능**:
- STT Latency: 0.5~1.5초 (랜덤)
- Question Generation Latency: 1.0~3.0초 (랜덤)

---

### 4. AI Service Mock 모드 통합 ✅

**파일**: [ai-service/app/main.py](../ai-service/app/main.py), [ai-service/.env](../ai-service/.env)

**환경 변수 설정**:
```env
MOCK_MODE=true  # Mock 모드 활성화
MOCK_MODE=false # 실제 OpenAI API 사용
```

**API 엔드포인트 수정**:
- `/health`: Mock 모드 상태 포함
- `/api/stt/transcribe`: Mock/Real 모드 자동 전환
- `/api/questions/generate`: Mock/Real 모드 자동 전환

**동작 방식**:
```python
if MOCK_MODE:
    result = await mock_transcribe_audio(audio.file)
    logger.info(f"[MOCK] Transcription complete: {result['latency']:.2f}s")
else:
    result = await transcribe_audio(audio.file)
    logger.info(f"Transcription complete: {result['latency']:.2f}s")
```

---

## ⚠️ 발생한 문제

### OpenAI API 할당량 초과

**에러 메시지**:
```
Error code: 429 - {'error': {'message': 'You exceeded your current quota,
please check your plan and billing details.'}}
```

**원인**:
- 사용 중인 OpenAI API 키에 크레딧이 소진됨
- Free tier 또는 할당량 제한에 도달

**해결 방법**:
1. **Mock 모드 사용** (현재 적용됨) ✅
   - `.env` 파일에 `MOCK_MODE=true` 설정
   - 실제 API 호출 없이 프로토타입 테스트 가능

2. **OpenAI API 크레딧 충전** (선택사항)
   - https://platform.openai.com/account/billing 에서 크레딧 구매
   - 최소 $5부터 충전 가능
   - 실제 STT 및 질문 생성 품질 테스트 필요시

3. **대체 STT 서비스 고려** (Phase 2에서 고려)
   - Google Cloud Speech-to-Text
   - Azure Speech Services
   - Whisper 로컬 모델 (Faster-Whisper)

---

## 📊 성능 목표 달성 현황

| 지표 | 목표 | 현재 상태 | 달성 여부 |
|------|------|-----------|-----------|
| STT Latency | < 3초 | 테스트 불가 (API 제한) | ⚠️  Blocked |
| STT 정확도 | 90%+ | 테스트 불가 (API 제한) | ⚠️  Blocked |
| Question Generation Latency | < 5초 | 테스트 불가 (API 제한) | ⚠️  Blocked |
| Question 개수 | 3개 이상 | Mock: 3개 | ✅ PASS (Mock) |
| Mock 모드 동작 | N/A | 정상 동작 | ✅ PASS |

---

## 🎯 다음 단계

### 우선순위 1: OpenAI API 크레딧 확보 (선택)
- 실제 STT 및 질문 생성 품질 테스트를 위해서는 API 크레딧 필요
- 프로토타입 데모 목적으로는 Mock 모드로 충분

### 우선순위 2: Frontend-Backend 통합 테스트
- Mock 모드를 사용하여 전체 파이프라인 테스트
- 브라우저에서 실제 음성 녹음 → WebSocket → Backend → AI Service → 화면 표시

### 우선순위 3: 사용자 인터페이스 개선
- 에러 처리 강화
- 로딩 상태 표시
- Mock 모드 표시 (개발자 도구)

---

## 📝 테스트 가이드

### Mock 모드로 프로토타입 테스트하기

**1. 서버 시작**:
```bash
# AI Service (Mock 모드)
cd ai-service
MOCK_MODE=true
./venv/Scripts/uvicorn.exe app.main:app --reload --port 6000

# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

**2. 브라우저 접속**:
- http://localhost:6005

**3. 기대 동작**:
- 녹음 버튼 클릭 → 5초마다 Mock 전사 텍스트 표시
- 일정 시간 후 Mock VC 질문 3개 자동 생성
- 실시간으로 화면에 표시

---

## 🔧 트러블슈팅

### Mock 모드가 활성화되지 않는 경우

**확인 사항**:
1. `.env` 파일에 `MOCK_MODE=true` 설정되어 있는지 확인
2. AI Service 재시작 (Uvicorn은 .env 변경 시 자동 재시작 안됨)
3. `/health` 엔드포인트 호출하여 `mock_mode: true` 확인

```bash
curl http://localhost:6000/health
# 응답: {"status": "ok", "service": "onno-ai", "mock_mode": true}
```

### Windows 인코딩 오류 (UnicodeEncodeError)

**문제**: 테스트 스크립트에서 이모지 출력 시 오류 발생

**해결**: 이모지를 텍스트 기호로 변경 (✅ → [PASS], ❌ → [FAIL])

---

## 📚 관련 문서

- [Iteration-1-Plan.md](./Iteration-1-Plan.md): 전체 프로토타입 개발 계획
- [SETUP.md](../SETUP.md): 프로젝트 설치 및 실행 가이드
- [test-data/README.md](../test-data/audio-samples/README.md): 오디오 테스트 샘플 가이드

---

**작성자**: Claude
**최종 업데이트**: 2025-12-02 15:00 KST
