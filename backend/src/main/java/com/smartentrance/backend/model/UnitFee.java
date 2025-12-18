package com.smartentrance.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "unit_fees", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"unit_id", "month"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    @NotNull
    @ToString.Exclude
    private Unit unit;

    @Column(nullable = false)
    @NotNull
    private LocalDate month;

    @Column(nullable = false)
    @PositiveOrZero
    @NotNull
    private BigDecimal amount;

    @Column(name = "due_from", nullable = false)
    @NotNull
    private LocalDate dueFrom;

    @Column(name = "due_to", nullable = false)
    @NotNull
    private LocalDate dueTo;

    @Column(name = "is_paid", nullable = false)
    private boolean isPaid = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        validateDates();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        validateDates();
        this.updatedAt = Instant.now();
    }

    private void validateDates() {
        if (dueTo.isBefore(dueFrom)) {
            throw new IllegalStateException("Due date cannot be before start date!");
        }
    }
}