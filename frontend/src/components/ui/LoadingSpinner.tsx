interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ text = '로딩 중...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: { width: 24, height: 24 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
  }[size];

  return (
    <div className="loading-spinner">
      <div
        className="spinner"
        style={{ width: sizeClass.width, height: sizeClass.height }}
      />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}
