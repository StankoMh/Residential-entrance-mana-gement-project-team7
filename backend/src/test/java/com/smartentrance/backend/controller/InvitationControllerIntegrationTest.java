package com.smartentrance.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartentrance.backend.dto.invitation.CreateInvitationRequest;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.Invitation;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.InvitationStatus;
import com.smartentrance.backend.repository.InvitationRepository;
import com.smartentrance.backend.repository.UnitRepository;
import com.smartentrance.backend.repository.UserRepository;
import com.smartentrance.backend.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class InvitationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private EmailService emailService;

    private Unit unit;
    private User manager;
    private Invitation invitation;

    @BeforeEach
    void setUp() {
        Building building = Building.builder()
                .name("Test Building")
                .build();

        unit = unitRepository.save(
                Unit.builder()
                        .unitNumber(101)
                        .accessCode("ABC123")
                        .building(building)
                        .build()
        );

        manager = userRepository.save(
                User.builder()
                        .email("manager@example.com")
                        .firstName("John")
                        .lastName("Doe")
                        .build()
        );

        invitation = invitationRepository.save(
                Invitation.builder()
                        .unit(unit)
                        .inviteeEmail("invitee@example.com")
                        .invitationCode("ABC123")
                        .status(InvitationStatus.PENDING)
                        .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                        .createdBy(manager)
                        .build()
        );
    }

    @Test
    @WithMockUser(username = "manager@example.com", roles = {"MANAGER"})
    void createInvitation_authenticated_returns200() throws Exception {
        CreateInvitationRequest request =
                new CreateInvitationRequest(unit.getId(), "newuser@example.com");

        mockMvc.perform(post("/api/invitations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteeEmail").value("newuser@example.com"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.invitationCode").value("ABC123"))
                .andExpect(jsonPath("$.unitInfo.unitNumber").value(101));
    }

    @Test
    void createInvitation_unauthorized_returns401() throws Exception {
        CreateInvitationRequest request =
                new CreateInvitationRequest(unit.getId(), "newuser@example.com");

        mockMvc.perform(post("/api/invitations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validateInvitation_valid_returns200() throws Exception {
        mockMvc.perform(post("/api/invitations/validate")
                        .param("invitationCode", "ABC123")
                        .param("email", "invitee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteeEmail").value("invitee@example.com"));
    }

    @Test
    void validateInvitation_invalidCode_returns404() throws Exception {
        mockMvc.perform(post("/api/invitations/validate")
                        .param("invitationCode", "WRONG")
                        .param("email", "invitee@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "invitee@example.com")
    void acceptInvitation_authenticated_returns200() throws Exception {
        mockMvc.perform(post("/api/invitations/ABC123/accept"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    @WithMockUser(username = "manager@example.com", roles = {"MANAGER"})
    void getInvitationsByUnit_returnsList() throws Exception {
        mockMvc.perform(get("/api/invitations/unit/{unitId}", unit.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(username = "invitee@example.com")
    void getMyPendingInvitations_returnsOnlyMine() throws Exception {
        mockMvc.perform(get("/api/invitations/my-pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].inviteeEmail").value("invitee@example.com"));
    }

    @Test
    @WithMockUser(username = "manager@example.com", roles = {"MANAGER"})
    void revokeInvitation_authenticated_returns204() throws Exception {
        mockMvc.perform(delete("/api/invitations/{id}", invitation.getId()))
                .andExpect(status().isNoContent());
    }
}