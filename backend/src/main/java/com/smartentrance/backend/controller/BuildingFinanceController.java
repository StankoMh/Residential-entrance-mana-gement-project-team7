package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.finance.*;
import com.smartentrance.backend.model.enums.TransactionStatus;
import com.smartentrance.backend.model.enums.TransactionType;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.FinanceService;
import io.swagger.v3.oas.annotations.Operation;
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

    @Operation(summary = "Get Financial Summary", description = "Returns the financial dashboard data: Total Balance, Repair/Maintenance fund breakdown, and Cash on hand.")
    @GetMapping("/summary")
    public ResponseEntity<FinancialSummary> getSummary(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(financeService.getBuildingFinancialSummary(buildingId));
    }

    @Operation(summary = "List Transactions", description = "Retrieves a list of all financial movements (fees, payments, expenses) with optional filtering by type and status.")
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(
            @PathVariable Integer buildingId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status
    ) {
        return ResponseEntity.ok(financeService.getBuildingTransactions(buildingId, type, status));
    }

    @Operation(summary = "List Expenses", description = "Retrieves the history of all recorded building expenses and their proof documents.")
    @GetMapping("/expenses")
    public ResponseEntity<List<BuildingExpenseResponse>> getExpenses(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(financeService.getBuildingExpenses(buildingId));
    }

    @Operation(summary = "Create Expense", description = "Records a new expense (outflow) from the building funds, attaching a document or receipt.")
    @PostMapping("/expenses")
    public ResponseEntity<Void> createExpense(
            @PathVariable Integer buildingId,
            @RequestBody CreateExpenseRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        financeService.createExpense(buildingId, req, principal.user());
        return ResponseEntity.ok().build();
    }
}