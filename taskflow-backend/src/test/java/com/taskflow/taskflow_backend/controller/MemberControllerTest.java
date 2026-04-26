package com.taskflow.taskflow_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.taskflow_backend.model.ProjectMember;
import com.taskflow.taskflow_backend.service.MemberService;
import com.taskflow.taskflow_backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

//MemberControllerTest — 5 tests

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@DisplayName("MemberController Integration Tests")
class MemberControllerTest {

    private static final String TEST_TOKEN = "test-token";
    private static final String TEST_EMAIL  = "john@example.com";
    private static final String PROJECT_ID  = "project-001";
    private static final String USER_ID     = "user-002";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MemberService memberService;

    // Mock JwtUtil so the real JwtAuthenticationFilter accepts TEST_TOKEN
    // and populates Authentication with TEST_EMAIL.
    @MockitoBean
    private JwtUtil jwtUtil;

    private ProjectMember mockMember;

    @BeforeEach
    void setUp() {
        when(jwtUtil.extractEmail(TEST_TOKEN)).thenReturn(TEST_EMAIL);
        when(jwtUtil.isTokenValid(TEST_TOKEN, TEST_EMAIL)).thenReturn(true);

        mockMember = new ProjectMember();
        mockMember.setId("member-001");
        mockMember.setRole("MEMBER");
    }

    /** Adds Bearer Authorization header to every request. */
    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder withAuth(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder) {
        return builder.header("Authorization", "Bearer " + TEST_TOKEN);
    }

    // Test 1 

    @Test
    @DisplayName("getMembers_Returns200: GET /api/projects/{id}/members → 200")
    void getMembers_Returns200() throws Exception {
        when(memberService.getMembers(PROJECT_ID))
                .thenReturn(List.of(mockMember));

        mockMvc.perform(withAuth(get("/api/projects/{id}/members", PROJECT_ID)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("member-001"))
                .andExpect(jsonPath("$[0].role").value("MEMBER"));
    }

    // Test 2 

    @Test
    @DisplayName("addMember_ValidEmail_Returns201: POST → 201 + ProjectMember body")
    void addMember_ValidEmail_Returns201() throws Exception {
        when(memberService.addMember(PROJECT_ID, "jane@example.com"))
                .thenReturn(mockMember);

        Map<String, String> body = Map.of("email", "jane@example.com");

        mockMvc.perform(withAuth(post("/api/projects/{id}/members", PROJECT_ID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("member-001"))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }

    // Test 3 

    @Test
    @DisplayName("addMember_InvalidEmail_ReturnsError: Non-existent user → 500 error")
    void addMember_InvalidEmail_ReturnsError() throws Exception {
        when(memberService.addMember(PROJECT_ID, "unknown@example.com"))
                .thenThrow(new IllegalArgumentException("User not found with email: unknown@example.com"));

        Map<String, String> body = Map.of("email", "unknown@example.com");

        mockMvc.perform(withAuth(post("/api/projects/{id}/members", PROJECT_ID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User not found with email: unknown@example.com"));
    }

    // Test 4 

    @Test
    @DisplayName("addMember_Duplicate_ReturnsError: Already member → 500 error")
    void addMember_Duplicate_ReturnsError() throws Exception {
        when(memberService.addMember(PROJECT_ID, "jane@example.com"))
                .thenThrow(new IllegalArgumentException("User is already a member of this project"));

        Map<String, String> body = Map.of("email", "jane@example.com");

        mockMvc.perform(withAuth(post("/api/projects/{id}/members", PROJECT_ID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User is already a member of this project"));
    }

    // Test 5 

    @Test
    @DisplayName("removeMember_Returns204: DELETE /api/projects/{id}/members/{userId} → 204")
    void removeMember_Returns204() throws Exception {
        doNothing().when(memberService).removeMember(PROJECT_ID, USER_ID);

        mockMvc.perform(withAuth(delete("/api/projects/{id}/members/{userId}", PROJECT_ID, USER_ID)))
                .andExpect(status().isNoContent());
    }
}
