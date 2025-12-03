package com.smartentrance.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

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
    private LocalDateTime generatedAt;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @PrePersist
    protected void onCreate() {
        if (this.generatedAt == null) {
            this.generatedAt = LocalDateTime.now();
        }
    }
}