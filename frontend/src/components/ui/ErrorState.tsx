import { Button } from '../design-system';
import './ErrorState.css';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = '오류가 발생했습니다',
  description = '잠시 후 다시 시도해 주세요.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="error-state-v2">
      <div className="error-state-v2__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="error-state-v2__title">{title}</h3>
      <p className="error-state-v2__description">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          다시 시도
        </Button>
      )}
    </div>
  );
}
