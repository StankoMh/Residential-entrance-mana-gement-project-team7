package com.smartentrance.backend.dto.invitation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateInvitationRequest(
        @NotNull(message = "Unit ID is required")
        Long unitId,

        @NotBlank(message = "Invitee email is required")
        @Email(message = "Invalid email format")
        String inviteeEmail
) {}
