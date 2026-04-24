import axiosInstance from './axiosInstance';

export interface DashboardStats {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
  overdueCount: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await axiosInstance.get<DashboardStats>('/dashboard/stats');
  return data;
};
