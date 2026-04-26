package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.ProjectMember;
import com.taskflow.taskflow_backend.model.Task;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.MemberRepository;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public MemberService(MemberRepository memberRepository,
                         ProjectRepository projectRepository,
                         UserRepository userRepository,
                         TaskRepository taskRepository) {
        this.memberRepository = memberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public ProjectMember addMember(String projectId, String email) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (memberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember member = new ProjectMember(project, user, "MEMBER");
        return memberRepository.save(member);
    }

    public List<ProjectMember> getMembers(String projectId) {
        return memberRepository.findByProjectId(projectId);
    }

    public void removeMember(String projectId, String userId) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        // BUG 7 FIX: Unassign tasks assigned to this user in this project
        List<Task> assignedTasks = taskRepository.findByProjectIdAndAssigneeId(projectId, userId);
        for (Task task : assignedTasks) {
            task.setAssignee(null);
            taskRepository.save(task);
        }

        memberRepository.delete(member);
    }
}
