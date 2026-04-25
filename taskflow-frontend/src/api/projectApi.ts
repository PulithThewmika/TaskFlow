import axiosInstance from './axiosInstance';
import type { Project, CreateProjectPayload } from '../types/project.types';

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await axiosInstance.get<Project[]>('/projects');
  return data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const { data } = await axiosInstance.get<Project>(`/projects/${id}`);
  return data;
};

export const createProject = async (payload: CreateProjectPayload): Promise<Project> => {
  const { data } = await axiosInstance.post<Project>('/projects', payload);
  return data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/projects/${id}`);
};
