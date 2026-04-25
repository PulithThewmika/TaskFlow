package com.taskflow.taskflow_backend.repository;

import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByProjectId(String projectId);
    List<Task> findByProjectIdAndStatus(String projectId, TaskStatus status);
    List<Task> findByAssigneeId(String assigneeId);
    long countByProjectIdAndStatus(String projectId, TaskStatus status);
}
