package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.CreateProjectRequest;
import com.taskflow.taskflow_backend.dto.response.ProjectResponse;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectService Unit Tests")
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project testProject;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setId("1");
        testProject.setName("Test Project");
        testProject.setDescription("Test description");
        testProject.setColorTag("#3B82F6");
    }

    @Test
    @DisplayName("createProject: should save and return project response")
    void createProject_shouldSaveAndReturn() {
        CreateProjectRequest request = new CreateProjectRequest("Test Project", "Test description", "#3B82F6");
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        ProjectResponse response = projectService.createProject(request);

        assertNotNull(response);
        assertEquals("Test Project", response.getName());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    @DisplayName("getProjectById: should throw ProjectNotFoundException when not found")
    void getProjectById_shouldThrow_whenNotFound() {
        when(projectRepository.findById("99")).thenReturn(Optional.empty());

        assertThrows(ProjectNotFoundException.class,
            () -> projectService.getProjectById("99"));
    }

    @Test
    @DisplayName("getAllProjects: should return list of project responses")
    void getAllProjects_shouldReturnList() {
        when(projectRepository.findAll()).thenReturn(List.of(testProject));

        List<ProjectResponse> projects = projectService.getAllProjects();

        assertEquals(1, projects.size());
        assertEquals("Test Project", projects.get(0).getName());
    }

    @Test
    @DisplayName("deleteProject: should throw when project not found")
    void deleteProject_shouldThrow_whenNotFound() {
        when(projectRepository.existsById("99")).thenReturn(false);

        assertThrows(ProjectNotFoundException.class,
            () -> projectService.deleteProject("99"));

        verify(projectRepository, never()).deleteById(any());
    }
}
