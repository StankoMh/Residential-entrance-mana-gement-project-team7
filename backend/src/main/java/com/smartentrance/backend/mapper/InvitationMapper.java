package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.invitation.InvitationResponse;
import com.smartentrance.backend.model.Invitation;
import org.springframework.stereotype.Component;

@Component
public class InvitationMapper {

    public InvitationResponse toResponse(Invitation invitation) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getInviteeEmail(),
                invitation.getInvitationCode(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt(),
                invitation.getAcceptedAt(),
                mapToUnitInfo(invitation),
                mapToCreatorInfo(invitation)
        );
    }

    private InvitationResponse.UnitInfo mapToUnitInfo(Invitation invitation) {
        if (invitation.getUnit() == null) {
            return null;
        }
        return new InvitationResponse.UnitInfo(
                invitation.getUnit().getId(),
                invitation.getUnit().getUnitNumber(),
                invitation.getUnit().getBuilding() != null ?
                    invitation.getUnit().getBuilding().getName() : null
        );
    }

    private InvitationResponse.CreatorInfo mapToCreatorInfo(Invitation invitation) {
        if (invitation.getCreatedBy() == null) {
            return null;
        }
        return new InvitationResponse.CreatorInfo(
                invitation.getCreatedBy().getId(),
                invitation.getCreatedBy().getFirstName(),
                invitation.getCreatedBy().getLastName(),
                invitation.getCreatedBy().getEmail()
        );
    }
}
