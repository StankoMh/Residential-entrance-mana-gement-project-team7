package com.smartentrance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;

@Entity
@Table(name = "receipts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "payment_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @JsonIgnore
    private Payment payment;

    @Column(name = "receipt_number", nullable = false, unique = true)
    @NotNull @NotBlank
    private String receiptNumber;

    @Column(name = "generated_at")
    private Instant generatedAt;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @PrePersist
    protected void onCreate() {
        if (this.generatedAt == null) {
            this.generatedAt = Instant.now();
        }
    }
}