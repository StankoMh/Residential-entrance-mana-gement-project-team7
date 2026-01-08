package com.smartentrance.backend.dto.finance;

import com.smartentrance.backend.model.enums.FundType;
import java.math.BigDecimal;
import java.time.Instant;

public record BuildingExpenseResponse(
        Long id,
        BigDecimal amount,
        String description,
        FundType fundType,
        String documentUrl,
        Instant expenseDate,
        String createdBy
) {}