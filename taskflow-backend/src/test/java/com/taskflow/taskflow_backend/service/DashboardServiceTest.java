package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.Task;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
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

    private Project testProject;

    @BeforeEach
    void setup() {
        taskRepository.deleteAll();
        projectRepository.deleteAll();
        testProject = projectRepository.save(new Project("Dashboard Project", "desc", "#6366f1"));
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

        DashboardStatsResponse stats = dashboardService.getStats();

        assertAll(
            () -> assertEquals(5,  stats.getTotal(),      "total should be 5"),
            () -> assertEquals(2,  stats.getTodo(),       "todo count should be 2"),
            () -> assertEquals(1,  stats.getInProgress(), "inProgress count should be 1"),
            () -> assertEquals(1,  stats.getInReview(),   "inReview count should be 1"),
            () -> assertEquals(1,  stats.getDone(),       "done count should be 1")
        );
    }

    // ─── 2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("2. getStats_EmptyDb_AllZeros — no tasks → all counts = 0, total = 0")
    void getStats_EmptyDb_AllZeros() {
        DashboardStatsResponse stats = dashboardService.getStats();

        assertAll(
            () -> assertEquals(0, stats.getTotal(),      "total should be 0"),
            () -> assertEquals(0, stats.getTodo(),       "todo should be 0"),
            () -> assertEquals(0, stats.getInProgress(), "inProgress should be 0"),
            () -> assertEquals(0, stats.getInReview(),   "inReview should be 0"),
            () -> assertEquals(0, stats.getDone(),       "done should be 0"),
            () -> assertEquals(0, stats.getOverdue(),    "overdue should be 0")
        );
    }

    // ─── 3 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("3. getStats_OverdueDetection — past deadline + TODO status → overdueCount > 0")
    void getStats_OverdueDetection() {
        LocalDate pastDeadline = LocalDate.now().minusDays(5);
        createTask(TaskStatus.TODO, pastDeadline);          // OVERDUE — should be counted
        createTask(TaskStatus.IN_PROGRESS, pastDeadline);  // OVERDUE — should be counted

        DashboardStatsResponse stats = dashboardService.getStats();

        assertTrue(stats.getOverdue() > 0,
            "Tasks with past deadline and non-DONE status must increment overdueCount");
        assertEquals(2, stats.getOverdue());
    }

    // ─── 4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("4. getStats_DoneNotOverdue — past deadline + DONE status → NOT counted as overdue")
    void getStats_DoneNotOverdue() {
        LocalDate pastDeadline = LocalDate.now().minusDays(3);
        createTask(TaskStatus.DONE, pastDeadline); // DONE — must NOT count as overdue

        DashboardStatsResponse stats = dashboardService.getStats();

        assertEquals(0, stats.getOverdue(),
            "DONE tasks must never be counted as overdue even if deadline has passed");
    }
}
