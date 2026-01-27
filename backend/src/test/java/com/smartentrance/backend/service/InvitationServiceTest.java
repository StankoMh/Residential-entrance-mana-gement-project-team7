package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.invitation.CreateInvitationRequest;
import com.smartentrance.backend.dto.invitation.InvitationResponse;
import com.smartentrance.backend.mapper.InvitationMapper;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.Invitation;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.InvitationStatus;
import com.smartentrance.backend.repository.InvitationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvitationServiceTest {

    @Mock
    private InvitationRepository invitationRepository;

    @Mock
    private UnitService unitService;

    @Mock
    private EmailService emailService;

    @Mock
    private InvitationMapper invitationMapper;

    @InjectMocks
    private InvitationService invitationService;

    private Building building;
    private Unit unit;
    private User creator;
    private User inviteeUser;
    private Invitation invitation;
    private InvitationResponse invitationResponse;

    @BeforeEach
    void setUp() {
        building = Building.builder()
                .id(1L)
                .name("Test Building")
                .build();

        unit = Unit.builder()
                .id(1L)
                .unitNumber(101)
                .accessCode("ABC123")
                .building(building)
                .build();

        creator = User.builder()
                .id(1L)
                .email("manager@example.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        inviteeUser = User.builder()
                .id(2L)
                .email("invitee@example.com")
                .build();

        invitation = Invitation.builder()
                .id(1L)
                .unit(unit)
                .inviteeEmail("invitee@example.com")
                .invitationCode("ABC123")
                .createdBy(creator)
                .status(InvitationStatus.PENDING)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();

        invitationResponse = new InvitationResponse(
                1L,
                "invitee@example.com",
                "ABC123",
                InvitationStatus.PENDING,
                invitation.getExpiresAt(),
                Instant.now(),
                null,
                new InvitationResponse.UnitInfo(1L, 101, "Test Building"),
                new InvitationResponse.CreatorInfo(1L, "John", "Doe", "manager@example.com")
        );
    }

    @Test
    void createInvitation_validRequest_createsPendingInvitationAndSendsEmail() {
        CreateInvitationRequest request =
                new CreateInvitationRequest(1L, "invitee@example.com");

        when(unitService.getUnitById(1L)).thenReturn(unit);
        when(invitationRepository.save(any(Invitation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(invitationMapper.toResponse(any())).thenReturn(invitationResponse);

        InvitationResponse result =
                invitationService.createInvitation(request, creator);

        assertNotNull(result);
        assertEquals("ABC123", result.invitationCode());
        assertEquals(InvitationStatus.PENDING, result.status());

        verify(invitationRepository).save(any(Invitation.class));
        verify(emailService).sendInvitationEmail(
                eq("invitee@example.com"),
                eq("ABC123"),
                eq("Test Building"),
                eq("101")
        );
    }

    @Test
    void createInvitation_unitNotFound_throwsEntityNotFoundException() {
        CreateInvitationRequest request =
                new CreateInvitationRequest(99L, "invitee@example.com");

        when(unitService.getUnitById(99L))
                .thenThrow(new EntityNotFoundException("Unit not found"));

        assertThrows(EntityNotFoundException.class, () ->
                invitationService.createInvitation(request, creator));

        verify(invitationRepository, never()).save(any());
        verify(emailService, never()).sendInvitationEmail(any(), any(), any(), any());
    }

    @Test
    void validateInvitation_validInvitation_returnsResponse() {
        when(invitationRepository.findByInvitationCodeAndInviteeEmail("ABC123", "invitee@example.com"))
                .thenReturn(Optional.of(invitation));
        when(invitationMapper.toResponse(invitation)).thenReturn(invitationResponse);

        InvitationResponse result =
                invitationService.validateInvitation("ABC123", "invitee@example.com");

        assertNotNull(result);
        assertEquals("ABC123", result.invitationCode());
    }

    @Test
    void validateInvitation_wrongEmail_throwsEntityNotFoundException() {
        when(invitationRepository.findByInvitationCodeAndInviteeEmail(any(), any()))
                .thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                invitationService.validateInvitation("ABC123", "wrong@example.com"));
    }

    @Test
    void validateInvitation_expiredInvitation_marksExpiredAndThrows() {
        invitation.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));

        when(invitationRepository.findByInvitationCodeAndInviteeEmail(any(), any()))
                .thenReturn(Optional.of(invitation));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                invitationService.validateInvitation("ABC123", "invitee@example.com"));

        assertTrue(ex.getMessage().contains("expired"));
        assertEquals(InvitationStatus.EXPIRED, invitation.getStatus());
        verify(invitationRepository).save(invitation);
    }

    @Test
    void validateInvitation_alreadyAccepted_throwsIllegalStateException() {
        invitation.setStatus(InvitationStatus.ACCEPTED);

        when(invitationRepository.findByInvitationCodeAndInviteeEmail(any(), any()))
                .thenReturn(Optional.of(invitation));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                invitationService.validateInvitation("ABC123", "invitee@example.com"));

        assertTrue(ex.getMessage().contains("already"));
    }

    @Test
    void acceptInvitation_validPendingInvitation_acceptsSuccessfully() {
        when(invitationRepository.findByInvitationCodeAndInviteeEmail("ABC123", inviteeUser.getEmail()))
                .thenReturn(Optional.of(invitation));
        when(invitationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(invitationMapper.toResponse(any())).thenReturn(invitationResponse);

        InvitationResponse result =
                invitationService.acceptInvitation("ABC123", inviteeUser);

        assertEquals(InvitationStatus.ACCEPTED, invitation.getStatus());
        assertNotNull(invitation.getAcceptedAt());
        assertEquals(inviteeUser, invitation.getAcceptedBy());
        assertNotNull(result);
    }

    @Test
    void acceptInvitation_wrongUserEmail_throwsEntityNotFoundException() {
        when(invitationRepository.findByInvitationCodeAndInviteeEmail(any(), any()))
                .thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                invitationService.acceptInvitation("ABC123", inviteeUser));
    }

    @Test
    void getInvitationsByUnit_returnsMappedInvitations() {
        when(invitationRepository.findAllByUnitIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(invitation));
        when(invitationMapper.toResponse(invitation))
                .thenReturn(invitationResponse);

        List<InvitationResponse> results =
                invitationService.getInvitationsByUnit(1L);

        assertEquals(1, results.size());
        assertEquals("invitee@example.com", results.get(0).inviteeEmail());
    }

    @Test
    void getPendingInvitationsByEmail_returnsOnlyNonExpiredPending() {
        Invitation expired = Invitation.builder()
                .inviteeEmail("invitee@example.com")
                .status(InvitationStatus.PENDING)
                .expiresAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .build();

        when(invitationRepository.findAllByInviteeEmailAndStatus(
                "invitee@example.com", InvitationStatus.PENDING))
                .thenReturn(List.of(invitation, expired));

        when(invitationMapper.toResponse(invitation))
                .thenReturn(invitationResponse);

        List<InvitationResponse> results =
                invitationService.getPendingInvitationsByEmail("invitee@example.com");

        assertEquals(1, results.size());
    }

    @Test
    void revokeInvitation_pendingInvitation_revokesSuccessfully() {
        when(invitationRepository.findById(1L))
                .thenReturn(Optional.of(invitation));

        invitationService.revokeInvitation(1L, creator);

        assertEquals(InvitationStatus.REVOKED, invitation.getStatus());
        verify(invitationRepository).save(invitation);
    }

    @Test
    void revokeInvitation_nonPending_throwsIllegalStateException() {
        invitation.setStatus(InvitationStatus.ACCEPTED);

        when(invitationRepository.findById(1L))
                .thenReturn(Optional.of(invitation));

        assertThrows(IllegalStateException.class, () ->
                invitationService.revokeInvitation(1L, creator));
    }

    @Test
    void expireOldInvitations_marksAllExpired() {
        Invitation oldInvitation = Invitation.builder()
                .status(InvitationStatus.PENDING)
                .expiresAt(Instant.now().minus(2, ChronoUnit.DAYS))
                .build();

        when(invitationRepository.findAllByStatusAndExpiresAtBefore(
                eq(InvitationStatus.PENDING), any()))
                .thenReturn(List.of(oldInvitation));

        invitationService.expireOldInvitations();

        assertEquals(InvitationStatus.EXPIRED, oldInvitation.getStatus());
        verify(invitationRepository).saveAll(anyList());
    }
}
