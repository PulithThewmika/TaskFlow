import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { getTasksByProject, createTask, updateTaskStatus, deleteTask } from '../api/taskApi';
import type { Task, CreateTaskPayload, TaskStatus } from '../types/task.types';

export const useTasks = (projectId: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasksByProject(projectId);
      setTasks(data);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch tasks');
      } else {
        setError('Failed to fetch tasks');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTasks();
    }
  }, [projectId, fetchTasks]);

  const addTask = async (payload: CreateTaskPayload) => {
    const newTask = await createTask(projectId, payload);
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const changeStatus = async (taskId: number, status: TaskStatus) => {
    const updated = await updateTaskStatus(taskId, { status });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const removeTask = async (taskId: number) => {
    await deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return { tasks, loading, error, fetchTasks, addTask, changeStatus, removeTask };
};
