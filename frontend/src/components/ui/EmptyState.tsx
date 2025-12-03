import { Button } from '../design-system';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state-v2">
      <div className="empty-state-v2__icon">{icon}</div>
      <h3 className="empty-state-v2__title">{title}</h3>
      {description && <p className="empty-state-v2__description">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
