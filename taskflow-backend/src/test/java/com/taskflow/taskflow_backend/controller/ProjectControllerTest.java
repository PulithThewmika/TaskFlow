package com.taskflow.taskflow_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.taskflow_backend.dto.request.CreateProjectRequest;
import com.taskflow.taskflow_backend.dto.response.ProjectResponse;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.service.ProjectService;
import com.taskflow.taskflow_backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ProjectControllerTest — 6 tests
 *
 * Uses @SpringBootTest + @AutoConfigureMockMvc to load the full application context
 * and hit real endpoints through the HTTP layer, service and database together.
 * ProjectService is replaced with a Mockito bean so no real MongoDB connection is needed.
 *
 * Authentication strategy: JwtUtil is mocked so that a fake "test-token" Bearer header
 * is accepted by the real JwtAuthenticationFilter and resolves to "john@example.com",
 * allowing endpoints that read Authentication.getName() to work correctly without
 * disabling the security filter chain.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@DisplayName("ProjectController Integration Tests")
class ProjectControllerTest {

    private static final String TEST_TOKEN = "test-token";
    private static final String TEST_EMAIL = "john@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

    // Mock JwtUtil so the real JwtAuthenticationFilter accepts TEST_TOKEN
    // and populates Authentication with TEST_EMAIL — no real JWT signing needed.
    @MockitoBean
    private JwtUtil jwtUtil;

    private ProjectResponse mockProjectResponse;

    @BeforeEach
    void setUp() {
        // Make the JWT filter authenticate TEST_TOKEN as john@example.com
        when(jwtUtil.extractEmail(TEST_TOKEN)).thenReturn(TEST_EMAIL);
        when(jwtUtil.isTokenValid(TEST_TOKEN, TEST_EMAIL)).thenReturn(true);

        mockProjectResponse = new ProjectResponse(
                "project-001",
                "Project Alpha",
                "Main project",
                null,
                3,
                2,
                LocalDateTime.now());
    }

    /** Helper: adds the Bearer authorization header to every request that needs auth. */
    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder withAuth(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder) {
        return builder.header("Authorization", "Bearer " + TEST_TOKEN);
    }

    // ── Test 1 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllProjects_Returns200: GET /api/projects → 200 + array")
    void getAllProjects_Returns200() throws Exception {
        when(projectService.getAllProjectsForUser(TEST_EMAIL))
                .thenReturn(List.of(mockProjectResponse));

        mockMvc.perform(withAuth(get("/api/projects")))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("project-001"))
                .andExpect(jsonPath("$[0].name").value("Project Alpha"));
    }

    // ── Test 2 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createProject_ValidPayload_Returns201: POST → 201 + body")
    void createProject_ValidPayload_Returns201() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest(
                "Project Alpha",
                "Main project",
                null);

        when(projectService.createProject(any(CreateProjectRequest.class), eq(TEST_EMAIL)))
                .thenReturn(mockProjectResponse);

        mockMvc.perform(withAuth(post("/api/projects"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("project-001"))
                .andExpect(jsonPath("$.name").value("Project Alpha"))
                .andExpect(jsonPath("$.description").value("Main project"));
    }

    // ── Test 3 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createProject_MissingName_Returns400: Blank name → 400")
    void createProject_MissingName_Returns400() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest(
                "",            // blank name — violates @NotBlank
                "Main project",
                null);

        mockMvc.perform(withAuth(post("/api/projects"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ── Test 4 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getProjectById_Found_Returns200: GET /api/projects/{id} → 200")
    void getProjectById_Found_Returns200() throws Exception {
        when(projectService.getProjectById("project-001"))
                .thenReturn(mockProjectResponse);

        mockMvc.perform(withAuth(get("/api/projects/project-001")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("project-001"))
                .andExpect(jsonPath("$.name").value("Project Alpha"))
                .andExpect(jsonPath("$.taskCount").value(3))
                .andExpect(jsonPath("$.memberCount").value(2));
    }

    // ── Test 5 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getProjectById_NotFound_Returns404: Fake ID → 404")
    void getProjectById_NotFound_Returns404() throws Exception {
        when(projectService.getProjectById("project-999"))
                .thenThrow(new ProjectNotFoundException("Project not found: project-999"));

        mockMvc.perform(withAuth(get("/api/projects/project-999")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Project not found: project-999"));
    }

    // ── Test 6 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteProject_Returns204: DELETE /api/projects/{id} → 204")
    void deleteProject_Returns204() throws Exception {
        doNothing().when(projectService).deleteProject("project-001");

        mockMvc.perform(withAuth(delete("/api/projects/project-001")))
                .andExpect(status().isNoContent());
    }
}