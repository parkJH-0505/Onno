import { useMeetingStore } from '../stores/meetingStore';
import type { Question } from '../types/meeting';

interface QuestionCardProps {
  question: Question;
}

const PRIORITY_LABELS = {
  critical: '🔥 필수',
  important: '⭐ 중요',
  follow_up: '💬 후속'
};

const PRIORITY_COLORS = {
  critical: '#ff4444',
  important: '#ff9944',
  follow_up: '#4499ff'
};

export function QuestionCard({ question }: QuestionCardProps) {
  const { updateQuestionAction } = useMeetingStore();

  const handleUse = () => {
    updateQuestionAction(question.id, 'used');
  };

  const handleDismiss = () => {
    updateQuestionAction(question.id, 'dismissed');
  };

  if (question.action === 'dismissed') {
    return null;
  }

  return (
    <div
      className={`question-card ${question.action || ''}`}
      style={{ borderLeftColor: PRIORITY_COLORS[question.priority] }}
    >
      <div className="question-header">
        <span
          className="priority-badge"
          style={{ backgroundColor: PRIORITY_COLORS[question.priority] }}
        >
          {PRIORITY_LABELS[question.priority]}
        </span>
        <span className="category-badge">{question.category}</span>
      </div>

      <p className="question-text">{question.text}</p>
      <p className="question-reason">💡 {question.reason}</p>

      <div className="question-actions">
        <button onClick={handleUse} className="btn-use">
          ✅ 사용
        </button>
        <button onClick={handleDismiss} className="btn-dismiss">
          ❌ 무시
        </button>
      </div>
    </div>
  );
}
