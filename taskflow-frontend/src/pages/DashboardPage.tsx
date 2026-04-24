import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboardApi';
import type { DashboardStats } from '../api/dashboardApi';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/projects/ProjectCard';
import Spinner from '../components/ui/Spinner';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { projects, loading: projectsLoading } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        console.error('Failed to load dashboard stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={() => navigate('/projects')}>View All Projects</button>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats?.totalTasks ?? '—'}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.inProgressCount ?? '—'}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.overdueCount ?? '—'}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.doneCount ?? '—'}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="dashboard-section">
        <h2>Recent Projects</h2>
        {projectsLoading ? (
          <Spinner />
        ) : (
          <div className="project-grid">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
