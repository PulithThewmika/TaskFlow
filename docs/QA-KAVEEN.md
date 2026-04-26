# Backend Testing Report: QA-KAVEEN

## Overview

This document summarizes the controller and exception test coverage implemented under the `QA-KAVEEN` branch for the TaskFlow backend.

- **Developer / QA Contributor:** Kaveen
- **Branch:** `QA-KAVEEN`
- **Focus Area:** Controller integration tests + global exception handling tests
- **Frameworks:** JUnit 5, Spring Boot Test, MockMvc, Mockito
- **Test Profile:** `test` profile with Embedded MongoDB test configuration

## Scope Covered

This report includes only:

1. Controller test classes in `src/test/java/.../controller`
2. Exception handler test class in `src/test/java/.../exception`

## Overall Metrics

- **Controller Test Files:** 6
- **Exception Test Files:** 1
- **Total Files in This Scope:** 7
- **Total Test Cases:** 36

Breakdown:

- Controllers: 31 tests
- Exception handling: 5 tests

---

## Controller Test Coverage

### 1) Auth Controller

**File:** `taskflow-backend/src/test/java/com/taskflow/taskflow_backend/controller/AuthControllerTest.java`  
**Type:** `@WebMvcTest` + MockMvc (service mocked)  
**Total:** 7 tests

- `register_ValidRequest_Returns201`
- `register_MissingName_Returns400`
- `register_InvalidEmail_Returns400`
- `register_ShortPassword_Returns400`
- `register_DuplicateEmail_Returns500`
- `login_ValidCredentials_Returns200`
- `login_InvalidCredentials_Returns500`

What this validates:

- Registration success and validation constraints
- Login success and invalid credential error handling

### 2) Task Controller

**File:** `taskflow-backend/src/test/java/com/taskflow/taskflow_backend/controller/TaskControllerTest.java`  
**Type:** `@SpringBootTest` + MockMvc (`TaskService` mocked)  
**Total:** 7 tests

- `getTasksByProject_Returns200WithList`
- `getTasksByProject_EmptyProject_ReturnsEmptyList`
- `createTask_ValidPayload_Returns201`
- `createTask_MissingTitle_Returns400`
- `updateTaskStatus_ValidTransition_Returns200`
- `updateTaskStatus_InvalidTransition_Returns400`
- `deleteTask_Returns204`

What this validates:

- Task list retrieval, create, status transition behavior, and delete flow

### 3) Project Controller

**File:** `taskflow-backend/src/test/java/com/taskflow/taskflow_backend/controller/ProjectControllerTest.java`  
**Type:** `@SpringBootTest` + MockMvc (`ProjectService` mocked)  
**Total:** 6 tests

- `getAllProjects_Returns200`
- `createProject_ValidPayload_Returns201`
- `createProject_MissingName_Returns400`
- `getProjectById_Found_Returns200`
- `getProjectById_NotFound_Returns404`
- `deleteProject_Returns204`

What this validates:

- Project CRUD API response behavior including not-found paths

### 4) Member Controller

**File:** `taskflow-backend/src/test/java/com/taskflow/taskflow_backend/controller/MemberControllerTest.java`  
**Type:** `@SpringBootTest` + MockMvc (`MemberService` mocked)  
**Total:** 5 tests

- `getMembers_Returns200`
- `addMember_ValidEmail_Returns201`
- `addMember_InvalidEmail_ReturnsError`
- `addMember_Duplicate_ReturnsError`
- `removeMember_Returns204`

What this validates:

- Member listing, addition, duplicate handling, invalid email handling, and removal

### 5) Dashboard Controller

**File:** `taskflow-backend/src/test/java/com/taskflow/taskflow_backend/controller/DashboardControllerTest.java`  
**Type:** `@SpringBootTest` + MockMvc (`DashboardService` mocked)  
**Total:** 3 tests

- `getStats_Returns200`
- `getStats_HasAllFields`
- `getStats_ReflectsRealData`

What this validates:

- Dashboard stats endpoint availability, response schema fields, and data mapping correctness

### 6) Health Controller

**File:** `taskflow-backend/src/test/java/com/taskflow/taskflow_backend/controller/HealthControllerTest.java`  
**Type:** `@SpringBootTest` + MockMvc  
**Total:** 3 tests

- `health_Returns200`
- `health_HasStatusUp`
- `health_HasTimestamp`

What this validates:

- Health endpoint accessibility and basic response contract

---

## Exception Handling Coverage

### Global Exception Handler

**File:** `taskflow-backend/src/test/java/com/taskflow/taskflow_backend/exception/GlobalExceptionHandlerTest.java`  
**Type:** `@SpringBootTest` + MockMvc (services mocked to throw targeted exceptions)  
**Total:** 5 tests

- `projectNotFound_Returns404WithMessage`
- `taskNotFound_Returns404WithMessage`
- `invalidTransition_Returns400WithMessage`
- `validationError_Returns400WithFieldErrors`
- `runtimeError_Returns500WithMessage`

What this validates:

- Standardized error payloads for 404, 400 validation/business errors, and 500 runtime errors
- Presence of important error fields (`status`, `error`, `message`, `timestamp`, and field-level `errors` where applicable)

---

## Security + Test Strategy Notes

- Most controller tests use Bearer token simulation by mocking `JwtUtil` while keeping Spring Security filter chain behavior.
- Test profile is set to `test` to ensure isolated, safe execution.
- `@MockitoBean` is used to isolate controller contracts from service/repository implementation details.

## Suggested Verification Command

From `taskflow-backend`:

```bash
./mvnw test
```

Or to run only controller + exception tests:

```bash
./mvnw -Dtest="*ControllerTest,*ExceptionHandlerTest" test
```
