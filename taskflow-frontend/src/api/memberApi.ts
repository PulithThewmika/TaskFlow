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
