import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ text = '로딩 중...', size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner-v2">
      <div className={`loading-spinner-v2__ring loading-spinner-v2__ring--${size}`}>
        <div className="loading-spinner-v2__circle" />
      </div>
      {text && <span className="loading-spinner-v2__text">{text}</span>}
    </div>
  );
}
