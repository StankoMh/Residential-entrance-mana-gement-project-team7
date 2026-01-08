package com.smartentrance.backend.dto.document;

import java.math.BigDecimal;

public record ReceiptDetails(
        Long receiptNumber,
        String issueDate,

        String payerName,
        Integer payerUnit,

        String buildingAddress,
        String managerName,

        BigDecimal amount,
        String currency,
        String reason,

        String documentUrl
) {}