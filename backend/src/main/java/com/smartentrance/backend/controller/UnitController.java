package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.finance.*;
import com.smartentrance.backend.dto.unit.*;
import com.smartentrance.backend.model.enums.TransactionType;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.FinanceService;
import com.smartentrance.backend.service.UnitService;
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


    @PostMapping("/join")
    public ResponseEntity<UnitResponse> joinUnit(@Valid @RequestBody UnitJoinRequest request,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(unitService.joinUnit(request, principal.user()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<UnitResponse>> getMyUnits(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(unitService.getMyUnits(principal.user()));
    }

    @PutMapping("/{unitId}")
    public ResponseEntity<UnitResponse> updateUnit(@PathVariable Long unitId,
                                                   @RequestBody @Valid UnitUpdateRequest request,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(unitService.updateUnit(unitId, request, principal.user()));
    }

    @GetMapping("/buildings/{buildingId}")
    public ResponseEntity<List<UnitResponse>> getUnitsByBuilding(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(unitService.getUnitsByBuilding(buildingId));
    }


    @GetMapping("/{unitId}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable Long unitId) {
        return ResponseEntity.ok(financeService.getBalance(unitId));
    }

    @GetMapping("/{unitId}/transactions")
    public ResponseEntity<List<TransactionResponse>> getHistory(
            @PathVariable Long unitId,
            @RequestParam(required = false) TransactionType type) {
        return ResponseEntity.ok(financeService.getTransactionHistory(unitId, type));
    }


    @PostMapping("/{unitId}/payments/stripe")
    public ResponseEntity<Map<String, String>> payStripe(
            @PathVariable Long unitId,
            @RequestBody StripeDepositRequest req,
            @AuthenticationPrincipal UserPrincipal principal) throws Exception {
        String secret = financeService.initiateStripeDeposit(unitId, req.amount(), principal.user());
        return ResponseEntity.ok(Map.of("clientSecret", secret));
    }

    @PostMapping("/{unitId}/payments/bank")
    public ResponseEntity<Void> payBank(
            @PathVariable Long unitId,
            @RequestBody BankDepositRequest req) {
        financeService.submitBankTransfer(unitId, req.amount(), req.transactionReference(), req.proofUrl());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{unitId}/payments/cash")
    public ResponseEntity<Void> payCash(
            @PathVariable Long unitId,
            @RequestBody CashDepositRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        financeService.recordCashDeposit(unitId, req.amount(), req.fundType(), req.note(), principal.user());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{unitId}/verify")
    public ResponseEntity<Void> verifyUnit(@PathVariable Long unitId) {
        unitService.verifyUnit(unitId);
        return ResponseEntity.noContent().build();
    }
}