import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import Spinner from '../components/ui/Spinner';

const ProjectsPage: React.FC = () => {
  const { projects, loading, addProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <button onClick={() => setIsModalOpen(true)}>New Project</button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          await addProject(payload);
        }}
      />
    </div>
  );
};

export default ProjectsPage;
