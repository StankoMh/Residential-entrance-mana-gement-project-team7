package com.smartentrance.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "maintenance_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    @NotNull @NotBlank
    private String name;

    @Column(nullable = false)
    @NotNull @NotBlank
    private String provider;

    @Column(name = "monthly_cost", nullable = false)
    @Positive
    private BigDecimal monthlyCost;

    @Column(name = "start_date", nullable = false)
    @NotNull
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        validateDates();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        validateDates();
    }

    private void validateDates() {
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalStateException("End date cannot be before start date for maintenance service.");
        }
    }
}