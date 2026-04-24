package com.taskflow.taskflow_backend.controller;

import com.taskflow.taskflow_backend.model.ProjectMember;
import com.taskflow.taskflow_backend.service.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectMember>> getMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(memberService.getMembers(projectId));
    }

    @PostMapping
    public ResponseEntity<ProjectMember> addMember(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        ProjectMember member = memberService.addMember(projectId, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        memberService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }
}
