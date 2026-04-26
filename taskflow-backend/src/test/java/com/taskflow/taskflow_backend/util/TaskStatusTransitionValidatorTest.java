package com.taskflow.taskflow_backend.util;

import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.exception.InvalidStatusTransitionException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Section 3.6 — TaskStatusTransitionValidatorTest
 * 8 plain JUnit 5 tests — no Spring context needed.
 * Calls static methods directly on TaskStatusTransitionValidator.
 */
@DisplayName("3.6 TaskStatusTransitionValidator Tests")
class TaskStatusTransitionValidatorTest {

    // ─── VALID transitions (should return true) ──────────────────────────────

    @Test
    @DisplayName("1. todoToInProgress_IsValid — isValidTransition(TODO, IN_PROGRESS) → true")
    void todoToInProgress_IsValid() {
        assertTrue(TaskStatusTransitionValidator.isValidTransition(
                TaskStatus.TODO, TaskStatus.IN_PROGRESS));
    }

    @Test
    @DisplayName("2. inProgressToInReview_IsValid — isValidTransition(IN_PROGRESS, IN_REVIEW) → true")
    void inProgressToInReview_IsValid() {
        assertTrue(TaskStatusTransitionValidator.isValidTransition(
                TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW));
    }

    @Test
    @DisplayName("3. inProgressToTodo_IsValid — isValidTransition(IN_PROGRESS, TODO) → true (rollback allowed)")
    void inProgressToTodo_IsValid() {
        assertTrue(TaskStatusTransitionValidator.isValidTransition(
                TaskStatus.IN_PROGRESS, TaskStatus.TODO));
    }

    @Test
    @DisplayName("4. inReviewToDone_IsValid — isValidTransition(IN_REVIEW, DONE) → true")
    void inReviewToDone_IsValid() {
        assertTrue(TaskStatusTransitionValidator.isValidTransition(
                TaskStatus.IN_REVIEW, TaskStatus.DONE));
    }

    @Test
    @DisplayName("5. inReviewToInProgress_IsValid — isValidTransition(IN_REVIEW, IN_PROGRESS) → true (send back allowed)")
    void inReviewToInProgress_IsValid() {
        assertTrue(TaskStatusTransitionValidator.isValidTransition(
                TaskStatus.IN_REVIEW, TaskStatus.IN_PROGRESS));
    }

    // ─── INVALID transitions (should return false) ───────────────────────────

    @Test
    @DisplayName("6. todoToDone_IsInvalid — isValidTransition(TODO, DONE) → false (skipping not allowed)")
    void todoToDone_IsInvalid() {
        assertFalse(TaskStatusTransitionValidator.isValidTransition(
                TaskStatus.TODO, TaskStatus.DONE));
    }

    @Test
    @DisplayName("7. doneToAny_IsValid — DONE → TODO / IN_PROGRESS / IN_REVIEW all return true")
    void doneToAny_IsValid() {
        assertAll(
            () -> assertTrue(TaskStatusTransitionValidator.isValidTransition(
                    TaskStatus.DONE, TaskStatus.TODO),        "DONE → TODO must be true"),
            () -> assertTrue(TaskStatusTransitionValidator.isValidTransition(
                    TaskStatus.DONE, TaskStatus.IN_PROGRESS), "DONE → IN_PROGRESS must be true"),
            () -> assertTrue(TaskStatusTransitionValidator.isValidTransition(
                    TaskStatus.DONE, TaskStatus.IN_REVIEW),   "DONE → IN_REVIEW must be true")
        );
    }

    // ─── validate() throws on invalid transition ─────────────────────────────

    @Test
    @DisplayName("8. validate_InvalidTransition_ThrowsException — validate(TODO, DONE) throws InvalidStatusTransitionException")
    void validate_InvalidTransition_ThrowsException() {
        assertThrows(InvalidStatusTransitionException.class,
            () -> TaskStatusTransitionValidator.validate(TaskStatus.TODO, TaskStatus.DONE));
    }
}
