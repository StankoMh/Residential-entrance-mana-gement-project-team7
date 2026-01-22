package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.Invitation;
import com.smartentrance.backend.model.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByInvitationCodeAndInviteeEmail(String invitationCode, String inviteeEmail);

    List<Invitation> findAllByInvitationCode(String invitationCode);

    List<Invitation> findAllByInviteeEmailAndStatus(String inviteeEmail, InvitationStatus status);

    List<Invitation> findAllByUnitIdOrderByCreatedAtDesc(Long unitId);

    List<Invitation> findAllByStatusAndExpiresAtBefore(InvitationStatus status, Instant now);
}
