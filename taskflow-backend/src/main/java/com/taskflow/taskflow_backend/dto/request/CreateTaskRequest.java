package com.taskflow.taskflow_backend.dto.request;

import com.taskflow.taskflow_backend.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private TaskPriority priority;

    private LocalDate deadline;

    private String assigneeId;

    // Constructors
    public CreateTaskRequest() {}

    public CreateTaskRequest(String title, String description, TaskPriority priority,
                             LocalDate deadline, String assigneeId) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.deadline = deadline;
        this.assigneeId = assigneeId;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
}
