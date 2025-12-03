import React from 'react';
import { useMeetingStore } from '../../stores/meetingStore';
import { useAuthStore } from '../../stores/authStore';
import { userApi } from '../../services/api';
import type { Question } from '../../types/meeting';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  compact?: boolean;
}

// Category 색상 및 아이콘 매핑
const CATEGORY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  business_model: { color: 'var(--color-cat-business)', icon: '💼', label: '비즈니스' },
  traction: { color: 'var(--color-cat-traction)', icon: '📈', label: '성과' },
  team: { color: 'var(--color-cat-team)', icon: '👥', label: '팀' },
  market: { color: 'var(--color-cat-market)', icon: '🎯', label: '시장' },
  technology: { color: 'var(--color-cat-technology)', icon: '⚙️', label: '기술' },
  financials: { color: 'var(--color-cat-financials)', icon: '💰', label: '재무' },
  risks: { color: 'var(--color-cat-risks)', icon: '⚠️', label: '리스크' },
  general: { color: 'var(--color-cat-general)', icon: '💬', label: '일반' },
};

// Priority 설정
const PRIORITY_CONFIG: Record<string, { glow: string; label: string; className: string }> = {
  critical: { glow: 'live', label: '핵심', className: 'priority-critical' },
  important: { glow: 'insight', label: '중요', className: 'priority-important' },
  follow_up: { glow: 'none', label: '후속', className: 'priority-followup' },
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, compact = false }) => {
  const { updateQuestionAction } = useMeetingStore();
  const { user } = useAuthStore();

  // 백엔드에 피드백 전송 (비동기, 실패해도 UI 업데이트는 진행)
  const logFeedback = async (action: 'USED' | 'DISMISSED') => {
    if (!user?.id) return; // 게스트는 로깅 스킵

    try {
      await userApi.logQuestionAction(user.id, {
        questionId: question.id,
        originalText: question.text,
        category: question.category?.toUpperCase(),
        action,
      });
    } catch (error) {
      console.error('Failed to log question feedback:', error);
      // 실패해도 UI는 업데이트됨
    }
  };

  const handleUse = () => {
    updateQuestionAction(question.id, 'used');
    logFeedback('USED');
  };

  const handleDismiss = () => {
    updateQuestionAction(question.id, 'dismissed');
    logFeedback('DISMISSED');
  };

  // 무시된 질문은 렌더링하지 않음
  if (question.action === 'dismissed') {
    return null;
  }

  const category = CATEGORY_CONFIG[question.category] || CATEGORY_CONFIG.general;
  const priority = PRIORITY_CONFIG[question.priority] || PRIORITY_CONFIG.follow_up;
  const isUsed = question.action === 'used';

  const cardClasses = [
    'question-card-v2',
    priority.className,
    isUsed && 'question-card-v2--used',
    compact && 'question-card-v2--compact',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {/* Priority Indicator */}
      <div className="question-card-v2__priority-bar" />

      {/* Header */}
      <div className="question-card-v2__header">
        <div className="question-card-v2__badges">
          <span
            className="question-card-v2__category"
            style={{ '--category-color': category.color } as React.CSSProperties}
          >
            <span className="question-card-v2__category-icon">{category.icon}</span>
            {category.label}
          </span>
          <span className={`question-card-v2__priority ${priority.className}`}>
            {priority.label}
          </span>
        </div>
        {isUsed && (
          <span className="question-card-v2__used-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            사용됨
          </span>
        )}
      </div>

      {/* Question Text */}
      <p className="question-card-v2__text">{question.text}</p>

      {/* Reason (Insight) */}
      {question.reason && !compact && (
        <div className="question-card-v2__insight">
          <svg className="question-card-v2__insight-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>{question.reason}</span>
        </div>
      )}

      {/* Actions */}
      {!isUsed && (
        <div className="question-card-v2__actions">
          <button
            onClick={handleUse}
            className="question-card-v2__btn question-card-v2__btn--use"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            사용하기
          </button>
          <button
            onClick={handleDismiss}
            className="question-card-v2__btn question-card-v2__btn--dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            무시
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
