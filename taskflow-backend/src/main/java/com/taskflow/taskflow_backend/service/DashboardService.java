package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.model.Task;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final TaskRepository taskRepository;

    public DashboardService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public DashboardStatsResponse getStats() {
        long total = taskRepository.count();
        long todo = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long inReview = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long done = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long overdue = taskRepository.findAll().stream()
                .filter(t -> t.getDeadline() != null
                          && t.getDeadline().isBefore(LocalDate.now())
                          && t.getStatus() != TaskStatus.DONE)
                .count();

        return new DashboardStatsResponse(total, todo, inProgress, inReview, done, overdue);
    }
}
