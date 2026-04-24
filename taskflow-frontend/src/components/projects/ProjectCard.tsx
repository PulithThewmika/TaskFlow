import React from 'react';
import type { Project } from '../../types/project.types';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div
      className="project-card"
      onClick={() => navigate(`/projects/${project.id}/board`)}
      style={{ borderLeft: `4px solid ${project.colorTag || '#3B82F6'}` }}
    >
      <h3 className="project-card-name">{project.name}</h3>
      {project.description && (
        <p className="project-card-description">{project.description}</p>
      )}
      <div className="project-card-meta">
        <span>{project.taskCount} tasks</span>
        <span>{project.memberCount} members</span>
      </div>
    </div>
  );
};

export default ProjectCard;
