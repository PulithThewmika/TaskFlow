package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.CreateTaskRequest;
import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.exception.TaskNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.Task;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import com.taskflow.taskflow_backend.util.TaskStatusTransitionValidator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(Long projectId, CreateTaskRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDeadline(request.getDeadline());
        task.setProject(project);
        task.setStatus(TaskStatus.TODO);

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    public TaskResponse updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));

        TaskStatusTransitionValidator.validate(task.getStatus(), newStatus);
        task.setStatus(newStatus);
        return mapToResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getOverdueTasks(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
            .filter(t -> t.getDeadline() != null
                      && t.getDeadline().isBefore(LocalDate.now())
                      && t.getStatus() != TaskStatus.DONE)
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new TaskNotFoundException("Task not found: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    private TaskResponse mapToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDeadline(task.getDeadline());
        response.setProjectId(task.getProject() != null ? task.getProject().getId() : null);
        response.setAssigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null);
        response.setAssigneeName(task.getAssignee() != null ? task.getAssignee().getName() : null);
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
}
