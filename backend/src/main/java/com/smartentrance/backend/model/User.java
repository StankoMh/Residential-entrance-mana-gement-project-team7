package com.smartentrance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartentrance.backend.model.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    @NotNull @NotBlank
    private String firstName;

    @Column(name= "last_name", nullable = false)
    @NotNull @NotBlank
    private String lastName;

    @Column(nullable = false, unique = true)
    @NotNull @NotBlank
    @Email(message = "Invalid email format")
    private String email;

    @Column(nullable = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "hashed_password", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private String hashedPassword;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}