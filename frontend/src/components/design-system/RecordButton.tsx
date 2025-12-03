import React from 'react';
import './RecordButton.css';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  onClick,
  disabled = false,
  size = 'md',
  showLabel = true,
}) => {
  const buttonClasses = [
    'record-button',
    `record-button--${size}`,
    isRecording && 'record-button--recording',
    disabled && 'record-button--disabled',
  ].filter(Boolean).join(' ');

  return (
    <div className="record-button-wrapper">
      <button
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
        aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
      >
        {/* Ripple effect layers */}
        {isRecording && (
          <>
            <span className="record-button__ripple record-button__ripple--1" />
            <span className="record-button__ripple record-button__ripple--2" />
            <span className="record-button__ripple record-button__ripple--3" />
          </>
        )}

        {/* Inner circle/square */}
        <span className="record-button__inner">
          {isRecording ? (
            <span className="record-button__stop" />
          ) : (
            <svg
              className="record-button__mic"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </span>
      </button>

      {/* Label */}
      {showLabel && (
        <span className={`record-button__label ${isRecording ? 'record-button__label--recording' : ''}`}>
          {isRecording ? (
            <>
              <span className="record-button__live-dot" />
              녹음 중
            </>
          ) : (
            '녹음 시작'
          )}
        </span>
      )}
    </div>
  );
};

// Inline Record Button (for header/toolbar)
interface InlineRecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
  duration?: string;
}

export const InlineRecordButton: React.FC<InlineRecordButtonProps> = ({
  isRecording,
  onClick,
  disabled = false,
  duration,
}) => {
  return (
    <button
      className={`inline-record-button ${isRecording ? 'inline-record-button--recording' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="inline-record-button__indicator">
        {isRecording && <span className="inline-record-button__pulse" />}
        <span className={`inline-record-button__dot ${isRecording ? 'inline-record-button__dot--active' : ''}`} />
      </span>
      <span className="inline-record-button__text">
        {isRecording ? (duration || 'REC') : 'Start'}
      </span>
    </button>
  );
};

export default RecordButton;
