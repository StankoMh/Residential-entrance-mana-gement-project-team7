package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.finance.*;
import com.smartentrance.backend.model.enums.TransactionStatus;
import com.smartentrance.backend.model.enums.TransactionType;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings/{buildingId}/finance")
@RequiredArgsConstructor
public class BuildingFinanceController {

    private final FinanceService financeService;

    @GetMapping("/summary")
    public ResponseEntity<FinancialSummary> getSummary(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(financeService.getBuildingFinancialSummary(buildingId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(
            @PathVariable Integer buildingId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status
    ) {
        return ResponseEntity.ok(financeService.getBuildingTransactions(buildingId, type, status));
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<BuildingExpenseResponse>> getExpenses(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(financeService.getBuildingExpenses(buildingId));
    }

    @PostMapping("/expenses")
    public ResponseEntity<Void> createExpense(
            @PathVariable Integer buildingId,
            @RequestBody CreateExpenseRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        financeService.createExpense(buildingId, req, principal.user());
        return ResponseEntity.ok().build();
    }
}