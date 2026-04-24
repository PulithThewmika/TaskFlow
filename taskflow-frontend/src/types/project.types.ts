export interface Project {
  id: number;
  name: string;
  description: string;
  colorTag: string;
  taskCount: number;
  memberCount: number;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  colorTag?: string;
}
