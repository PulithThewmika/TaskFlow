import { TaskStatus, TaskPriority } from '../types/task.types';

/**
 * Get the display color for a task status.
 */
export const getStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: '#6B7280',
    [TaskStatus.IN_PROGRESS]: '#3B82F6',
    [TaskStatus.IN_REVIEW]: '#F59E0B',
    [TaskStatus.DONE]: '#10B981',
  };
  return colors[status];
};

/**
 * Get the display color for a task priority.
 */
export const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: '#6B7280',
    [TaskPriority.MEDIUM]: '#3B82F6',
    [TaskPriority.HIGH]: '#F59E0B',
    [TaskPriority.CRITICAL]: '#EF4444',
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
