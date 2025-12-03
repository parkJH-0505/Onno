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
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">{title}</h3>
      <p className="error-description">{description}</p>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}
