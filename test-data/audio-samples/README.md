# Audio Test Samples

이 디렉토리는 STT (Speech-to-Text) 테스트용 오디오 샘플을 저장합니다.

## 테스트 샘플 준비 방법

### Option 1: 직접 녹음
1. 윈도우 음성 녹음기 또는 휴대폰 녹음 앱 사용
2. 1-3분 길이의 한국어 비즈니스 대화 녹음
3. MP3, WAV, M4A 등의 형식으로 저장
4. 이 디렉토리에 파일 복사

### Option 2: 샘플 시나리오 녹음 (권장)

아래 시나리오를 읽으면서 녹음하면 됩니다:

#### Sample 1: VC 투자 심사 (sample-1-vc-pitch.mp3)
```
안녕하세요, 저희는 AI 기반 B2B SaaS 스타트업입니다.
현재 MAU 5만명을 달성했고, 월 성장률은 20%입니다.
주요 타겟은 중소기업이며, ARPU는 5만원 수준입니다.
올해 목표 매출은 10억원이고, 현재 6억을 달성한 상태입니다.
```

#### Sample 2: AC 멘토링 대화 (sample-2-mentor-call.mp3)
```
멘토님, 고객 확보에 어려움을 겪고 있습니다.
마케팅 채널은 주로 SNS와 콘텐츠 마케팅을 활용하고 있습니다.
CAC는 10만원 정도인데, LTV가 30만원 수준입니다.
유닛 이코노믹스는 긍정적이지만, 스케일업이 어렵습니다.
```

#### Sample 3: CB 세일즈 콜 (sample-3-sales-call.mp3)
```
고객사의 현재 pain point는 무엇인가요?
저희 솔루션은 업무 효율을 30% 향상시킬 수 있습니다.
도입 비용은 월 50만원이며, 초기 셋업 비용은 없습니다.
POC는 2주 정도 소요되고, 무료로 진행 가능합니다.
```

### Option 3: YouTube에서 다운로드
YouTube에서 한국어 비즈니스 인터뷰나 발표 영상을 다운로드하여 사용할 수 있습니다.

## 테스트 실행 방법

```bash
# AI Service 디렉토리로 이동
cd ai-service

# 가상 환경 활성화 (Windows)
.\venv\Scripts\activate

# 테스트 실행 (샘플 파일 자동 탐색)
python test_stt.py

# 또는 특정 파일 테스트
python test_stt.py path/to/your/audio.mp3
```

## 파일 명명 규칙

- `sample-{번호}-{용도}.{확장자}`
- 예: `sample-1-vc-pitch.mp3`, `sample-2-mentor-call.wav`

## 주의사항

- 파일 크기: 25MB 이하 권장 (OpenAI API 제한)
- 음성 품질: 배경 소음이 적을수록 정확도 향상
- 언어: 한국어 비즈니스 용어 포함 권장
