package com.smartentrance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartentrance.backend.model.enums.FundType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "transaction_splits")
@Data
@NoArgsConstructor
public class TransactionSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Transaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundType fundType;

    @Column(nullable = false)
    private BigDecimal amount;

    public TransactionSplit(Transaction transaction, FundType fundType, BigDecimal amount) {
        this.transaction = transaction;
        this.fundType = fundType;
        this.amount = amount;
    }
}