package com.taskflow.taskflow_backend.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Section 3.7 — JwtUtilTest
 * 5 tests verifying JWT token generation and validation.
 * Uses @SpringBootTest to inject @Value-backed jwt.secret and jwt.expiration
 * properties from application-test.properties.
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("3.7 JwtUtil Tests")
class JwtUtilTest {

    @Autowired
    JwtUtil jwtUtil;

    // ─── 1 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("1. generateToken_ReturnsNonNullString — generated token is not null or empty")
    void generateToken_ReturnsNonNullString() {
        String token = jwtUtil.generateToken("test@test.com");

        assertNotNull(token, "Token must not be null");
        assertFalse(token.isBlank(), "Token must not be blank");
    }

    // ─── 2 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("2. extractEmail_MatchesInput — extractEmail returns the email used to generate the token")
    void extractEmail_MatchesInput() {
        String email = "test@test.com";
        String token = jwtUtil.generateToken(email);

        String extracted = jwtUtil.extractEmail(token);

        assertEquals(email, extracted,
            "Extracted email must exactly match the email used during token generation");
    }

    // ─── 3 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("3. isTokenValid_CorrectEmail_ReturnsTrue — token validated against same email → true")
    void isTokenValid_CorrectEmail_ReturnsTrue() {
        String email = "test@test.com";
        String token = jwtUtil.generateToken(email);

        assertTrue(jwtUtil.isTokenValid(token, email),
            "isTokenValid should return true when the email matches the token subject");
    }

    // ─── 4 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("4. isTokenValid_WrongEmail_ReturnsFalse — token validated against different email → false")
    void isTokenValid_WrongEmail_ReturnsFalse() {
        String token = jwtUtil.generateToken("test@test.com");

        assertFalse(jwtUtil.isTokenValid(token, "other@test.com"),
            "isTokenValid should return false when the email does not match the token subject");
    }

    // ─── 5 ──────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("5. generateToken_DifferentEmailsDifferentTokens — two distinct emails produce two distinct tokens")
    void generateToken_DifferentEmailsDifferentTokens() {
        String tokenA = jwtUtil.generateToken("alice@test.com");
        String tokenB = jwtUtil.generateToken("bob@test.com");

        assertNotEquals(tokenA, tokenB,
            "Tokens generated for different emails must not be identical");
    }
}
