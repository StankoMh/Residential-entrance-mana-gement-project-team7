package com.smartentrance.backend.model;

import com.smartentrance.backend.model.enums.FundType;
import com.smartentrance.backend.model.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "building_expenses")
@Data
public class BuildingExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundType fundType;

    private String documentUrl;

    @Column(nullable = false)
    private Instant expenseDate;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}