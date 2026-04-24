import React from 'react';
import type { Task, TaskStatus } from '../../types/task.types';
import TaskCard from './TaskCard';
import { getStatusLabel, getStatusColor } from '../../utils/statusUtils';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onTaskClick }) => {
  return (
    <div className="task-column" data-testid={`column-${status}`}>
      <div className="task-column-header">
        <span
          className="task-column-dot"
          style={{ backgroundColor: getStatusColor(status) }}
        />
        <h3>{getStatusLabel(status)}</h3>
        <span className="task-column-count">{tasks.length}</span>
      </div>
      <div className="task-column-body">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
