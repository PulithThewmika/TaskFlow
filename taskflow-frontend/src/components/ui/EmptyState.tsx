import React from 'react';

interface EmptyStateProps {
  message?: string;
  submessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No tasks yet',
  submessage = 'Add your first task to get started',
}) => {
  return (
    <div className="empty-state" data-testid="empty-board-state">
      <div className="empty-state-icon">📋</div>
      <h3>{message}</h3>
      <p>{submessage}</p>
    </div>
  );
};

export default EmptyState;
