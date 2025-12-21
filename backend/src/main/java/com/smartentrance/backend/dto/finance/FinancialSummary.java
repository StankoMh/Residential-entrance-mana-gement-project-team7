package com.smartentrance.backend.dto.finance;

import java.math.BigDecimal;

public record FinancialSummary(
        BigDecimal totalBalance,

        FundBreakdown repairFund,
        FundBreakdown maintenanceFund,

        BigDecimal cashOnHands,
        BigDecimal bankAccounts
) {
    public record FundBreakdown(
            BigDecimal income,
            BigDecimal expense,
            BigDecimal balance
    ) {}
}