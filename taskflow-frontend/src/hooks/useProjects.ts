import { useState, useEffect, useCallback } from 'react';
import { getProjects, createProject, deleteProject } from '../api/projectApi';
import type { Project, CreateProjectPayload } from '../types/project.types';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (payload: CreateProjectPayload) => {
    const newProject = await createProject(payload);
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const removeProject = async (id: number) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, loading, error, fetchProjects, addProject, removeProject };
};
