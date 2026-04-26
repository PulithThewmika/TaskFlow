package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.Task;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Section 3.5 — DashboardServiceTest
 * 4 integration tests verifying statistics computation.
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("3.5 DashboardService Integration Tests")
class DashboardServiceTest {

    @Autowired
    DashboardService dashboardService;

    @Autowired
    TaskRepository taskRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    UserRepository userRepository;

    private Project testProject;
    private User testUser;

    @BeforeEach
    void setup() {
        taskRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setName("Dashboard User");
        testUser.setEmail("dash@test.com");
        testUser.setPassword("password");
        testUser = userRepository.save(testUser);

        testProject = new Project("Dashboard Project", "desc", "#6366f1");
        testProject.setOwnerId(testUser.getId());
        testProject = projectRepository.save(testProject);
    }

    // ─── Helper ─────────────────────────────────────────────────────────────
    private Task createTask(TaskStatus status, LocalDate deadline) {
        Task task = new Task();
        task.setTitle("Task " + status.name());
        task.setStatus(status);
        task.setDeadline(deadline);
        task.setProject(testProject);
        return taskRepository.save(task);
    }

    // ─── 1 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("1. getStats_CorrectCounts — mixed statuses → each count matches exactly")
    void getStats_CorrectCounts() {
        createTask(TaskStatus.TODO,        null);
        createTask(TaskStatus.TODO,        null);
        createTask(TaskStatus.IN_PROGRESS, null);
        createTask(TaskStatus.IN_REVIEW,   null);
        createTask(TaskStatus.DONE,        null);

        DashboardStatsResponse stats = dashboardService.getStatsForUser(testUser.getEmail());

        assertAll(
            () -> assertEquals(5,  stats.getTotalTasks(),      "total should be 5"),
            () -> assertEquals(2,  stats.getTodoCount(),       "todo count should be 2"),
            () -> assertEquals(1,  stats.getInProgressCount(), "inProgress count should be 1"),
            () -> assertEquals(1,  stats.getInReviewCount(),   "inReview count should be 1"),
            () -> assertEquals(1,  stats.getDoneCount(),       "done count should be 1")
        );
    }

    // ─── 2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("2. getStats_EmptyDb_AllZeros — no tasks → all counts = 0, total = 0")
    void getStats_EmptyDb_AllZeros() {
        DashboardStatsResponse stats = dashboardService.getStatsForUser(testUser.getEmail());

        assertAll(
            () -> assertEquals(0, stats.getTotalTasks(),      "total should be 0"),
            () -> assertEquals(0, stats.getTodoCount(),       "todo should be 0"),
            () -> assertEquals(0, stats.getInProgressCount(), "inProgress should be 0"),
            () -> assertEquals(0, stats.getInReviewCount(),   "inReview should be 0"),
            () -> assertEquals(0, stats.getDoneCount(),       "done should be 0"),
            () -> assertEquals(0, stats.getOverdueCount(),    "overdue should be 0")
        );
    }

    // ─── 3 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("3. getStats_OverdueDetection — past deadline + TODO status → overdueCount > 0")
    void getStats_OverdueDetection() {
        LocalDate pastDeadline = LocalDate.now().minusDays(5);
        createTask(TaskStatus.TODO, pastDeadline);          // OVERDUE — should be counted
        createTask(TaskStatus.IN_PROGRESS, pastDeadline);  // OVERDUE — should be counted

        DashboardStatsResponse stats = dashboardService.getStatsForUser(testUser.getEmail());

        assertTrue(stats.getOverdueCount() > 0,
            "Tasks with past deadline and non-DONE status must increment overdueCount");
        assertEquals(2, stats.getOverdueCount());
    }

    // ─── 4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("4. getStats_DoneNotOverdue — past deadline + DONE status → NOT counted as overdue")
    void getStats_DoneNotOverdue() {
        LocalDate pastDeadline = LocalDate.now().minusDays(3);
        createTask(TaskStatus.DONE, pastDeadline); // DONE — must NOT count as overdue

        DashboardStatsResponse stats = dashboardService.getStatsForUser(testUser.getEmail());

        assertEquals(0, stats.getOverdueCount(),
            "DONE tasks must never be counted as overdue even if deadline has passed");
    }
}
