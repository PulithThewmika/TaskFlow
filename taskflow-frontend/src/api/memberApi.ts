import axiosInstance from './axiosInstance';

export interface ProjectMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface ProjectMember {
  id: string;
  role: string;
  joinedAt: string;
  user: ProjectMemberUser;
}

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const { data } = await axiosInstance.get<ProjectMember[]>(`/projects/${projectId}/members`);
  return data;
};

export const addProjectMember = async (projectId: string, email: string): Promise<ProjectMember> => {
  const { data } = await axiosInstance.post<ProjectMember>(`/projects/${projectId}/members`, { email });
  return data;
};

export const removeProjectMember = async (projectId: string, userId: string): Promise<void> => {
  await axiosInstance.delete(`/projects/${projectId}/members/${userId}`);
};
