package com.smartentrance.backend.controller;

import com.smartentrance.backend.model.Transaction;
import com.smartentrance.backend.repository.TransactionRepository;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.FinanceService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final FinanceService financeService;
    private final TransactionRepository transactionRepository;

    @Operation(summary = "Approve Transaction", description = "Confirms a pending transaction (e.g., Bank Transfer).")
    @PostMapping("/{transactionId}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long transactionId,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        financeService.approveTransaction(transactionId, principal.user());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Reject Transaction", description = "Rejects a pending transaction if the funds were not received or the proof is invalid.")
    @PostMapping("/{transactionId}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long transactionId) {
        financeService.rejectTransaction(transactionId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get Receipt URL", description = "Retrieves the proof of payment URL (image/pdf) associated with the transaction.")
    @GetMapping("/{transactionId}/receipt")
    public ResponseEntity<Map<String, String>> getReceipt(@PathVariable Long transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        return ResponseEntity.ok(Map.of("proofUrl", t.getProofUrl() != null ? t.getProofUrl() : ""));
    }
}