package com.smartentrance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "units", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"building_id", "unit_number"}),
        @UniqueConstraint(columnNames = "access_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    @NotNull
    @ToString.Exclude
    private Building building;

    @Column(name = "unit_number", nullable = false)
    @NotNull
    private Integer unitNumber;

    @Column()
    @PositiveOrZero
    private BigDecimal area;

    @Column(name = "resident_count")
    @PositiveOrZero
    private Integer residents;

    @Column(name = "access_code", nullable = false, length = 8, unique = true)
    @NotNull
    private String accessCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_user_id")
    @ToString.Exclude
    private User responsibleUser;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private List<UnitFee> fees = new ArrayList<>();

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