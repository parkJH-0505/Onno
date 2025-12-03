import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const classNames = [
    'onno-button',
    `onno-button--${variant}`,
    `onno-button--${size}`,
    fullWidth && 'onno-button--full',
    loading && 'onno-button--loading',
    disabled && 'onno-button--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="onno-button__spinner" />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="onno-button__icon">{icon}</span>
      )}
      {children && <span className="onno-button__text">{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="onno-button__icon">{icon}</span>
      )}
    </button>
  );
};

export default Button;
