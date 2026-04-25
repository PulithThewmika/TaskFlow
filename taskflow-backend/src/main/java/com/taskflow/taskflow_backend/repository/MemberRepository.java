package com.taskflow.taskflow_backend.repository;

import com.taskflow.taskflow_backend.model.ProjectMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends MongoRepository<ProjectMember, String> {
    List<ProjectMember> findByProjectId(String projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(String projectId, String userId);
    boolean existsByProjectIdAndUserId(String projectId, String userId);
}
