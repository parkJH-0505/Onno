import { useState, useEffect } from 'react';
import { Button, GlassCard } from './design-system';
import { useMeetingStore } from '../stores/meetingStore';
import './MeetingEndModal.css';

interface MeetingEndModalProps {
  onClose: () => void;
  onSave: (data: MeetingEndData) => void;
  relationshipId?: string;
  relationshipName?: string;
}

interface MeetingEndData {
  summary: string;
  keyQuestions: string[];
  structuredDataUpdates?: Record<string, string | number>;
}

interface MetricUpdate {
  key: string;
  label: string;
  value: string;
  placeholder: string;
}

const DEFAULT_METRICS: MetricUpdate[] = [
  { key: 'mrr', label: 'MRR', value: '', placeholder: '월간 반복 수익 (만원)' },
  { key: 'arr', label: 'ARR', value: '', placeholder: '연간 반복 수익 (만원)' },
  { key: 'users', label: '사용자 수', value: '', placeholder: '현재 사용자 수' },
  { key: 'cac', label: 'CAC', value: '', placeholder: '고객 획득 비용 (원)' },
  { key: 'ltv', label: 'LTV', value: '', placeholder: '고객 생애 가치 (원)' },
  { key: 'runway', label: 'Runway', value: '', placeholder: '남은 개월 수' },
];

export function MeetingEndModal({
  onClose,
  onSave,
  relationshipId,
  relationshipName,
}: MeetingEndModalProps) {
  const { questions, transcripts } = useMeetingStore();

  // 요약 생성 (전사 내용 기반)
  const [summary, setSummary] = useState('');
  const [keyQuestionIds, setKeyQuestionIds] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<MetricUpdate[]>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(false);

  // 자동 요약 생성 (간단한 버전)
  useEffect(() => {
    const totalText = transcripts.map(t => t.text).join(' ');
    const wordCount = totalText.split(/\s+/).length;
    const questionCount = questions.length;
    const usedQuestions = questions.filter(q => q.action === 'used').length;

    const autoSummary = `총 ${wordCount}단어의 대화가 오갔습니다. ${questionCount}개의 AI 질문 중 ${usedQuestions}개가 활용되었습니다.`;
    setSummary(autoSummary);

    // 사용된 질문들을 핵심 질문으로 기본 선택
    const usedIds = new Set(
      questions.filter(q => q.action === 'used').map(q => q.id)
    );
    setKeyQuestionIds(usedIds);
  }, [transcripts, questions]);

  const handleToggleQuestion = (id: string) => {
    const newSet = new Set(keyQuestionIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setKeyQuestionIds(newSet);
  };

  const handleMetricChange = (key: string, value: string) => {
    setMetrics(metrics.map(m =>
      m.key === key ? { ...m, value } : m
    ));
  };

  const handleSave = async () => {
    setLoading(true);

    // 핵심 질문 텍스트 수집
    const keyQuestions = questions
      .filter(q => keyQuestionIds.has(q.id))
      .map(q => q.text);

    // 입력된 구조화 데이터만 수집
    const structuredDataUpdates: Record<string, string | number> = {};
    metrics.forEach(m => {
      if (m.value.trim()) {
        const numValue = parseFloat(m.value);
        structuredDataUpdates[m.key] = isNaN(numValue) ? m.value : numValue;
      }
    });

    try {
      await onSave({
        summary,
        keyQuestions,
        structuredDataUpdates: Object.keys(structuredDataUpdates).length > 0
          ? structuredDataUpdates
          : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const activeQuestions = questions.filter(q => q.action !== 'dismissed');

  return (
    <div className="meeting-end-modal__overlay" onClick={onClose}>
      <div className="meeting-end-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="meeting-end-modal__header">
          <div>
            <h2>회의 종료</h2>
            {relationshipName && (
              <p className="meeting-end-modal__relationship">{relationshipName}</p>
            )}
          </div>
          <button className="meeting-end-modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="meeting-end-modal__content">
          {/* Summary Section */}
          <section className="meeting-end-modal__section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              회의 요약
            </h3>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="회의 내용을 요약해주세요..."
              rows={4}
            />
          </section>

          {/* Key Questions Section */}
          {activeQuestions.length > 0 && (
            <section className="meeting-end-modal__section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
                핵심 질문 선택
              </h3>
              <p className="meeting-end-modal__hint">
                다음 미팅에서 참고할 핵심 질문들을 선택하세요
              </p>
              <div className="meeting-end-modal__questions">
                {activeQuestions.slice(0, 10).map(q => (
                  <label
                    key={q.id}
                    className={`meeting-end-modal__question ${keyQuestionIds.has(q.id) ? 'meeting-end-modal__question--selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={keyQuestionIds.has(q.id)}
                      onChange={() => handleToggleQuestion(q.id)}
                    />
                    <span className="meeting-end-modal__question-text">{q.text}</span>
                    {q.action === 'used' && (
                      <span className="meeting-end-modal__question-badge">사용됨</span>
                    )}
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Structured Data Section (only for relationships) */}
          {relationshipId && (
            <section className="meeting-end-modal__section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                지표 업데이트
              </h3>
              <p className="meeting-end-modal__hint">
                회의에서 확인된 새로운 지표를 입력하세요 (선택사항)
              </p>
              <GlassCard padding="md" className="meeting-end-modal__metrics">
                <div className="meeting-end-modal__metrics-grid">
                  {metrics.map(m => (
                    <div key={m.key} className="meeting-end-modal__metric">
                      <label>{m.label}</label>
                      <input
                        type="text"
                        value={m.value}
                        onChange={e => handleMetricChange(m.key, e.target.value)}
                        placeholder={m.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </section>
          )}
        </div>

        {/* Actions */}
        <div className="meeting-end-modal__actions">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? '저장 중...' : '저장하고 종료'}
          </Button>
        </div>
      </div>
    </div>
  );
}
