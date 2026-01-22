package com.smartentrance.backend.model;

import com.smartentrance.backend.model.enums.InvitationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "invitations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"invitation_code", "invitee_email"}))
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Invitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    @NotNull
    private Unit unit;

    @Column(name = "invitee_email", nullable = false)
    @NotNull
    @NotBlank
    @Email(message = "Invalid email format")
    private String inviteeEmail;

    @Column(name = "invitation_code", nullable = false)
    @NotNull
    @NotBlank
    private String invitationCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    @NotNull
    private User createdBy;

    @Column(nullable = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    private InvitationStatus status;

    @Column(name = "expires_at", nullable = false)
    @NotNull
    private Instant expiresAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_id")
    private User acceptedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) {
            this.status = InvitationStatus.PENDING;
        }
    }
}
