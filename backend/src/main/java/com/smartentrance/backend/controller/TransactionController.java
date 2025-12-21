package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.document.ReceiptDetails;
import com.smartentrance.backend.model.Transaction;
import com.smartentrance.backend.repository.TransactionRepository;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.FinanceService;
import com.smartentrance.backend.service.ReceiptDataService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final FinanceService financeService;
    private final ReceiptDataService receiptDataService;
    private final TransactionRepository transactionRepository;

    @PostMapping("/{transactionId}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long transactionId,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        financeService.approveTransaction(transactionId, principal.user());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{transactionId}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long transactionId) {
        financeService.rejectTransaction(transactionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{transactionId}/receipt-details")
    public ResponseEntity<ReceiptDetails> getReceiptDetails(@PathVariable Long transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));
        return ResponseEntity.ok(receiptDataService.prepareReceiptData(t));
    }
}