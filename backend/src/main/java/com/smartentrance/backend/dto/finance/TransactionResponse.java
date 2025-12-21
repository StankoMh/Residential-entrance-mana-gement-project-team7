package com.smartentrance.backend.dto.finance;

import com.smartentrance.backend.model.enums.FundType;
import com.smartentrance.backend.model.enums.PaymentMethod;
import com.smartentrance.backend.model.enums.TransactionStatus;
import com.smartentrance.backend.model.enums.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        FundType fundType,
        PaymentMethod paymentMethod,
        String description,
        TransactionStatus transactionStatus,
        String documentUrl,
        String externalDocumentUrl,
        Instant createdAt
) {}