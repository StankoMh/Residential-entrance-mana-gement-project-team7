package com.smartentrance.backend.dto.building;

import java.math.BigDecimal;

public record UpdateBudgetRequest(
        BigDecimal repairBudget,
        BigDecimal maintenanceBudget,
        String protocolFileUrl
) {}