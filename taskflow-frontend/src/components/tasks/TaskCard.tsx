import React from 'react';
import type { Task } from '../../types/task.types';
import Badge from '../ui/Badge';
import { getPriorityColor } from '../../utils/statusUtils';
import { formatDeadline, isOverdue } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <div
      className="task-card"
      data-testid={`task-card-${task.title}`}
      onClick={onClick}
    >
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <Badge label={task.priority} color={getPriorityColor(task.priority)} />
      </div>
      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}
      <div className="task-card-footer">
        {task.assigneeName && (
          <span className="task-card-assignee">{task.assigneeName}</span>
        )}
        {task.deadline && (
          <span className={`task-card-deadline ${isOverdue(task.deadline) ? 'overdue' : ''}`}>
            {formatDeadline(task.deadline)}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
