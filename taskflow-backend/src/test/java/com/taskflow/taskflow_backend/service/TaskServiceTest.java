package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.CreateTaskRequest;
import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.enums.TaskPriority;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.Task;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private TaskService taskService;

    // Fixture: reusable test data
    private Project testProject;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");

        testTask = new Task();
        testTask.setId(1L);
        testTask.setTitle("Fix login bug");
        testTask.setStatus(TaskStatus.TODO);
        testTask.setProject(testProject);
    }

    @Test
    @DisplayName("createTask: should save task and return response when project exists")
    void createTask_shouldSaveAndReturn_whenProjectExists() {
        CreateTaskRequest request = new CreateTaskRequest("Fix login bug", "desc",
                                                          TaskPriority.HIGH, null, null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskResponse response = taskService.createTask(1L, request);

        assertAll(
            () -> assertNotNull(response),
            () -> assertEquals("Fix login bug", response.getTitle()),
            () -> assertEquals(TaskStatus.TODO, response.getStatus())
        );
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("createTask: should throw ProjectNotFoundException when project missing")
    void createTask_shouldThrow_whenProjectNotFound() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());
        CreateTaskRequest request = new CreateTaskRequest("Task", null, TaskPriority.LOW, null, null);

        assertThrows(ProjectNotFoundException.class,
            () -> taskService.createTask(99L, request));

        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateTaskStatus: should throw when DB throws unexpected exception")
    void updateTaskStatus_shouldThrow_whenRepositoryFails() {
        when(taskRepository.findById(1L)).thenThrow(new RuntimeException("DB connection lost"));

        assertThrows(RuntimeException.class,
            () -> taskService.updateTaskStatus(1L, TaskStatus.IN_PROGRESS));
    }

    @Test
    @DisplayName("getOverdueTasks: should return only tasks past deadline and not DONE")
    void getOverdueTasks_shouldReturnOnlyOverdueTasks() {
        Task overdueTask = new Task();
        overdueTask.setDeadline(LocalDate.now().minusDays(3));
        overdueTask.setStatus(TaskStatus.IN_PROGRESS);
        overdueTask.setProject(testProject);

        Task doneTask = new Task();
        doneTask.setDeadline(LocalDate.now().minusDays(1));
        doneTask.setStatus(TaskStatus.DONE);  // Should be excluded
        doneTask.setProject(testProject);

        Task futureTask = new Task();
        futureTask.setDeadline(LocalDate.now().plusDays(5));
        futureTask.setStatus(TaskStatus.TODO); // Should be excluded
        futureTask.setProject(testProject);

        when(taskRepository.findByProjectId(1L))
            .thenReturn(List.of(overdueTask, doneTask, futureTask));

        List<TaskResponse> overdue = taskService.getOverdueTasks(1L);

        assertEquals(1, overdue.size());
        verify(taskRepository, times(1)).findByProjectId(1L);
    }
}
