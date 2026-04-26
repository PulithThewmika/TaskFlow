package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.CreateTaskRequest;
import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.enums.TaskPriority;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.exception.InvalidStatusTransitionException;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.exception.TaskNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Section 3.2 — TaskServiceTest
 * 10 integration tests verifying task creation, status transitions, queries and deletion.
 * Uses embedded MongoDB via Flapdoodle (auto-configured in "test" profile).
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("3.2 TaskService Integration Tests")
class TaskServiceTest {

    @Autowired TaskService taskService;
    @Autowired TaskRepository taskRepository;
    @Autowired ProjectRepository projectRepository;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private Project testProject;

    @BeforeEach
    void setup() {
        taskRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();
        testProject = projectRepository.save(new Project("Test Project", "desc", "#6366f1"));
    }

    // ─── Helper ─────────────────────────────────────────────────────────────
    private User savedUser(String name, String email) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("password123"));
        return userRepository.save(u);
    }

    // ─── 1 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("1. createTask_Success_ReturnsTaskResponse — valid request → TaskResponse with correct title, status=TODO")
    void createTask_Success_ReturnsTaskResponse() {
        CreateTaskRequest request = new CreateTaskRequest(
            "Fix login bug", "desc", TaskPriority.HIGH, null, null);

        TaskResponse response = taskService.createTask(testProject.getId(), request);

        assertAll(
            () -> assertNotNull(response.getId()),
            () -> assertEquals("Fix login bug", response.getTitle()),
            () -> assertEquals(TaskStatus.TODO, response.getStatus())
        );
    }

    // ─── 2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("2. createTask_DefaultStatusIsTodo — new task always starts as TODO")
    void createTask_DefaultStatusIsTodo() {
        CreateTaskRequest request = new CreateTaskRequest(
            "New Task", null, TaskPriority.LOW, null, null);

        TaskResponse response = taskService.createTask(testProject.getId(), request);

        assertEquals(TaskStatus.TODO, response.getStatus(),
            "Freshly created task must default to TODO status");
    }

    // ─── 3 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("3. createTask_WithAssignee_SetsAssigneeInfo — provide assigneeId → response has assigneeName")
    void createTask_WithAssignee_SetsAssigneeInfo() {
        User assignee = savedUser("Lakdinu", "lakdinu@test.com");
        CreateTaskRequest request = new CreateTaskRequest(
            "Design UI", null, TaskPriority.MEDIUM, null, assignee.getId());

        TaskResponse response = taskService.createTask(testProject.getId(), request);

        assertAll(
            () -> assertEquals(assignee.getId(), response.getAssigneeId()),
            () -> assertEquals("Lakdinu", response.getAssigneeName())
        );
    }

    // ─── 4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("4. createTask_InvalidProject_ThrowsProjectNotFoundException — non-existent projectId → ProjectNotFoundException")
    void createTask_InvalidProject_ThrowsProjectNotFoundException() {
        CreateTaskRequest request = new CreateTaskRequest(
            "Orphan Task", null, TaskPriority.LOW, null, null);

        assertThrows(ProjectNotFoundException.class,
            () -> taskService.createTask("non-existent-project-id", request));
    }

    // ─── 5 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("5. createTask_InvalidAssignee_ThrowsException — non-existent assigneeId → RuntimeException")
    void createTask_InvalidAssignee_ThrowsException() {
        CreateTaskRequest request = new CreateTaskRequest(
            "Ghost Task", null, TaskPriority.LOW, null, "non-existent-user-id");

        assertThrows(RuntimeException.class,
            () -> taskService.createTask(testProject.getId(), request));
    }

    // ─── 6 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("6. updateTaskStatus_TodoToInProgress_Success — TODO → IN_PROGRESS updates correctly")
    void updateTaskStatus_TodoToInProgress_Success() {
        TaskResponse created = taskService.createTask(testProject.getId(),
            new CreateTaskRequest("Task A", null, TaskPriority.LOW, null, null));

        TaskResponse updated = taskService.updateTaskStatus(created.getId(), TaskStatus.IN_PROGRESS);

        assertEquals(TaskStatus.IN_PROGRESS, updated.getStatus());
    }

    // ─── 7 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("7. updateTaskStatus_InvalidTransition_ThrowsException — TODO → DONE → InvalidStatusTransitionException")
    void updateTaskStatus_InvalidTransition_ThrowsException() {
        TaskResponse created = taskService.createTask(testProject.getId(),
            new CreateTaskRequest("Task B", null, TaskPriority.LOW, null, null));

        assertThrows(InvalidStatusTransitionException.class,
            () -> taskService.updateTaskStatus(created.getId(), TaskStatus.DONE));
    }

    // ─── 8 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("8. updateTaskStatus_NonExistentTask_ThrowsException — fake taskId → TaskNotFoundException")
    void updateTaskStatus_NonExistentTask_ThrowsException() {
        assertThrows(TaskNotFoundException.class,
            () -> taskService.updateTaskStatus("non-existent-task-id", TaskStatus.IN_PROGRESS));
    }

    // ─── 9 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("9. getTasksByProjectId_ReturnsCorrectTasks — create 3 tasks → getByProject returns 3")
    void getTasksByProjectId_ReturnsCorrectTasks() {
        taskService.createTask(testProject.getId(),
            new CreateTaskRequest("Task 1", null, TaskPriority.LOW, null, null));
        taskService.createTask(testProject.getId(),
            new CreateTaskRequest("Task 2", null, TaskPriority.LOW, null, null));
        taskService.createTask(testProject.getId(),
            new CreateTaskRequest("Task 3", null, TaskPriority.LOW, null, null));

        List<TaskResponse> tasks = taskService.getTasksByProjectId(testProject.getId());

        assertEquals(3, tasks.size(), "Should return all 3 tasks for the project");
    }

    // ─── 10 ─────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("10. deleteTask_RemovesFromDatabase — delete → findById returns empty")
    void deleteTask_RemovesFromDatabase() {
        TaskResponse created = taskService.createTask(testProject.getId(),
            new CreateTaskRequest("To Delete", null, TaskPriority.LOW, null, null));

        taskService.deleteTask(created.getId());

        Optional<?> found = taskRepository.findById(created.getId());
        assertTrue(found.isEmpty(), "Deleted task should not exist in the database");
    }
}
