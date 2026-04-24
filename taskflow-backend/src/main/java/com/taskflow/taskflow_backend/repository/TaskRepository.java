package com.taskflow.taskflow_backend.repository;

import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
    List<Task> findByAssigneeId(Long assigneeId);
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
}
