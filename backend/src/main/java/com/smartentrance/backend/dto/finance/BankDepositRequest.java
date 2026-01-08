package com.smartentrance.backend.dto.finance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BankDepositRequest(
        @NotNull @Positive BigDecimal amount,
        String transactionReference,
        String proofUrl
) {}