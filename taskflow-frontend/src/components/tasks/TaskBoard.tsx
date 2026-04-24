import React, { useState } from 'react';
import { TaskStatus } from '../../types/task.types';
import type { Task } from '../../types/task.types';
import TaskColumn from './TaskColumn';
import EmptyState from '../ui/EmptyState';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const COLUMNS: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick }) => {
  if (tasks.length === 0) {
    return <EmptyState message="No tasks yet" />;
  }

  return (
    <div className="task-board">
      {COLUMNS.map((status) => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
