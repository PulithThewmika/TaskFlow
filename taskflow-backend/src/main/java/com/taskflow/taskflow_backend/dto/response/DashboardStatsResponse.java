package com.taskflow.taskflow_backend.dto.response;

public class DashboardStatsResponse {

    private long totalTasks;
    private long todoCount;
    private long inProgressCount;
    private long inReviewCount;
    private long doneCount;
    private long overdueCount;

    // Constructors
    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalTasks, long todoCount, long inProgressCount,
                                   long inReviewCount, long doneCount, long overdueCount) {
        this.totalTasks = totalTasks;
        this.todoCount = todoCount;
        this.inProgressCount = inProgressCount;
        this.inReviewCount = inReviewCount;
        this.doneCount = doneCount;
        this.overdueCount = overdueCount;
    }

    // Getters and Setters
    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }

    public long getTodoCount() { return todoCount; }
    public void setTodoCount(long todoCount) { this.todoCount = todoCount; }

    public long getInProgressCount() { return inProgressCount; }
    public void setInProgressCount(long inProgressCount) { this.inProgressCount = inProgressCount; }

    public long getInReviewCount() { return inReviewCount; }
    public void setInReviewCount(long inReviewCount) { this.inReviewCount = inReviewCount; }

    public long getDoneCount() { return doneCount; }
    public void setDoneCount(long doneCount) { this.doneCount = doneCount; }

    public long getOverdueCount() { return overdueCount; }
    public void setOverdueCount(long overdueCount) { this.overdueCount = overdueCount; }
}
