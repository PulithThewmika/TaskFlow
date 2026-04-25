import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import TaskBoard from '../components/tasks/TaskBoard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer';
import Spinner from '../components/ui/Spinner';
import type { Task } from '../types/task.types';

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id ?? '';
  const { tasks, loading, addTask, changeStatus, removeTask } = useTasks(projectId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (loading) return <Spinner />;

  return (
    <div className="board-page">
      <div className="board-header">
        <h1>Task Board</h1>
        <button onClick={() => setIsCreateModalOpen(true)}>Add Task</button>
      </div>

      <TaskBoard tasks={tasks} onTaskClick={(task) => setSelectedTask(task)} />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await addTask(payload);
        }}
      />

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={async (taskId, status) => {
          await changeStatus(taskId, status);
          setSelectedTask(null);
        }}
        onDelete={async (taskId) => {
          await removeTask(taskId);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};

export default BoardPage;
