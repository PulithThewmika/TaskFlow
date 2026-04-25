package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.ProjectMember;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.MemberRepository;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public MemberService(MemberRepository memberRepository,
                         ProjectRepository projectRepository,
                         UserRepository userRepository) {
        this.memberRepository = memberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public ProjectMember addMember(String projectId, String email) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (memberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new RuntimeException("User is already a member of this project");
        }

        ProjectMember member = new ProjectMember(project, user, "MEMBER");
        return memberRepository.save(member);
    }

    public List<ProjectMember> getMembers(String projectId) {
        return memberRepository.findByProjectId(projectId);
    }

    public void removeMember(String projectId, String userId) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        memberRepository.delete(member);
    }
}
