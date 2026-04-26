package com.taskflow.taskflow_backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.taskflow.taskflow_backend.service.TaskService;

import java.util.Collections;

import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("TaskController Integration Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private com.taskflow.taskflow_backend.util.JwtUtil jwtUtil;

    @Test
    @DisplayName("GET /api/projects/1/tasks should be accessible")
    void getTasks_shouldReturnOk() throws Exception {
        when(taskService.getTasksByProjectId("1")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/projects/1/tasks"))
                .andExpect(status().isOk());
    }
}
