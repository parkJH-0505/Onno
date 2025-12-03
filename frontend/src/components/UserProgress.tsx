import { useState, useEffect } from 'react';
import { personalizationApi, type UserProgress, type DomainType, type PersonaType } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import './UserProgress.css';

const DOMAIN_LABELS: Record<DomainType, string> = {
  'INVESTMENT_SCREENING': '투자 심사',
  'MENTORING': '멘토링',
  'SALES': '세일즈',
  'PRODUCT_REVIEW': '제품 리뷰',
  'TEAM_MEETING': '팀 미팅',
  'USER_INTERVIEW': '사용자 인터뷰',
  'GENERAL': '일반',
};

const PERSONA_INFO: Record<PersonaType, { label: string; icon: string; description: string }> = {
  'ANALYST': { label: '분석가', icon: '📊', description: '숫자/데이터 중심' },
  'BUDDY': { label: '동료', icon: '🤝', description: '협력/공감 중심' },
  'GUARDIAN': { label: '수호자', icon: '🛡️', description: '리스크 관리 중심' },
  'VISIONARY': { label: '비전가', icon: '🚀', description: '기회/미래 중심' },
};

const LEVEL_FEATURES: Record<number, string[]> = {
  1: ['기본 질문'],
  2: ['과거 맥락 로드', '스타일 반영'],
  3: ['벤치마크 비교', '리스크 감지', '심화 질문'],
  4: ['예측적 질문', '패턴 인사이트', '자기 코칭'],
  5: ['커스텀 템플릿', '팀 공유', 'AI 튜닝'],
};

const LEVEL_XP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 700,
  5: 1500,
};

interface UserProgressProps {
  onClose?: () => void;
}

export function UserProgressComponent({ onClose }: UserProgressProps) {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<DomainType | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadProgress();
    }
  }, [user?.id]);

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await personalizationApi.getProgress(user.id);
      setProgress(data);
      setSelectedDomain(data.primaryDomain);
    } catch (err) {
      console.error('Failed to load progress:', err);
      setError('진행 상황을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaChange = async (persona: PersonaType) => {
    if (!user?.id || !selectedDomain) return;

    try {
      await personalizationApi.setPersona(user.id, selectedDomain, persona);
      await loadProgress();
    } catch (err) {
      console.error('Failed to change persona:', err);
    }
  };

  const getSelectedDomainInfo = () => {
    if (!progress || !selectedDomain) return null;
    return progress.allDomains.find(d => d.domain === selectedDomain);
  };

  const calculateProgressPercent = (currentXp: number, level: number): number => {
    const currentLevelXp = LEVEL_XP[level] || 0;
    const nextLevelXp = LEVEL_XP[level + 1];

    if (!nextLevelXp) return 100; // Max level

    const xpInLevel = currentXp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  };

  if (loading) {
    return (
      <div className="user-progress">
        <div className="user-progress__loading">
          <div className="spinner" />
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="user-progress">
        <div className="user-progress__error">
          <p>{error || '데이터를 불러올 수 없습니다'}</p>
          <button onClick={loadProgress}>다시 시도</button>
        </div>
      </div>
    );
  }

  const domainInfo = getSelectedDomainInfo();

  return (
    <div className="user-progress">
      <div className="user-progress__header">
        <h2>나만의 온노</h2>
        {onClose && (
          <button className="user-progress__close" onClick={onClose}>×</button>
        )}
      </div>

      {/* 전체 XP */}
      <div className="user-progress__total">
        <div className="user-progress__total-xp">
          <span className="user-progress__xp-value">{progress.totalXp.toLocaleString()}</span>
          <span className="user-progress__xp-label">총 XP</span>
        </div>
      </div>

      {/* 도메인 선택 탭 */}
      <div className="user-progress__domains">
        {progress.allDomains.map(domain => (
          <button
            key={domain.domain}
            className={`user-progress__domain-tab ${selectedDomain === domain.domain ? 'active' : ''}`}
            onClick={() => setSelectedDomain(domain.domain)}
          >
            <span className="domain-level">Lv.{domain.level}</span>
            <span className="domain-name">{DOMAIN_LABELS[domain.domain]}</span>
          </button>
        ))}
      </div>

      {/* 선택된 도메인 상세 */}
      {domainInfo && (
        <div className="user-progress__detail">
          {/* 레벨 표시 */}
          <div className="user-progress__level">
            <div className="level-display">
              <span className="level-number">Lv.{domainInfo.level}</span>
              <span className="level-name">{DOMAIN_LABELS[domainInfo.domain]}</span>
            </div>
            <div className="level-stars">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`star ${i <= domainInfo.level ? 'filled' : ''}`}>★</span>
              ))}
            </div>
          </div>

          {/* XP 프로그레스 바 */}
          <div className="user-progress__xp-bar">
            <div className="xp-bar-info">
              <span>{domainInfo.xp} XP</span>
              <span>
                {domainInfo.level < 5
                  ? `다음 레벨: ${LEVEL_XP[domainInfo.level + 1]} XP`
                  : '최대 레벨'}
              </span>
            </div>
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{ width: `${calculateProgressPercent(domainInfo.xp, domainInfo.level)}%` }}
              />
            </div>
          </div>

          {/* 페르소나 선택 */}
          <div className="user-progress__persona">
            <h4>현재 페르소나</h4>
            <div className="persona-grid">
              {(Object.keys(PERSONA_INFO) as PersonaType[]).map(persona => (
                <button
                  key={persona}
                  className={`persona-card ${domainInfo.persona === persona ? 'active' : ''}`}
                  onClick={() => handlePersonaChange(persona)}
                >
                  <span className="persona-icon">{PERSONA_INFO[persona].icon}</span>
                  <span className="persona-label">{PERSONA_INFO[persona].label}</span>
                  <span className="persona-desc">{PERSONA_INFO[persona].description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 해금된 기능 */}
          <div className="user-progress__features">
            <h4>해금된 기능</h4>
            <div className="features-list">
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={`features-level ${level <= domainInfo.level ? 'unlocked' : 'locked'}`}
                >
                  <span className="features-level-label">Lv.{level}</span>
                  <div className="features-items">
                    {LEVEL_FEATURES[level].map(feature => (
                      <span key={feature} className="feature-tag">
                        {level <= domainInfo.level ? '✓ ' : '🔒 '}{feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 최근 레벨업 */}
      {progress.recentLevelUps.length > 0 && (
        <div className="user-progress__history">
          <h4>최근 레벨업</h4>
          <ul>
            {progress.recentLevelUps.slice(0, 3).map((levelUp, index) => (
              <li key={index}>
                <span className="history-domain">{DOMAIN_LABELS[levelUp.domain]}</span>
                <span className="history-level">
                  Lv.{levelUp.oldLevel} → Lv.{levelUp.newLevel}
                </span>
                <span className="history-date">
                  {new Date(levelUp.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
