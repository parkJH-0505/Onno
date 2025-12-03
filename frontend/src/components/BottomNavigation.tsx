import './BottomNavigation.css';

export type TabType = 'home' | 'relationships' | 'meetings' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  visible?: boolean;
}

interface TabConfig {
  id: TabType;
  icon: string;
  label: string;
}

const tabs: TabConfig[] = [
  { id: 'home', icon: '🏠', label: '홈' },
  { id: 'relationships', icon: '👥', label: '관계' },
  { id: 'meetings', icon: '📅', label: '회의' },
  { id: 'profile', icon: '👤', label: '나' },
];

export function BottomNavigation({
  activeTab,
  onTabChange,
  visible = true
}: BottomNavigationProps) {
  if (!visible) return null;

  return (
    <nav className="bottom-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-navigation__tab ${activeTab === tab.id ? 'bottom-navigation__tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span className="bottom-navigation__icon">{tab.icon}</span>
          <span className="bottom-navigation__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
