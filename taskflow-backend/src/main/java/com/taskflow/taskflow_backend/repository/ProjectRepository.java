package com.taskflow.taskflow_backend.repository;

import com.taskflow.taskflow_backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByMembersUserId(Long userId);
}
