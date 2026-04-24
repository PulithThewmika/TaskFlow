import React from 'react';

interface EmptyStateProps {
  message?: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No tasks yet',
  icon = '📋',
}) => {
  return (
    <div className="empty-state" data-testid="empty-board-state">
      <span className="empty-state-icon">{icon}</span>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
