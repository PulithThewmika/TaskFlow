package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.CreateProjectRequest;
import com.taskflow.taskflow_backend.dto.response.ProjectResponse;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.ProjectMember;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.MemberRepository;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          MemberRepository memberRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public ProjectResponse createProject(CreateProjectRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColorTag(request.getColorTag());
        project.setOwnerId(owner.getId());

        Project saved = projectRepository.save(project);

        // Auto-add the creator as OWNER member
        ProjectMember ownerMember = new ProjectMember(saved, owner, "OWNER");
        memberRepository.save(ownerMember);

        return mapToResponse(saved);
    }

    public List<ProjectResponse> getAllProjectsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Get projects owned by user
        Set<String> projectIds = new LinkedHashSet<>();
        List<Project> ownedProjects = projectRepository.findByOwnerId(user.getId());
        ownedProjects.forEach(p -> projectIds.add(p.getId()));

        // Get projects where user is a member
        List<ProjectMember> memberships = memberRepository.findByUserId(user.getId());
        memberships.forEach(m -> projectIds.add(m.getProject().getId()));

        // Fetch all unique projects and map
        return projectIds.stream()
                .map(id -> projectRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Keep backward compatibility for getProjectById (already checked by membership/ownership in real use)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + id));
        return mapToResponse(project);
    }

    public void deleteProject(String id) {
        if (!projectRepository.existsById(id)) {
            throw new ProjectNotFoundException("Project not found: " + id);
        }
        // Cascade delete: remove all tasks and members for this project
        taskRepository.deleteByProjectId(id);
        memberRepository.deleteByProjectId(id);
        projectRepository.deleteById(id);
    }

    private ProjectResponse mapToResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setColorTag(project.getColorTag());

        // Count tasks and members from their repositories for accurate counts
        long taskCount = taskRepository.findByProjectId(project.getId()).size();
        long memberCount = memberRepository.findByProjectId(project.getId()).size();

        response.setTaskCount((int) taskCount);
        response.setMemberCount((int) memberCount);
        response.setCreatedAt(project.getCreatedAt());
        return response;
    }
}
