package com.taskflow.taskflow_backend.util;

import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.exception.InvalidStatusTransitionException;

import java.util.Map;
import java.util.Set;

public class TaskStatusTransitionValidator {

    private static final Map<TaskStatus, Set<TaskStatus>> ALLOWED_TRANSITIONS = Map.of(
        TaskStatus.TODO,        Set.of(TaskStatus.IN_PROGRESS),
        TaskStatus.IN_PROGRESS, Set.of(TaskStatus.IN_REVIEW, TaskStatus.TODO),
        TaskStatus.IN_REVIEW,   Set.of(TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.TODO),
        TaskStatus.DONE,        Set.of(TaskStatus.IN_REVIEW, TaskStatus.IN_PROGRESS, TaskStatus.TODO)
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
