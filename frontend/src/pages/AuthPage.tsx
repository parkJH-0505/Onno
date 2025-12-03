import { useState } from 'react';
import { useAuthStore, type User } from '../stores/authStore';
import { GlassCard, Button } from '../components/design-system';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  onSuccess?: () => void;
  onSkip?: () => void;
}

export function AuthPage({ onSuccess, onSkip }: AuthPageProps) {
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('INVESTOR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    let success = false;
    if (mode === 'login') {
      success = await login(email, password);
    } else {
      success = await register(email, password, name, role);
    }

    if (success && onSuccess) {
      onSuccess();
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__logo">
          <h1>Onno</h1>
          <p>AI가 함께하는 모든 대화를 더 깊고, 더 생산적으로</p>
        </div>

        <GlassCard className="auth-page__card">
          <h2 className="auth-page__title">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>

          <form onSubmit={handleSubmit} className="auth-page__form">
            {mode === 'register' && (
              <div className="auth-page__field">
                <label htmlFor="name">이름</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                />
              </div>
            )}

            <div className="auth-page__field">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="auth-page__field">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                minLength={6}
                required
              />
            </div>

            {mode === 'register' && (
              <div className="auth-page__field">
                <label htmlFor="role">역할</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as User['role'])}
                >
                  <option value="INVESTOR">VC 심사역</option>
                  <option value="ACCELERATOR">AC 매니저</option>
                  <option value="FOUNDER">창업자</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>
            )}

            {error && <div className="auth-page__error">{error}</div>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="auth-page__submit"
            >
              {isLoading
                ? '처리 중...'
                : mode === 'login'
                ? '로그인'
                : '가입하기'}
            </Button>
          </form>

          <div className="auth-page__switch">
            {mode === 'login' ? (
              <p>
                계정이 없으신가요?{' '}
                <button type="button" onClick={toggleMode}>
                  회원가입
                </button>
              </p>
            ) : (
              <p>
                이미 계정이 있으신가요?{' '}
                <button type="button" onClick={toggleMode}>
                  로그인
                </button>
              </p>
            )}
          </div>
        </GlassCard>

        <p className="auth-page__footer">
          로그인 없이 사용하려면{' '}
          <button type="button" onClick={onSkip}>
            게스트로 시작
          </button>
        </p>
      </div>
    </div>
  );
}
