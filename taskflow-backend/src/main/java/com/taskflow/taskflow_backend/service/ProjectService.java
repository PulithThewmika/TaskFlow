package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.CreateProjectRequest;
import com.taskflow.taskflow_backend.dto.response.ProjectResponse;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public ProjectResponse createProject(CreateProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColorTag(request.getColorTag());

        Project saved = projectRepository.save(project);
        return mapToResponse(saved);
    }

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + id));
        return mapToResponse(project);
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ProjectNotFoundException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }

    private ProjectResponse mapToResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setColorTag(project.getColorTag());
        response.setTaskCount(project.getTasks() != null ? project.getTasks().size() : 0);
        response.setMemberCount(project.getMembers() != null ? project.getMembers().size() : 0);
        response.setCreatedAt(project.getCreatedAt());
        return response;
    }
}
