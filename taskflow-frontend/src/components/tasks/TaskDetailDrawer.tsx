import React from 'react';
import type { Task, TaskStatus } from '../../types/task.types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getStatusColor, getStatusLabel, getNextStatuses, getPriorityColor } from '../../utils/statusUtils';
import { formatDeadline } from '../../utils/dateUtils';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  const nextStatuses = getNextStatuses(task.status);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>{task.title}</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        <div className="drawer-body">
          <div className="drawer-field">
            <label>Status</label>
            <Badge label={getStatusLabel(task.status)} color={getStatusColor(task.status)} />
          </div>

          <div className="drawer-field">
            <label>Priority</label>
            <Badge label={task.priority} color={getPriorityColor(task.priority)} />
          </div>

          {task.description && (
            <div className="drawer-field">
              <label>Description</label>
              <p>{task.description}</p>
            </div>
          )}

          <div className="drawer-field">
            <label>Deadline</label>
            <p>{formatDeadline(task.deadline)}</p>
          </div>

          {task.assigneeName && (
            <div className="drawer-field">
              <label>Assignee</label>
              <p>{task.assigneeName}</p>
            </div>
          )}

          {nextStatuses.length > 0 && (
            <div className="drawer-actions">
              <label>Move to</label>
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  variant="secondary"
                  onClick={() => onStatusChange(task.id, status)}
                >
                  Move to {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          )}

          <Button variant="danger" onClick={() => onDelete(task.id)}>
            Delete Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;
