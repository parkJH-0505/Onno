import type { ReactNode } from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  children: ReactNode;
  /** 페이지 헤더 영역 */
  header?: ReactNode;
  /** 전체 너비 사용 여부 (기본: false, max-width 적용) */
  fullWidth?: boolean;
  /** 배경색 (기본: transparent) */
  background?: 'transparent' | 'white' | 'glass';
  /** 추가 클래스명 */
  className?: string;
}

export function PageLayout({
  children,
  header,
  fullWidth = false,
  background = 'transparent',
  className = '',
}: PageLayoutProps) {
  return (
    <div
      className={`page-layout page-layout--bg-${background} ${className}`}
    >
      {header && (
        <header className="page-layout__header">
          <div className={`page-layout__header-inner ${fullWidth ? '' : 'page-layout__container'}`}>
            {header}
          </div>
        </header>
      )}
      <main className={`page-layout__content ${fullWidth ? '' : 'page-layout__container'}`}>
        {children}
      </main>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
}

export function Section({ children, title, action, className = '' }: SectionProps) {
  return (
    <section className={`page-section ${className}`}>
      {(title || action) && (
        <div className="page-section__header">
          {title && <h2 className="page-section__title">{title}</h2>}
          {action && <div className="page-section__action">{action}</div>}
        </div>
      )}
      <div className="page-section__content">{children}</div>
    </section>
  );
}

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, onClick, className = '', hoverable = false }: CardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      className={`card ${hoverable || onClick ? 'card--hoverable' : ''} ${className}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
}
