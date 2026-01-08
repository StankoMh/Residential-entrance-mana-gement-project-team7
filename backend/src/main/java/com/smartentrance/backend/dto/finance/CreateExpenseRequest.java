package com.smartentrance.backend.dto.finance;

import com.smartentrance.backend.model.enums.FundType;
import com.smartentrance.backend.model.enums.PaymentMethod;

import java.math.BigDecimal;

public record CreateExpenseRequest(
        BigDecimal amount,
        String description,
        FundType fundType,
        String documentUrl,
        PaymentMethod paymentMethod
) {}