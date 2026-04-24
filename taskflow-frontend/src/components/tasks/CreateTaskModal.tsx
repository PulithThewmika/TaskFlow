import React, { useState } from 'react';
import { TaskPriority } from '../../types/task.types';
import type { CreateTaskPayload } from '../../types/task.types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');

  const handleSubmit = async () => {
    // Validation
    setTitleError('');
    setDeadlineError('');

    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    if (deadline && new Date(deadline) < new Date(new Date().toDateString())) {
      setDeadlineError('Deadline cannot be in the past');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        priority,
        deadline: deadline || undefined,
      });
      // Reset form
      setTitle('');
      setDescription('');
      setPriority(TaskPriority.MEDIUM);
      setDeadline('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <div className="form-group">
        <label>Title</label>
        <input
          data-testid="task-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
        />
        {titleError && <span data-testid="title-error" className="error">{titleError}</span>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </div>

      <div className="form-group">
        <label>Priority</label>
        <select
          data-testid="task-priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          {Object.values(TaskPriority).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Deadline</label>
        <input
          data-testid="task-deadline-input"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        {deadlineError && <span data-testid="deadline-error" className="error">{deadlineError}</span>}
      </div>

      <Button onClick={handleSubmit} isLoading={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Task'}
      </Button>
    </Modal>
  );
};

export default CreateTaskModal;
