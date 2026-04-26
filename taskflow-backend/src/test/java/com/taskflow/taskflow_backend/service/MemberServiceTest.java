package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.exception.ProjectNotFoundException;
import com.taskflow.taskflow_backend.model.Project;
import com.taskflow.taskflow_backend.model.ProjectMember;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.MemberRepository;
import com.taskflow.taskflow_backend.repository.ProjectRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Section 3.4 — MemberServiceTest
 * 6 integration tests verifying member management (add, list, remove).
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("3.4 MemberService Integration Tests")
class MemberServiceTest {

    @Autowired
    MemberService memberService;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    private Project testProject;
    private User testUser;

    @BeforeEach
    void setup() {
        memberRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        testProject = projectRepository.save(new Project("Test Project", "desc", "#6366f1"));

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("user@test.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser = userRepository.save(testUser);
    }

    // ─── 1 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("1. addMember_Success — valid project + user email → member created with 'MEMBER' role")
    void addMember_Success() {
        ProjectMember member = memberService.addMember(testProject.getId(), testUser.getEmail());

        assertNotNull(member.getId(), "Member should be persisted with an ID");
        assertEquals("MEMBER", member.getRole());
        assertEquals(testUser.getId(), member.getUser().getId());
    }

    // ─── 2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("2. addMember_InvalidProject_ThrowsException — fake projectId → ProjectNotFoundException")
    void addMember_InvalidProject_ThrowsException() {
        assertThrows(ProjectNotFoundException.class,
            () -> memberService.addMember("non-existent-project-id", testUser.getEmail()));
    }

    // ─── 3 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("3. addMember_InvalidEmail_ThrowsException — non-existent email → RuntimeException")
    void addMember_InvalidEmail_ThrowsException() {
        assertThrows(RuntimeException.class,
            () -> memberService.addMember(testProject.getId(), "ghost@test.com"));
    }

    // ─── 4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("4. addMember_Duplicate_ThrowsException — adding the same user twice → 'already a member'")
    void addMember_Duplicate_ThrowsException() {
        memberService.addMember(testProject.getId(), testUser.getEmail());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> memberService.addMember(testProject.getId(), testUser.getEmail()));
        assertTrue(ex.getMessage().toLowerCase().contains("already a member"),
            "Exception message should mention 'already a member'");
    }

    // ─── 5 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("5. getMembers_ReturnsList — add 2 members → getMembers returns list of size 2")
    void getMembers_ReturnsList() {
        // Add a second user
        User secondUser = new User();
        secondUser.setName("Second User");
        secondUser.setEmail("second@test.com");
        secondUser.setPassword(passwordEncoder.encode("password123"));
        secondUser = userRepository.save(secondUser);

        memberService.addMember(testProject.getId(), testUser.getEmail());
        memberService.addMember(testProject.getId(), secondUser.getEmail());

        List<ProjectMember> members = memberService.getMembers(testProject.getId());
        assertEquals(2, members.size(), "Should return exactly 2 members");
    }

    // ─── 6 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("6. removeMember_Success — after remove, user no longer appears in getMembers")
    void removeMember_Success() {
        memberService.addMember(testProject.getId(), testUser.getEmail());

        memberService.removeMember(testProject.getId(), testUser.getId());

        List<ProjectMember> remaining = memberService.getMembers(testProject.getId());
        boolean stillPresent = remaining.stream()
            .anyMatch(m -> m.getUser().getId().equals(testUser.getId()));

        assertFalse(stillPresent, "Removed user should not appear in members list");
    }
}
