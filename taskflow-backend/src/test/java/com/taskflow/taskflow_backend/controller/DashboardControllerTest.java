package com.taskflow.taskflow_backend.controller;

import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.service.DashboardService;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


//DashboardControllerTest — 3 tests
 
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@DisplayName("DashboardController Integration Tests")
class DashboardControllerTest {

    private static final String TEST_TOKEN = "test-token";
    private static final String TEST_EMAIL  = "john@example.com";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    // Mock JwtUtil so the real JwtAuthenticationFilter accepts TEST_TOKEN
    // and populates Authentication with TEST_EMAIL.
    @MockitoBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        when(jwtUtil.extractEmail(TEST_TOKEN)).thenReturn(TEST_EMAIL);
        when(jwtUtil.isTokenValid(TEST_TOKEN, TEST_EMAIL)).thenReturn(true);
    }

    /** Adds Bearer Authorization header to every request. */
    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder withAuth(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder) {
        return builder.header("Authorization", "Bearer " + TEST_TOKEN);
    }

    // Test 1 

    @Test
    @DisplayName("getStats_Returns200: GET /api/dashboard/stats → 200")
    void getStats_Returns200() throws Exception {
        when(dashboardService.getStatsForUser(TEST_EMAIL))
                .thenReturn(new DashboardStatsResponse(0, 0, 0, 0, 0, 0));

        mockMvc.perform(withAuth(get("/api/dashboard/stats")))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    // Test 2 

    @Test
    @DisplayName("getStats_HasAllFields: Response has all 6 stat fields")
    void getStats_HasAllFields() throws Exception {
        when(dashboardService.getStatsForUser(TEST_EMAIL))
                .thenReturn(new DashboardStatsResponse(10, 3, 4, 2, 1, 2));

        mockMvc.perform(withAuth(get("/api/dashboard/stats")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks").exists())
                .andExpect(jsonPath("$.todoCount").exists())
                .andExpect(jsonPath("$.inProgressCount").exists())
                .andExpect(jsonPath("$.inReviewCount").exists())
                .andExpect(jsonPath("$.doneCount").exists())
                .andExpect(jsonPath("$.overdueCount").exists());
    }

    // Test 3 

    @Test
    @DisplayName("getStats_ReflectsRealData: Stats counts match the service data")
    void getStats_ReflectsRealData() throws Exception {
        // Simulate: 8 tasks — 2 TODO, 3 IN_PROGRESS, 1 IN_REVIEW, 2 DONE, 1 overdue
        DashboardStatsResponse mockStats = new DashboardStatsResponse(8, 2, 3, 1, 2, 1);
        when(dashboardService.getStatsForUser(TEST_EMAIL)).thenReturn(mockStats);

        mockMvc.perform(withAuth(get("/api/dashboard/stats")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks").value(8))
                .andExpect(jsonPath("$.todoCount").value(2))
                .andExpect(jsonPath("$.inProgressCount").value(3))
                .andExpect(jsonPath("$.inReviewCount").value(1))
                .andExpect(jsonPath("$.doneCount").value(2))
                .andExpect(jsonPath("$.overdueCount").value(1));
    }
}
