import { useEffect, useState } from 'react';
import { Button } from './design-system';
import type { DomainType } from '../services/api';
import './LevelUpModal.css';

// 도메인 한글 매핑
const DOMAIN_LABELS: Record<DomainType, string> = {
  INVESTMENT_SCREENING: '투자 심사',
  MENTORING: '멘토링',
  SALES: '세일즈',
  PRODUCT_REVIEW: '제품 리뷰',
  TEAM_MEETING: '팀 미팅',
  USER_INTERVIEW: '사용자 인터뷰',
  GENERAL: '일반',
};

// 레벨별 설명
const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: '입문자',
  2: '견습생',
  3: '숙련자',
  4: '전문가',
  5: '마스터',
};

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainType;
  newLevel: number;
  newFeatures?: string[];
}

export function LevelUpModal({ isOpen, onClose, domain, newLevel, newFeatures }: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 애니메이션을 위한 딜레이
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="levelup-modal__overlay" onClick={onClose}>
      <div
        className={`levelup-modal ${showContent ? 'levelup-modal--visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 배경 효과 */}
        <div className="levelup-modal__particles">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="levelup-modal__particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        {/* 아이콘 */}
        <div className="levelup-modal__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>

        {/* 타이틀 */}
        <h2 className="levelup-modal__title">레벨 업!</h2>

        {/* 도메인 & 레벨 */}
        <div className="levelup-modal__level">
          <span className="levelup-modal__domain">{DOMAIN_LABELS[domain]}</span>
          <div className="levelup-modal__level-badge">
            <span className="levelup-modal__level-text">Lv.{newLevel}</span>
            <span className="levelup-modal__level-desc">{LEVEL_DESCRIPTIONS[newLevel]}</span>
          </div>
        </div>

        {/* 별 표시 */}
        <div className="levelup-modal__stars">
          {Array(5).fill(0).map((_, i) => (
            <svg
              key={i}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={i < newLevel ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              className={`levelup-modal__star ${i < newLevel ? 'star--filled' : 'star--empty'}`}
              style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>

        {/* 새 기능 */}
        {newFeatures && newFeatures.length > 0 && (
          <div className="levelup-modal__features">
            <p className="levelup-modal__features-title">새로운 기능 해금!</p>
            <ul className="levelup-modal__features-list">
              {newFeatures.map((feature, i) => (
                <li key={i} className="levelup-modal__feature">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 버튼 */}
        <Button variant="primary" onClick={onClose} className="levelup-modal__btn">
          계속하기
        </Button>
      </div>
    </div>
  );
}

export default LevelUpModal;
