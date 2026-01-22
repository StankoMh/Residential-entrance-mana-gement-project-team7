package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.invitation.CreateInvitationRequest;
import com.smartentrance.backend.dto.invitation.InvitationResponse;
import com.smartentrance.backend.dto.invitation.ValidateInvitationRequest;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @Operation(summary = "Create Invitation", description = "Creates an invitation for a guest to join a unit. Sends an email with the apartment's access code.")
    @PostMapping
    public ResponseEntity<InvitationResponse> createInvitation(@Valid @RequestBody CreateInvitationRequest request,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(invitationService.createInvitation(request, principal.user()));
    }

    @Operation(summary = "Validate Invitation", description = "Validates an invitation code and email. Returns invitation details if valid.")
    @PostMapping("/validate")
    public ResponseEntity<InvitationResponse> validateInvitation(@Valid @RequestBody ValidateInvitationRequest request) {
        return ResponseEntity.ok(invitationService.validateInvitation(request.invitationCode(), request.email()));
    }

    @Operation(summary = "Accept Invitation", description = "Accepts an invitation and links the user to the unit.")
    @PostMapping("/{invitationCode}/accept")
    public ResponseEntity<InvitationResponse> acceptInvitation(@PathVariable String invitationCode,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(invitationService.acceptInvitation(invitationCode, principal.user()));
    }

    @Operation(summary = "Get Invitations by Unit", description = "Returns all invitations for a specific unit.")
    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<InvitationResponse>> getInvitationsByUnit(@PathVariable Long unitId) {
        return ResponseEntity.ok(invitationService.getInvitationsByUnit(unitId));
    }

    @Operation(summary = "Get My Pending Invitations", description = "Returns all pending invitations for the current user's email.")
    @GetMapping("/my-pending")
    public ResponseEntity<List<InvitationResponse>> getMyPendingInvitations(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(invitationService.getPendingInvitationsByEmail(principal.user().getEmail()));
    }

    @Operation(summary = "Revoke Invitation", description = "Revokes a pending invitation.")
    @DeleteMapping("/{invitationId}")
    public ResponseEntity<Void> revokeInvitation(@PathVariable Long invitationId,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        invitationService.revokeInvitation(invitationId, principal.user());
        return ResponseEntity.noContent().build();
    }
}
