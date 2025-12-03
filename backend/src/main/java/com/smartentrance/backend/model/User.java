package com.smartentrance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartentrance.backend.model.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name", nullable = false)
    @NotNull @NotBlank
    private String fullName;

    @Column(nullable = false, unique = true)
    @NotNull @NotBlank
    @Email(message = "Invalid email format")
    private String email;

    @Column(nullable = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "hashed_password", nullable = false)
    @NotNull
    @JsonIgnore
    @ToString.Exclude
    private String hashedPassword;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}