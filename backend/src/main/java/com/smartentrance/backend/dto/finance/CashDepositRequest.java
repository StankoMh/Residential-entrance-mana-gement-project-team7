package com.smartentrance.backend.dto.finance;

import com.smartentrance.backend.model.enums.FundType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CashDepositRequest(
        @NotNull @Positive BigDecimal amount,
        FundType fundType,
        String note
) {}