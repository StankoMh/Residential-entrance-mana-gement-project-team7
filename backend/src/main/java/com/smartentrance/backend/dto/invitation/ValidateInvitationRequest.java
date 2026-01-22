package com.smartentrance.backend.dto.invitation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ValidateInvitationRequest(
        @NotBlank(message = "Invitation code is required")
        String invitationCode,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email
) {}
