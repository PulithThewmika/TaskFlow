import React, { useState } from 'react';
import type { CreateProjectPayload } from '../../types/project.types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProjectPayload) => Promise<void>;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorTag, setColorTag] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name, description, colorTag });
      setName('');
      setDescription('');
      setColorTag('#3B82F6');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <div className="form-group">
        <label>Project Name</label>
        <input
          data-testid="project-name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          data-testid="project-desc-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
        />
      </div>

      <div className="form-group">
        <label>Color Tag</label>
        <input
          type="color"
          value={colorTag}
          onChange={(e) => setColorTag(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} isLoading={isSubmitting}>
        Create Project
      </Button>
    </Modal>
  );
};

export default CreateProjectModal;
