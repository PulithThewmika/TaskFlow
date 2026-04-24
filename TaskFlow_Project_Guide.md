# TaskFlow — Comprehensive Project Guide
## SE3112 Advanced Software Engineering | Testing Implementation Assignment

---

## 1. PROJECT OVERVIEW

**TaskFlow** is a full-stack Team Task Management System built with:
- **Backend:** Spring Boot 3.x + MySQL
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Testing:** JUnit 5 + Mockito (Unit) | Playwright (E2E/UI)

### Core Concept
Teams can create projects, manage tasks across a Kanban-style board, assign members, set priorities and deadlines, and track progress — similar to a lightweight Jira.

---

## 2. FEATURES TO IMPLEMENT

### 2.1 Authentication
- User registration (name, email, password)
- User login (JWT token-based)
- Protected routes (frontend + backend)

### 2.2 Project Management
- Create a project (name, description, color tag)
- List all projects belonging to the logged-in user's team
- Delete a project (cascade deletes tasks)
- View single project detail

### 2.3 Task Management (Core Feature)
- Create a task (title, description, priority, deadline, assignee)
- Update task status: `TODO → IN_PROGRESS → IN_REVIEW → DONE`
- Update task priority: `LOW | MEDIUM | HIGH | CRITICAL`
- Assign/unassign a task to a team member
- Delete a task
- Filter tasks by status, priority, assignee

### 2.4 Team Members
- Invite member to a project by email
- List members of a project
- Remove a member from a project

### 2.5 Dashboard
- Total tasks count per status
- Overdue tasks count
- Recent activity feed (last 10 actions)

---

## 3. BACKEND — SPRING BOOT PROJECT STRUCTURE

```
taskflow-backend/
├── src/
│   ├── main/
│   │   ├── java/com/taskflow/
│   │   │   ├── TaskflowApplication.java
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java          # JWT security filter chain
│   │   │   │   ├── JwtConfig.java               # JWT secret, expiry config
│   │   │   │   └── CorsConfig.java              # Allow React frontend origin
│   │   │   │
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java          # POST /api/auth/register, /login
│   │   │   │   ├── ProjectController.java       # CRUD /api/projects
│   │   │   │   ├── TaskController.java          # CRUD /api/projects/{id}/tasks
│   │   │   │   ├── MemberController.java        # /api/projects/{id}/members
│   │   │   │   └── DashboardController.java     # GET /api/dashboard/stats
│   │   │   │
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── ProjectService.java
│   │   │   │   ├── TaskService.java             # Core business logic lives here
│   │   │   │   ├── MemberService.java
│   │   │   │   └── DashboardService.java
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProjectRepository.java
│   │   │   │   ├── TaskRepository.java
│   │   │   │   └── MemberRepository.java
│   │   │   │
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── Project.java
│   │   │   │   ├── Task.java
│   │   │   │   └── ProjectMember.java
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── CreateProjectRequest.java
│   │   │   │   │   ├── CreateTaskRequest.java
│   │   │   │   │   └── UpdateTaskStatusRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── AuthResponse.java
│   │   │   │       ├── ProjectResponse.java
│   │   │   │       ├── TaskResponse.java
│   │   │   │       └── DashboardStatsResponse.java
│   │   │   │
│   │   │   ├── enums/
│   │   │   │   ├── TaskStatus.java              # TODO, IN_PROGRESS, IN_REVIEW, DONE
│   │   │   │   └── TaskPriority.java            # LOW, MEDIUM, HIGH, CRITICAL
│   │   │   │
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java  # @ControllerAdvice
│   │   │   │   ├── TaskNotFoundException.java
│   │   │   │   ├── ProjectNotFoundException.java
│   │   │   │   ├── InvalidStatusTransitionException.java
│   │   │   │   └── UnauthorizedAccessException.java
│   │   │   │
│   │   │   └── util/
│   │   │       ├── JwtUtil.java
│   │   │       └── TaskStatusTransitionValidator.java  # Core logic for S1 tests
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       └── application-test.yml             # H2 in-memory for tests
│   │
│   └── test/
│       └── java/com/taskflow/
│           ├── service/
│           │   ├── TaskServiceTest.java          # Student 2 — Mockito
│           │   └── ProjectServiceTest.java
│           │
│           ├── util/
│           │   └── TaskStatusTransitionValidatorTest.java  # Student 1 — Parameterized
│           │
│           └── controller/
│               └── TaskControllerTest.java       # Integration (optional bonus)
│
├── pom.xml
└── README.md
```

---

## 4. KEY BACKEND FILES — CONTENT GUIDE

### 4.1 Enums

```java
// TaskStatus.java
public enum TaskStatus {
    TODO, IN_PROGRESS, IN_REVIEW, DONE
}

// TaskPriority.java
public enum TaskPriority {
    LOW, MEDIUM, HIGH, CRITICAL
}
```

### 4.2 Task Entity (Task.java)

```java
@Entity
@Table(name = "tasks")
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority = TaskPriority.MEDIUM;

    private LocalDate deadline;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // getters, setters
}
```

### 4.3 Status Transition Validator (KEY for Student 1 tests)

```java
// TaskStatusTransitionValidator.java
public class TaskStatusTransitionValidator {

    private static final Map<TaskStatus, Set<TaskStatus>> ALLOWED_TRANSITIONS = Map.of(
        TaskStatus.TODO,        Set.of(TaskStatus.IN_PROGRESS),
        TaskStatus.IN_PROGRESS, Set.of(TaskStatus.IN_REVIEW, TaskStatus.TODO),
        TaskStatus.IN_REVIEW,   Set.of(TaskStatus.DONE, TaskStatus.IN_PROGRESS),
        TaskStatus.DONE,        Set.of()  // Terminal state — no further transitions
    );

    public static boolean isValidTransition(TaskStatus from, TaskStatus to) {
        if (from == null || to == null) return false;
        return ALLOWED_TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }

    public static void validate(TaskStatus from, TaskStatus to) {
        if (!isValidTransition(from, to)) {
            throw new InvalidStatusTransitionException(
                "Cannot transition from " + from + " to " + to
            );
        }
    }
}
```

### 4.4 TaskService (KEY for Student 2 Mockito tests)

```java
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(Long projectId, CreateTaskRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDeadline(request.getDeadline());
        task.setProject(project);
        task.setStatus(TaskStatus.TODO);

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    public TaskResponse updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new TaskNotFoundException("Task not found: " + taskId));

        TaskStatusTransitionValidator.validate(task.getStatus(), newStatus);
        task.setStatus(newStatus);
        return mapToResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getOverdueTasks(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
            .filter(t -> t.getDeadline() != null
                      && t.getDeadline().isBefore(LocalDate.now())
                      && t.getStatus() != TaskStatus.DONE)
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // mapToResponse, deleteTask, etc.
}
```

### 4.5 application-test.yml (H2 for unit tests)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
```

---

## 5. TEST FILES — DETAILED STRUCTURE

### Student 1 — Parameterized Testing (JUnit 5)

```java
// TaskStatusTransitionValidatorTest.java
@DisplayName("Task Status Transition Validator Tests")
class TaskStatusTransitionValidatorTest {

    // VALID transitions — should return true
    @ParameterizedTest(name = "{0} → {1} should be VALID")
    @CsvSource({
        "TODO, IN_PROGRESS",
        "IN_PROGRESS, IN_REVIEW",
        "IN_PROGRESS, TODO",
        "IN_REVIEW, DONE",
        "IN_REVIEW, IN_PROGRESS"
    })
    void validTransitions_shouldReturnTrue(TaskStatus from, TaskStatus to) {
        assertTrue(TaskStatusTransitionValidator.isValidTransition(from, to));
    }

    // INVALID transitions — should return false
    @ParameterizedTest(name = "{0} → {1} should be INVALID")
    @CsvSource({
        "TODO, DONE",
        "TODO, IN_REVIEW",
        "DONE, TODO",
        "DONE, IN_PROGRESS",
        "DONE, IN_REVIEW"
    })
    void invalidTransitions_shouldReturnFalse(TaskStatus from, TaskStatus to) {
        assertFalse(TaskStatusTransitionValidator.isValidTransition(from, to));
    }

    // Null handling
    @ParameterizedTest(name = "null input [{0}, {1}] should return false")
    @MethodSource("nullInputProvider")
    void nullInputs_shouldReturnFalse(TaskStatus from, TaskStatus to) {
        assertFalse(TaskStatusTransitionValidator.isValidTransition(from, to));
    }

    static Stream<Arguments> nullInputProvider() {
        return Stream.of(
            Arguments.of(null, TaskStatus.TODO),
            Arguments.of(TaskStatus.TODO, null),
            Arguments.of(null, null)
        );
    }

    // Validate throws exception on bad transition
    @Test
    @DisplayName("validate() should throw InvalidStatusTransitionException for DONE → TODO")
    void validate_shouldThrowException_whenTransitionIsInvalid() {
        assertThrows(InvalidStatusTransitionException.class,
            () -> TaskStatusTransitionValidator.validate(TaskStatus.DONE, TaskStatus.TODO));
    }
}
```

### Student 2 — Mockito Fixtures (JUnit 5)

```java
// TaskServiceTest.java
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

        Task doneTask = new Task();
        doneTask.setDeadline(LocalDate.now().minusDays(1));
        doneTask.setStatus(TaskStatus.DONE);  // Should be excluded

        Task futureTask = new Task();
        futureTask.setDeadline(LocalDate.now().plusDays(5));
        futureTask.setStatus(TaskStatus.TODO); // Should be excluded

        when(taskRepository.findByProjectId(1L))
            .thenReturn(List.of(overdueTask, doneTask, futureTask));

        List<TaskResponse> overdue = taskService.getOverdueTasks(1L);

        assertEquals(1, overdue.size());
        verify(taskRepository, times(1)).findByProjectId(1L);
    }
}
```

### Student 3 — Playwright E2E Full Flow

```javascript
// tests/e2e/task-board-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Board — Full User Journey', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByTestId('email-input').fill('demo@taskflow.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create project, add task, and verify on board', async ({ page }) => {
    // Step 1: Create a project
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByTestId('project-name-input').fill('E2E Test Project');
    await page.getByTestId('project-desc-input').fill('Created by Playwright');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Step 2: Verify project appears
    await expect(page.getByText('E2E Test Project')).toBeVisible();

    // Step 3: Navigate into project and create a task
    await page.getByText('E2E Test Project').click();
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByTestId('task-title-input').fill('Implement login feature');
    await page.getByTestId('task-priority-select').selectOption('HIGH');
    await page.getByRole('button', { name: 'Create Task' }).click();

    // Step 4: Verify task on Kanban board under TODO column
    const todoColumn = page.getByTestId('column-TODO');
    await expect(todoColumn.getByText('Implement login feature')).toBeVisible();

    // Step 5: Move task to IN_PROGRESS
    await page.getByTestId('task-card-Implement login feature')
              .getByRole('button', { name: 'Move to In Progress' }).click();

    // Step 6: Verify it moved
    const inProgressColumn = page.getByTestId('column-IN_PROGRESS');
    await expect(inProgressColumn.getByText('Implement login feature')).toBeVisible();
  });
});
```

### Student 4 — Playwright Edge Cases & Validation

```javascript
// tests/e2e/task-validation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Form — Edge Cases & Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('demo@taskflow.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.goto('/projects/1/board');
  });

  test('should show validation error when task title is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByRole('button', { name: 'Create Task' }).click();  // Submit empty

    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('title-error')).toHaveText('Title is required');
  });

  test('should show empty state when no tasks exist', async ({ page }) => {
    // Navigate to a fresh project
    await page.goto('/projects/999/board');
    await expect(page.getByTestId('empty-board-state')).toBeVisible();
    await expect(page.getByText('No tasks yet')).toBeVisible();
  });

  test('should disable Create button when submitting', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByTestId('task-title-input').fill('Async test task');
    await page.getByRole('button', { name: 'Create Task' }).click();

    // Button should be disabled during submission
    await expect(page.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });

  test('should reject past deadline date', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByTestId('task-title-input').fill('Past deadline task');
    await page.getByTestId('task-deadline-input').fill('2020-01-01');
    await page.getByRole('button', { name: 'Create Task' }).click();

    await expect(page.getByTestId('deadline-error'))
      .toHaveText('Deadline cannot be in the past');
  });
});
```

---

## 6. PLAYWRIGHT CONFIG

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',   // Vite dev server
    headless: false,                    // Show browser for demo
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

---

## 7. FRONTEND — REACT PROJECT STRUCTURE

```
taskflow-frontend/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx
│   ├── App.tsx                          # Router setup
│   │
│   ├── api/
│   │   ├── axiosInstance.ts             # Base axios with JWT interceptor
│   │   ├── authApi.ts                   # login, register calls
│   │   ├── projectApi.ts               # CRUD project calls
│   │   ├── taskApi.ts                  # CRUD task calls
│   │   └── dashboardApi.ts
│   │
│   ├── components/
│   │   ├── ui/                         # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx               # Priority / Status badges
│   │   │   ├── Spinner.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             # Left nav
│   │   │   ├── TopBar.tsx              # User avatar, breadcrumb
│   │   │   └── AppLayout.tsx           # Sidebar + TopBar wrapper
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx            # Single task card on board
│   │   │   ├── TaskColumn.tsx          # Kanban column (TODO, etc.)
│   │   │   ├── TaskBoard.tsx           # Full Kanban board
│   │   │   ├── CreateTaskModal.tsx     # Form modal for new task
│   │   │   └── TaskDetailDrawer.tsx    # Side drawer — task details
│   │   │
│   │   └── projects/
│   │       ├── ProjectCard.tsx
│   │       └── CreateProjectModal.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectsPage.tsx            # List of all projects
│   │   └── BoardPage.tsx               # Kanban board for one project
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useProjects.ts
│   │
│   ├── context/
│   │   └── AuthContext.tsx             # JWT token, user state
│   │
│   ├── types/
│   │   ├── task.types.ts
│   │   ├── project.types.ts
│   │   └── auth.types.ts
│   │
│   └── utils/
│       ├── dateUtils.ts                # isOverdue(), formatDeadline()
│       └── statusUtils.ts             # getStatusColor(), getNextStatus()
│
├── tests/
│   └── e2e/                            # Playwright tests live here
│       ├── task-board-flow.spec.ts     # Student 3
│       └── task-validation.spec.ts     # Student 4
│
├── playwright.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 8. FRONTEND PAGES & FLOWS

### Page 1: Login Page (`/login`)
- Email + password inputs (`data-testid="email-input"`, `data-testid="password-input"`)
- Submit button
- "Don't have an account? Register" link
- On success → redirect to `/dashboard`
- On fail → show inline error message

### Page 2: Register Page (`/register`)
- Name, email, password, confirm password
- Validation: password match, email format
- On success → redirect to `/login`

### Page 3: Dashboard Page (`/dashboard`)
- Stats row: Total Tasks | In Progress | Overdue | Done
- Recent projects grid (max 6 cards)
- Quick "New Project" button

### Page 4: Projects Page (`/projects`)
- Grid of ProjectCards
- Each card: project name, color tag, task count, member avatars
- "New Project" button → opens CreateProjectModal

### Page 5: Board Page (`/projects/:id/board`) ← MAIN PAGE
- TopBar shows project name + member list
- 4 Kanban columns: TODO | IN_PROGRESS | IN_REVIEW | DONE
  - Each column has a header with count badge
  - TaskCards inside each column
  - "Add Task" button at bottom of TODO column
- TaskCard shows: title, priority badge, assignee avatar, deadline
- Click TaskCard → opens TaskDetailDrawer (right side)
- TaskDetailDrawer: full details, status change dropdown, delete button

### data-testid Map (for Playwright)
```
email-input               → Login email field
password-input            → Login password field
project-name-input        → Create project name
project-desc-input        → Create project description
task-title-input          → Create task title field
task-priority-select      → Priority dropdown
task-deadline-input       → Deadline date picker
title-error               → Validation error for title
deadline-error            → Validation error for deadline
empty-board-state         → Empty board illustration container
column-TODO               → TODO kanban column wrapper
column-IN_PROGRESS        → IN_PROGRESS column wrapper
column-IN_REVIEW          → IN_REVIEW column wrapper
column-DONE               → DONE column wrapper
task-card-{title}         → Individual task card by title
```

---

## 9. API ENDPOINTS REFERENCE

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| DELETE | /api/projects/{id} | Delete project |
| GET | /api/projects/{id}/tasks | Get tasks (filterable) |
| POST | /api/projects/{id}/tasks | Create task |
| PATCH | /api/tasks/{id}/status | Update task status |
| PATCH | /api/tasks/{id} | Update task details |
| DELETE | /api/tasks/{id} | Delete task |
| GET | /api/projects/{id}/members | List members |
| POST | /api/projects/{id}/members | Add member by email |
| GET | /api/dashboard/stats | Get summary stats |

---

## 10. pom.xml — KEY DEPENDENCIES

```xml
<!-- Spring Boot Starter Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Security + JWT -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>

<!-- JPA + MySQL -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Testing -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
    <!-- Includes JUnit 5 + Mockito automatically -->
</dependency>

<!-- H2 for test profile -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 11. PACKAGE.JSON — FRONTEND KEY DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@playwright/test": "^1.42.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 12. DIVISION OF WORK SUMMARY

| Student | Tool | Feature | Key Files |
|---|---|---|---|
| S1 | JUnit 5 | Parameterized Status Transition Tests | `TaskStatusTransitionValidatorTest.java` |
| S2 | JUnit 5 | Mockito Fixtures & Service Layer Tests | `TaskServiceTest.java` |
| S3 | Playwright | E2E Full User Journey (Create → Move) | `task-board-flow.spec.ts` |
| S4 | Playwright | UI Validation & Edge Case Tests | `task-validation.spec.ts` |

---

## 13. BUILD & RUN COMMANDS

```bash
# Backend
cd taskflow-backend
./mvnw spring-boot:run

# Run JUnit tests
./mvnw test

# Frontend
cd taskflow-frontend
npm install
npm run dev

# Install Playwright browsers (one time)
npx playwright install chromium

# Run Playwright tests (headed — for demo)
npx playwright test --headed

# Run specific test file
npx playwright test task-board-flow.spec.ts --headed
```

---

## 14. README TEMPLATE

```markdown
# TaskFlow — Team Task Management System

## Team Members & Contributions
| Student | ID | Role | Testing Feature |
|---|---|---|---|
| [Name] | IT23XXXXXX | Backend + Testing | JUnit 5 Parameterized Tests |
| [Name] | IT23XXXXXX | Backend + Testing | JUnit 5 Mockito Tests |
| [Name] | IT23XXXXXX | Frontend + Testing | Playwright E2E Flow |
| [Name] | IT23XXXXXX | Frontend + Testing | Playwright Validation Tests |

## Tech Stack
- Backend: Spring Boot 3.x, MySQL, JWT
- Frontend: React 18, TypeScript, Tailwind CSS
- Testing: JUnit 5 + Mockito, Playwright

## How to Run
[see Section 13 above]

## Test Categories
- Unit/Component Testing: JUnit 5
- E2E/UI Testing: Playwright
```
