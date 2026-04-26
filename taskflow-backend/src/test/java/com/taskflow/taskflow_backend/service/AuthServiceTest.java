package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.LoginRequest;
import com.taskflow.taskflow_backend.dto.request.RegisterRequest;
import com.taskflow.taskflow_backend.dto.response.AuthResponse;
import com.taskflow.taskflow_backend.model.User;
import com.taskflow.taskflow_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Section 3.1 — AuthServiceTest
 * 7 integration tests verifying registration and login flows.
 * Uses embedded MongoDB via Flapdoodle (auto-configured in "test" profile).
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("3.1 AuthService Integration Tests")
class AuthServiceTest {

    @Autowired
    AuthService authService;

    @Autowired
    UserRepository userRepository;

    @BeforeEach
    void cleanup() {
        userRepository.deleteAll();
    }

    // ─── 1 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("1. register_Success_ReturnsTokenAndUserInfo — response has non-null token, correct name & email")
    void register_Success_ReturnsTokenAndUserInfo() {
        RegisterRequest request = new RegisterRequest("Lakdinu", "lakdinu@test.com", "password123");

        AuthResponse response = authService.register(request);

        assertAll(
            () -> assertNotNull(response.getToken(), "token should not be null"),
            () -> assertFalse(response.getToken().isBlank(), "token should not be blank"),
            () -> assertEquals("Lakdinu", response.getName()),
            () -> assertEquals("lakdinu@test.com", response.getEmail())
        );
    }

    // ─── 2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("2. register_SavesUserToDatabase — findByEmail returns the saved user")
    void register_SavesUserToDatabase() {
        RegisterRequest request = new RegisterRequest("Lakdinu", "lakdinu@test.com", "password123");

        authService.register(request);

        Optional<User> savedUser = userRepository.findByEmail("lakdinu@test.com");
        assertTrue(savedUser.isPresent(), "User should be persisted in the database");
        assertEquals("Lakdinu", savedUser.get().getName());
    }

    // ─── 3 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("3. register_PasswordIsHashed — stored password must not equal the raw password")
    void register_PasswordIsHashed() {
        RegisterRequest request = new RegisterRequest("Lakdinu", "lakdinu@test.com", "password123");

        authService.register(request);

        User saved = userRepository.findByEmail("lakdinu@test.com").orElseThrow();
        assertNotEquals("password123", saved.getPassword(),
            "Password must be BCrypt-encoded, not stored in plain text");
    }

    // ─── 4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("4. register_DuplicateEmail_ThrowsException — registering same email twice throws RuntimeException")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("Lakdinu", "lakdinu@test.com", "password123");
        authService.register(request);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.register(request));
        assertEquals("Email already exists", ex.getMessage());
    }

    // ─── 5 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("5. login_ValidCredentials_ReturnsToken — register then login returns a valid token")
    void login_ValidCredentials_ReturnsToken() {
        authService.register(new RegisterRequest("Lakdinu", "lakdinu@test.com", "password123"));

        AuthResponse response = authService.login(new LoginRequest("lakdinu@test.com", "password123"));

        assertNotNull(response.getToken(), "Login should return a non-null JWT token");
        assertFalse(response.getToken().isBlank());
    }

    // ─── 6 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("6. login_WrongEmail_ThrowsException — non-existent email → RuntimeException 'Invalid credentials'")
    void login_WrongEmail_ThrowsException() {
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.login(new LoginRequest("nobody@test.com", "password123")));
        assertEquals("Invalid credentials", ex.getMessage());
    }

    // ─── 7 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("7. login_WrongPassword_ThrowsException — correct email, wrong password → RuntimeException 'Invalid credentials'")
    void login_WrongPassword_ThrowsException() {
        authService.register(new RegisterRequest("Lakdinu", "lakdinu@test.com", "password123"));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.login(new LoginRequest("lakdinu@test.com", "wrongPassword")));
        assertEquals("Invalid credentials", ex.getMessage());
    }
}
