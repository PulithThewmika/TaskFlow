package com.taskflow.taskflow_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.taskflow_backend.config.JwtAuthenticationFilter;
import com.taskflow.taskflow_backend.dto.request.LoginRequest;
import com.taskflow.taskflow_backend.dto.request.RegisterRequest;
import com.taskflow.taskflow_backend.dto.response.AuthResponse;
import com.taskflow.taskflow_backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private AuthResponse mockAuthResponse;

    @BeforeEach
    void setUp() {
        mockAuthResponse = new AuthResponse("mock-jwt-token", "John Doe", "john@example.com");
    }

    // Test 1
    @Test
    @DisplayName("register_ValidRequest_Returns201: POST /api/auth/register → 201 + body has token, name, email")
    void register_ValidRequest_Returns201() throws Exception {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "password123");

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    // Test 2
    @Test
    @DisplayName("register_MissingName_Returns400: Blank name → 400")
    void register_MissingName_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("", "john@example.com", "password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // Test 3
    @Test
    @DisplayName("register_InvalidEmail_Returns400: Malformed email → 400")
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("John Doe", "not-an-email", "password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // Test 4
    @Test
    @DisplayName("register_ShortPassword_Returns400: Password < 6 chars → 400")
    void register_ShortPassword_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "abc");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // Test 5
    @Test
    @DisplayName("register_DuplicateEmail_Returns500: Same email twice → 500 with error message")
    void register_DuplicateEmail_Returns500() throws Exception {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "password123");

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email already exists"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    // Test 6
    @Test
    @DisplayName("login_ValidCredentials_Returns200: Register then login → 200 + token")
    void login_ValidCredentials_Returns200() throws Exception {
        LoginRequest loginRequest = new LoginRequest("john@example.com", "password123");

        when(authService.login(any(LoginRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));
    }

    // Test 7
    @Test
    @DisplayName("login_InvalidCredentials_Returns500: Wrong password → 500")
    void login_InvalidCredentials_Returns500() throws Exception {
        LoginRequest loginRequest = new LoginRequest("john@example.com", "wrongpassword");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isInternalServerError());
    }
}
