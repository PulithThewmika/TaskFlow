import { TaskStatus, TaskPriority } from '../types/task.types';

/**
 * Get the display color for a task status.
 */
export const getStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: '#4a5180',
    [TaskStatus.IN_PROGRESS]: '#f59e0b',
    [TaskStatus.IN_REVIEW]: '#8b5cf6',
    [TaskStatus.DONE]: '#10b981',
  };
  return colors[status];
};

/**
 * Get the display color for a task priority.
 */
export const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: '#6b7280',
    [TaskPriority.MEDIUM]: '#3b82f6',
    [TaskPriority.HIGH]: '#f97316',
    [TaskPriority.CRITICAL]: '#ef4444',
  };
  return colors[priority];
};

/**
 * Get the display label for a task status.
 */
export const getStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.IN_REVIEW]: 'In Review',
    [TaskStatus.DONE]: 'Done',
  };
  return labels[status];
};

/**
 * Get the next valid statuses for a given status.
 */
export const getNextStatuses = (status: TaskStatus): TaskStatus[] => {
  const transitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.IN_REVIEW, TaskStatus.TODO],
    [TaskStatus.IN_REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
    [TaskStatus.DONE]: [],
  };
  return transitions[status];
};
