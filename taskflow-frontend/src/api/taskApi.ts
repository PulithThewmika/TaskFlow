import axiosInstance from './axiosInstance';
import type { Task, CreateTaskPayload, UpdateTaskStatusPayload } from '../types/task.types';

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  const { data } = await axiosInstance.get<Task[]>(`/projects/${projectId}/tasks`);
  return data;
};

export const createTask = async (projectId: string, payload: CreateTaskPayload): Promise<Task> => {
  const { data } = await axiosInstance.post<Task>(`/projects/${projectId}/tasks`, payload);
  return data;
};

export const updateTaskStatus = async (taskId: string, payload: UpdateTaskStatusPayload): Promise<Task> => {
  const { data } = await axiosInstance.patch<Task>(`/tasks/${taskId}/status`, payload);
  return data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await axiosInstance.delete(`/tasks/${taskId}`);
};
