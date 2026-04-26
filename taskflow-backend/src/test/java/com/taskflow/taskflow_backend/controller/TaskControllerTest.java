package com.taskflow.taskflow_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.taskflow_backend.dto.request.CreateTaskRequest;
import com.taskflow.taskflow_backend.dto.request.UpdateTaskStatusRequest;
import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.enums.TaskPriority;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.exception.InvalidStatusTransitionException;
import com.taskflow.taskflow_backend.service.TaskService;
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
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TaskControllerTest — 7 tests
 *
 * Uses @SpringBootTest + @AutoConfigureMockMvc to load the full application
 * context
 * and hit real endpoints through the HTTP layer, service and database together.
 * TaskService is replaced with a Mockito bean so no real MongoDB connection is
 * needed.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("TaskController Integration Tests")
class TaskControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private TaskService taskService;

        private TaskResponse mockTaskResponse;
        @MockitoBean
        private com.taskflow.taskflow_backend.util.JwtUtil jwtUtil;

        @BeforeEach
        void setUp() {
                mockTaskResponse = new TaskResponse();
                mockTaskResponse.setId("task-001");
                mockTaskResponse.setTitle("Implement login feature");
                mockTaskResponse.setDescription("Create JWT-based auth");
                mockTaskResponse.setStatus(TaskStatus.TODO);
                mockTaskResponse.setPriority(TaskPriority.HIGH);
                mockTaskResponse.setProjectId("project-001");
                mockTaskResponse.setCreatedAt(LocalDateTime.now());
                mockTaskResponse.setUpdatedAt(LocalDateTime.now());
        }

        // Test 1

        @Test
        @DisplayName("getTasksByProject_Returns200WithList: GET /api/projects/{id}/tasks → 200 + JSON array")
        void getTasksByProject_Returns200WithList() throws Exception {
                when(taskService.getTasksByProjectId("project-001"))
                                .thenReturn(List.of(mockTaskResponse));

                mockMvc.perform(get("/api/projects/project-001/tasks"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$[0].id").value("task-001"))
                                .andExpect(jsonPath("$[0].title").value("Implement login feature"))
                                .andExpect(jsonPath("$[0].status").value("TODO"));
        }

        // Test 2

        @Test
        @DisplayName("getTasksByProject_EmptyProject_ReturnsEmptyList: No tasks → []")
        void getTasksByProject_EmptyProject_ReturnsEmptyList() throws Exception {
                when(taskService.getTasksByProjectId("project-empty"))
                                .thenReturn(Collections.emptyList());

                mockMvc.perform(get("/api/projects/project-empty/tasks"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$").isEmpty());
        }

        // Test 3

        @Test
        @DisplayName("createTask_ValidPayload_Returns201: POST → 201 + TaskResponse body")
        void createTask_ValidPayload_Returns201() throws Exception {
                CreateTaskRequest request = new CreateTaskRequest(
                                "Implement login feature",
                                "Create JWT-based auth",
                                TaskPriority.HIGH,
                                null,
                                null);

                when(taskService.createTask(eq("project-001"), any(CreateTaskRequest.class)))
                                .thenReturn(mockTaskResponse);

                mockMvc.perform(post("/api/projects/project-001/tasks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value("task-001"))
                                .andExpect(jsonPath("$.title").value("Implement login feature"))
                                .andExpect(jsonPath("$.status").value("TODO"))
                                .andExpect(jsonPath("$.priority").value("HIGH"));
        }

        // Test 4

        @Test
        @DisplayName("createTask_MissingTitle_Returns400: Blank title → 400 validation error")
        void createTask_MissingTitle_Returns400() throws Exception {
                CreateTaskRequest request = new CreateTaskRequest(
                                "", // blank title — violates @NotBlank
                                "Some description",
                                TaskPriority.MEDIUM,
                                null,
                                null);

                mockMvc.perform(post("/api/projects/project-001/tasks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        // Test 5

        @Test
        @DisplayName("updateTaskStatus_ValidTransition_Returns200: PATCH /api/tasks/{id}/status → 200")
        void updateTaskStatus_ValidTransition_Returns200() throws Exception {
                TaskResponse updatedResponse = new TaskResponse();
                updatedResponse.setId("task-001");
                updatedResponse.setTitle("Implement login feature");
                updatedResponse.setStatus(TaskStatus.IN_PROGRESS);
                updatedResponse.setProjectId("project-001");

                UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.IN_PROGRESS);

                when(taskService.updateTaskStatus(eq("task-001"), eq(TaskStatus.IN_PROGRESS)))
                                .thenReturn(updatedResponse);

                mockMvc.perform(patch("/api/tasks/task-001/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value("task-001"))
                                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        }

        // Test 6

        @Test
        @DisplayName("updateTaskStatus_InvalidTransition_Returns400: TODO→DONE → 400")
        void updateTaskStatus_InvalidTransition_Returns400() throws Exception {
                UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.DONE);

                when(taskService.updateTaskStatus(eq("task-001"), eq(TaskStatus.DONE)))
                                .thenThrow(new InvalidStatusTransitionException(
                                                "Cannot transition from TODO to DONE"));

                mockMvc.perform(patch("/api/tasks/task-001/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Cannot transition from TODO to DONE"));
        }

        // Test 7

        @Test
        @DisplayName("deleteTask_Returns204: DELETE /api/tasks/{id} → 204")
        void deleteTask_Returns204() throws Exception {
                doNothing().when(taskService).deleteTask("task-001");

                mockMvc.perform(delete("/api/tasks/task-001"))
                                .andExpect(status().isNoContent());
        }
}
