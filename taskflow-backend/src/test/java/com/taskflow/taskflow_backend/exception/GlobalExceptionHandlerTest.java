package com.taskflow.taskflow_backend.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.taskflow_backend.dto.request.CreateProjectRequest;
import com.taskflow.taskflow_backend.dto.request.RegisterRequest;
import com.taskflow.taskflow_backend.dto.request.UpdateTaskStatusRequest;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.service.AuthService;
import com.taskflow.taskflow_backend.service.ProjectService;
import com.taskflow.taskflow_backend.service.TaskService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * GlobalExceptionHandlerTest — 5 tests
 *
 * Uses @SpringBootTest + @AutoConfigureMockMvc to test real error scenarios
 * handled by the GlobalExceptionHandler.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@DisplayName("GlobalExceptionHandler Integration Tests")
class GlobalExceptionHandlerTest {

    private static final String TEST_TOKEN = "test-token";
    private static final String TEST_EMAIL = "john@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        // Setup mock authentication for secured endpoints
        when(jwtUtil.extractEmail(TEST_TOKEN)).thenReturn(TEST_EMAIL);
        when(jwtUtil.isTokenValid(TEST_TOKEN, TEST_EMAIL)).thenReturn(true);
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder withAuth(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder) {
        return builder.header("Authorization", "Bearer " + TEST_TOKEN);
    }

    // Test 1 

    @Test
    @DisplayName("projectNotFound_Returns404WithMessage: GET non-existent project → 404 + error body")
    void projectNotFound_Returns404WithMessage() throws Exception {
        when(projectService.getProjectById("unknown-project"))
                .thenThrow(new ProjectNotFoundException("Project not found: unknown-project"));

        mockMvc.perform(withAuth(get("/api/projects/unknown-project")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Project not found: unknown-project"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // Test 2 

    @Test
    @DisplayName("taskNotFound_Returns404WithMessage: PATCH non-existent task → 404")
    void taskNotFound_Returns404WithMessage() throws Exception {
        UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.IN_PROGRESS);

        when(taskService.updateTaskStatus(eq("unknown-task"), any(TaskStatus.class)))
                .thenThrow(new TaskNotFoundException("Task not found: unknown-task"));

        mockMvc.perform(withAuth(patch("/api/tasks/unknown-task/status"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Task not found: unknown-task"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // Test 3 

    @Test
    @DisplayName("invalidTransition_Returns400WithMessage: PATCH TODO→DONE → 400 + message")
    void invalidTransition_Returns400WithMessage() throws Exception {
        UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.DONE);

        when(taskService.updateTaskStatus(eq("task-1"), any(TaskStatus.class)))
                .thenThrow(new InvalidStatusTransitionException("Cannot transition from TODO to DONE"));

        mockMvc.perform(withAuth(patch("/api/tasks/task-1/status"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Cannot transition from TODO to DONE"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // Test 4 

    @Test
    @DisplayName("validationError_Returns400WithFieldErrors: POST with blank title → 400 + field-level errors")
    void validationError_Returns400WithFieldErrors() throws Exception {
        // Blank name is invalid and will trigger MethodArgumentNotValidException
        CreateProjectRequest request = new CreateProjectRequest("", "Description", null);

        mockMvc.perform(withAuth(post("/api/projects"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // Test 5 

    @Test
    @DisplayName("runtimeError_Returns500WithMessage: Duplicate email register → 500 + message")
    void runtimeError_Returns500WithMessage() throws Exception {
        RegisterRequest request = new RegisterRequest("john", "john@example.com", "password");

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email already in use"));

        // Auth endpoint is public, no withAuth() needed
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("Email already in use"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
