package com.taskflow.taskflow_backend.dto.request;

import com.taskflow.taskflow_backend.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTaskStatusRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;

    // Constructors
    public UpdateTaskStatusRequest() {}

    public UpdateTaskStatusRequest(TaskStatus status) {
        this.status = status;
    }

    // Getters and Setters
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
}
