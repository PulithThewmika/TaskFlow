package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.enums.TaskStatus;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.ProjectMember;
import com.taskflow.taskflow_backend.model.Task;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.MemberRepository;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    public DashboardService(TaskRepository taskRepository,
                            ProjectRepository projectRepository,
                            MemberRepository memberRepository,
                            UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public DashboardStatsResponse getStatsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get projects owned by user
        Set<String> projectIds = new LinkedHashSet<>();
        List<Project> ownedProjects = projectRepository.findByOwnerId(user.getId());
        ownedProjects.forEach(p -> projectIds.add(p.getId()));

        // Get projects where user is a member
        List<ProjectMember> memberships = memberRepository.findByUserId(user.getId());
        memberships.forEach(m -> projectIds.add(m.getProject().getId()));

        // Collect all tasks for these projects
        List<Task> allTasks = projectIds.stream()
                .flatMap(projectId -> taskRepository.findByProjectId(projectId).stream())
                .collect(Collectors.toList());

        long total = allTasks.size();
        long todo = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long inReview = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long done = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long overdue = allTasks.stream().filter(t -> t.getDeadline() != null
                && t.getDeadline().isBefore(LocalDate.now())
                && t.getStatus() != TaskStatus.DONE).count();

        return new DashboardStatsResponse(total, todo, inProgress, inReview, done, overdue);
    }
    
    // Backward compatibility if needed, though controller uses getStatsForUser now
    public DashboardStatsResponse getStats() {
        return getStatsForUser("");
    }
}
