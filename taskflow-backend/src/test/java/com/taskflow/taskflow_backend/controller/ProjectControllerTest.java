package com.taskflow.taskflow_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.taskflow_backend.dto.request.CreateProjectRequest;
import com.taskflow.taskflow_backend.dto.response.ProjectResponse;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
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

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ProjectController Tests")
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

    private ProjectResponse mockProjectResponse;

    @BeforeEach
    void setUp() {
        mockProjectResponse = new ProjectResponse(
                "project-001",
                "Project Alpha",
                "Main project",
                null,
                3,
                2,
                LocalDateTime.now());
    }

    private Principal authPrincipal() {
        return new UsernamePasswordAuthenticationToken("john@example.com", null);
    }

    // Test 1
    @Test
    @DisplayName("getAllProjects_Returns200: GET /api/projects -> 200 + array")
    void getAllProjects_Returns200() throws Exception {
        when(projectService.getAllProjectsForUser("john@example.com"))
                .thenReturn(List.of(mockProjectResponse));

        mockMvc.perform(get("/api/projects").principal(authPrincipal()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("project-001"))
                .andExpect(jsonPath("$[0].name").value("Project Alpha"));
    }

    // Test 2
    @Test
    @DisplayName("createProject_ValidPayload_Returns201: POST -> 201 + body")
    void createProject_ValidPayload_Returns201() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest(
                "Project Alpha",
                "Main project",
                null);

        when(projectService.createProject(any(CreateProjectRequest.class), eq("john@example.com")))
                .thenReturn(mockProjectResponse);

        mockMvc.perform(post("/api/projects")
                .principal(authPrincipal())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("project-001"))
                .andExpect(jsonPath("$.name").value("Project Alpha"));
    }

    // Test 3
    @Test
    @DisplayName("createProject_MissingName_Returns400: Blank name -> 400")
    void createProject_MissingName_Returns400() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest(
                "",
                "Main project",
                null);

        mockMvc.perform(post("/api/projects")
                .principal(authPrincipal())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // Test 4
    @Test
    @DisplayName("getProjectById_Found_Returns200: GET /api/projects/{id} -> 200")
    void getProjectById_Found_Returns200() throws Exception {
        when(projectService.getProjectById("project-001"))
                .thenReturn(mockProjectResponse);

        mockMvc.perform(get("/api/projects/project-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("project-001"))
                .andExpect(jsonPath("$.name").value("Project Alpha"));
    }

    // Test 5
    @Test
    @DisplayName("getProjectById_NotFound_Returns404: Fake ID -> 404")
    void getProjectById_NotFound_Returns404() throws Exception {
        when(projectService.getProjectById("project-999"))
                .thenThrow(new ProjectNotFoundException("Project not found: project-999"));

        mockMvc.perform(get("/api/projects/project-999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Project not found: project-999"));
    }

    // Test 6
    @Test
    @DisplayName("deleteProject_Returns204: DELETE -> 204")
    void deleteProject_Returns204() throws Exception {
        doNothing().when(projectService).deleteProject("project-001");

        mockMvc.perform(delete("/api/projects/project-001"))
                .andExpect(status().isNoContent());
    }
}
