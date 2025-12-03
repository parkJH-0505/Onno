import React from 'react';
import './Card.css';

// ============================================
// CARD VARIANTS
// ============================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  active = false,
  className = '',
  ...props
}) => {
  const classNames = [
    'onno-card',
    `onno-card--${variant}`,
    `onno-card--padding-${padding}`,
    hover && 'onno-card--hover',
    active && 'onno-card--active',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
};

// ============================================
// GLASS CARD (Special variant with more effects)
// ============================================
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: 'none' | 'primary' | 'success' | 'live' | 'insight';
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  padding = 'md',
  glow = 'none',
  animate = false,
  className = '',
  ...props
}) => {
  const classNames = [
    'onno-glass-card',
    `onno-glass-card--padding-${padding}`,
    glow !== 'none' && `onno-glass-card--glow-${glow}`,
    animate && 'onno-glass-card--animate',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
};

// ============================================
// CARD HEADER
// ============================================
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`onno-card-header ${className}`} {...props}>
      {(title || subtitle) ? (
        <div className="onno-card-header__content">
          {title && <h3 className="onno-card-header__title">{title}</h3>}
          {subtitle && <p className="onno-card-header__subtitle">{subtitle}</p>}
        </div>
      ) : children}
      {action && <div className="onno-card-header__action">{action}</div>}
    </div>
  );
};

// ============================================
// CARD BODY
// ============================================
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`onno-card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

// ============================================
// CARD FOOTER
// ============================================
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  align = 'right',
  className = '',
  ...props
}) => {
  return (
    <div className={`onno-card-footer onno-card-footer--${align} ${className}`} {...props}>
      {children}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================
export default Card;
