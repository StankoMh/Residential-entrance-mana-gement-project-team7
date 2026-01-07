package com.smartentrance.backend.model;

import com.smartentrance.backend.model.enums.*;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billable_user_id")
    private User responsibleUser;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "fund_type")
    private FundType fundType;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransactionSplit> split = new ArrayList<>();

    public void addSplit(FundType fund, BigDecimal value) {
        TransactionSplit split = new TransactionSplit(this, fund, value);
        this.split.add(split);
    }

    private String description;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "proof_url")
    private String proofUrl;

    @Column(name = "external_proof_url")
    private String externalProofUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_status", nullable = false)
    private TransactionStatus status;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}