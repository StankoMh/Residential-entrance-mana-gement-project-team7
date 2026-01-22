package com.smartentrance.backend.dto.invitation;

import com.smartentrance.backend.model.enums.InvitationStatus;

import java.time.Instant;

public record InvitationResponse(
        Long id,
        String inviteeEmail,
        String invitationCode,
        InvitationStatus status,
        Instant expiresAt,
        Instant createdAt,
        Instant acceptedAt,
        UnitInfo unitInfo,
        CreatorInfo createdByInfo
) {
    public record UnitInfo(Long id, Integer unitNumber, String buildingName) {}
    public record CreatorInfo(Long id, String firstName, String lastName, String email) {}
}
