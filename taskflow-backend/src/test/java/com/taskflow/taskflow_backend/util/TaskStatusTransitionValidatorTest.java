package com.taskflow.taskflow_backend.util;

import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.exception.InvalidStatusTransitionException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

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
