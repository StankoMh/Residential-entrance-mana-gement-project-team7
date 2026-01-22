package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.invitation.CreateInvitationRequest;
import com.smartentrance.backend.dto.invitation.InvitationResponse;
import com.smartentrance.backend.mapper.InvitationMapper;
import com.smartentrance.backend.model.Invitation;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.InvitationStatus;
import com.smartentrance.backend.repository.InvitationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final UnitService unitService;
    private final EmailService emailService;
    private final InvitationMapper invitationMapper;

    private static final int INVITATION_EXPIRY_DAYS = 7;

    @Transactional
    public InvitationResponse createInvitation(CreateInvitationRequest request, User creator) {
        Unit unit = unitService.getUnitById(request.unitId());

        String invitationCode = unit.getAccessCode();
        Instant expiresAt = Instant.now().plus(INVITATION_EXPIRY_DAYS, ChronoUnit.DAYS);

        Invitation invitation = Invitation.builder()
                .unit(unit)
                .inviteeEmail(request.inviteeEmail())
                .invitationCode(invitationCode)
                .createdBy(creator)
                .status(InvitationStatus.PENDING)
                .expiresAt(expiresAt)
                .build();

        invitation = invitationRepository.save(invitation);
        log.info("Invitation created with code: {} for email: {}", invitationCode, request.inviteeEmail());

        try {
            emailService.sendInvitationEmail(
                    request.inviteeEmail(),
                    invitationCode,
                    unit.getBuilding().getName(),
                    unit.getUnitNumber().toString()
            );
        } catch (Exception e) {
            log.error("Failed to send invitation email, but invitation was created", e);
        }

        return invitationMapper.toResponse(invitation);
    }

    public InvitationResponse validateInvitation(String invitationCode, String email) {
        Invitation invitation = invitationRepository.findByInvitationCodeAndInviteeEmail(invitationCode, email)
                .orElseThrow(() -> new EntityNotFoundException("Invalid invitation code or email"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("Invitation has already been " + invitation.getStatus().name().toLowerCase());
        }

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new IllegalStateException("Invitation has expired");
        }

        return invitationMapper.toResponse(invitation);
    }

    @Transactional
    public InvitationResponse acceptInvitation(String invitationCode, User acceptedBy) {
        Invitation invitation = invitationRepository.findByInvitationCodeAndInviteeEmail(invitationCode, acceptedBy.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Invalid invitation code or you are not the intended recipient"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("Invitation has already been " + invitation.getStatus().name().toLowerCase());
        }

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new IllegalStateException("Invitation has expired");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(Instant.now());
        invitation.setAcceptedBy(acceptedBy);

        invitation = invitationRepository.save(invitation);
        log.info("Invitation {} accepted by user {}", invitationCode, acceptedBy.getEmail());

        return invitationMapper.toResponse(invitation);
    }

    public List<InvitationResponse> getInvitationsByUnit(Long unitId) {
        return invitationRepository.findAllByUnitIdOrderByCreatedAtDesc(unitId)
                .stream()
                .map(invitationMapper::toResponse)
                .toList();
    }

    public List<InvitationResponse> getPendingInvitationsByEmail(String email) {
        return invitationRepository.findAllByInviteeEmailAndStatus(email, InvitationStatus.PENDING)
                .stream()
                .filter(invitation -> invitation.getExpiresAt().isAfter(Instant.now()))
                .map(invitationMapper::toResponse)
                .toList();
    }

    @Transactional
    public void revokeInvitation(Long invitationId, User revoker) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new EntityNotFoundException("Invitation not found"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("Can only revoke pending invitations");
        }

        invitation.setStatus(InvitationStatus.REVOKED);
        invitationRepository.save(invitation);
        log.info("Invitation {} revoked by user {}", invitation.getInvitationCode(), revoker.getEmail());
    }

    @Transactional
    public void expireOldInvitations() {
        List<Invitation> expiredInvitations = invitationRepository
                .findAllByStatusAndExpiresAtBefore(InvitationStatus.PENDING, Instant.now());

        for (Invitation invitation : expiredInvitations) {
            invitation.setStatus(InvitationStatus.EXPIRED);
        }

        invitationRepository.saveAll(expiredInvitations);
        log.info("Expired {} old invitations", expiredInvitations.size());
    }
}
