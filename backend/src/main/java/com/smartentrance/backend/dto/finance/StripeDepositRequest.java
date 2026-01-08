package com.smartentrance.backend.dto.finance;

import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record StripeDepositRequest(
        @Positive BigDecimal amount
) {}