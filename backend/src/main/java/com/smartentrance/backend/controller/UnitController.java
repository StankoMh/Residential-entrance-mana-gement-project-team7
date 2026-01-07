package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.finance.*;
import com.smartentrance.backend.dto.unit.*;
import com.smartentrance.backend.model.enums.TransactionType;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.FinanceService;
import com.smartentrance.backend.service.UnitService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;
    private final FinanceService financeService;

    @Operation(summary = "Join Unit", description = "Allows a user to join an apartment using a secure n-digit access code.")
    @PostMapping("/join")
    public ResponseEntity<UnitResponse> joinUnit(@Valid @RequestBody UnitJoinRequest request,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(unitService.joinUnit(request, principal.user()));
    }

    @Operation(summary = "Get My Units", description = "Returns all apartments owned or inhabited by the current user.")
    @GetMapping("/my")
    public ResponseEntity<List<UnitResponse>> getMyUnits(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(unitService.getMyUnits(principal.user()));
    }

    @Operation(summary = "Update Unit", description = "Updates unit details like resident count and area size.")
    @PutMapping("/{unitId}")
    public ResponseEntity<UnitResponse> updateUnit(@PathVariable Long unitId,
                                                   @RequestBody @Valid UnitUpdateRequest request,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(unitService.updateUnit(unitId, request, principal.user()));
    }

    @Operation(summary = "Get Units by Building", description = "Lists all units in a specific building with their current balance (Manager only).")
    @GetMapping("/buildings/{buildingId}")
    public ResponseEntity<List<UnitResponse>> getUnitsByBuilding(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(unitService.getUnitsByBuilding(buildingId));
    }

    @Operation(summary = "Get Balance", description = "Calculates the current financial balance of a specific unit.")
    @GetMapping("/{unitId}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable Long unitId) {
        return ResponseEntity.ok(financeService.getBalance(unitId));
    }

    @Operation(summary = "Get Transaction History", description = "Returns a history of all fees and payments for a unit.")
    @GetMapping("/{unitId}/transactions")
    public ResponseEntity<List<TransactionResponse>> getHistory(
            @PathVariable Long unitId,
            @RequestParam(required = false) TransactionType type) {
        return ResponseEntity.ok(financeService.getTransactionHistory(unitId, type));
    }

    @Operation(summary = "Pay with Stripe", description = "Initiates a card deposit via Stripe for the unit")
    @PostMapping("/{unitId}/payments/stripe")
    public ResponseEntity<Map<String, String>> payStripe(
            @PathVariable Long unitId,
            @RequestBody StripeDepositRequest req,
            @AuthenticationPrincipal UserPrincipal principal) throws Exception {
        String secret = financeService.initiateStripeDeposit(unitId, req.amount(), principal.user());
        return ResponseEntity.ok(Map.of("clientSecret", secret));
    }

    @Operation(summary = "Pay via Bank Transfer", description = "Submits a bank transfer record for approval by the Manager.")
    @PostMapping("/{unitId}/payments/bank")
    public ResponseEntity<Void> payBank(
            @PathVariable Long unitId,
            @RequestBody BankDepositRequest req) {
        financeService.submitBankTransfer(unitId, req.amount(), req.transactionReference(), req.proofUrl());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Pay with Cash", description = "Records a cash deposit handed to the Manager.")
    @PostMapping("/{unitId}/payments/cash")
    public ResponseEntity<Void> payCash(
            @PathVariable Long unitId,
            @RequestBody CashDepositRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        financeService.recordCashDeposit(unitId, req.amount(), req.fundType(), req.note(), principal.user());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Verify Unit", description = "Marks a unit as 'Verified' by the Manager, confirming the resident's identity and information.")
    @PatchMapping("/{unitId}/verify")
    public ResponseEntity<Void> verifyUnit(@PathVariable Long unitId) {
        unitService.verifyUnit(unitId);
        return ResponseEntity.noContent().build();
    }
}