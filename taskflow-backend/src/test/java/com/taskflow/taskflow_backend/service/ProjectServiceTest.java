package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.CreateProjectRequest;
import com.taskflow.taskflow_backend.dto.response.ProjectResponse;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Section 3.3 — ProjectServiceTest
 * 7 integration tests verifying project creation, retrieval and deletion.
 * Uses embedded MongoDB via Flapdoodle (auto-configured in "test" profile).
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("3.3 ProjectService Integration Tests")
class ProjectServiceTest {

    @Autowired
    ProjectService projectService;

    @Autowired
    ProjectRepository projectRepository;

    @BeforeEach
    void setup() {
        projectRepository.deleteAll();
    }

    // ─── 1 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("1. createProject_Success — valid request → saved with correct name, description, colorTag")
    void createProject_Success() {
        CreateProjectRequest request =
            new CreateProjectRequest("My Project", "A test project", "#6366f1");

        ProjectResponse response = projectService.createProject(request);

        assertAll(
            () -> assertNotNull(response),
            () -> assertEquals("My Project",      response.getName()),
            () -> assertEquals("A test project",  response.getDescription()),
            () -> assertEquals("#6366f1",          response.getColorTag())
        );
    }

    // ─── 2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("2. createProject_GeneratesId — saved project has a non-null ID")
    void createProject_GeneratesId() {
        CreateProjectRequest request =
            new CreateProjectRequest("ID Project", "desc", "#000000");

        ProjectResponse response = projectService.createProject(request);

        assertNotNull(response.getId(), "MongoDB should auto-generate a non-null ID");
        assertFalse(response.getId().isBlank());
    }

    // ─── 3 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("3. getAllProjects_ReturnsAll — save 3 projects → getAllProjects returns 3")
    void getAllProjects_ReturnsAll() {
        projectService.createProject(new CreateProjectRequest("Alpha",   "d", "#111111"));
        projectService.createProject(new CreateProjectRequest("Beta",    "d", "#222222"));
        projectService.createProject(new CreateProjectRequest("Gamma",   "d", "#333333"));

        List<ProjectResponse> projects = projectService.getAllProjects();

        assertEquals(3, projects.size(), "getAllProjects should return all 3 saved projects");
    }

    // ─── 4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("4. getAllProjects_EmptyDb_ReturnsEmpty — no projects → returns empty list")
    void getAllProjects_EmptyDb_ReturnsEmpty() {
        List<ProjectResponse> projects = projectService.getAllProjects();

        assertNotNull(projects);
        assertTrue(projects.isEmpty(), "Should return an empty list when no projects exist");
    }

    // ─── 5 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("5. getProjectById_Found — save then getById → returns correct project")
    void getProjectById_Found() {
        ProjectResponse saved = projectService.createProject(
            new CreateProjectRequest("Find Me", "desc", "#abcdef"));

        ProjectResponse found = projectService.getProjectById(saved.getId());

        assertAll(
            () -> assertEquals(saved.getId(),   found.getId()),
            () -> assertEquals("Find Me",        found.getName()),
            () -> assertEquals("#abcdef",         found.getColorTag())
        );
    }

    // ─── 6 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("6. getProjectById_NotFound_ThrowsException — fake ID → ProjectNotFoundException")
    void getProjectById_NotFound_ThrowsException() {
        assertThrows(ProjectNotFoundException.class,
            () -> projectService.getProjectById("non-existent-project-id"));
    }

    // ─── 7 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("7. deleteProject_RemovesFromDb — delete → existsById returns false")
    void deleteProject_RemovesFromDb() {
        ProjectResponse saved = projectService.createProject(
            new CreateProjectRequest("To Delete", "desc", "#ffffff"));

        projectService.deleteProject(saved.getId());

        assertFalse(projectRepository.existsById(saved.getId()),
            "Project should no longer exist in the database after deletion");
    }
}
