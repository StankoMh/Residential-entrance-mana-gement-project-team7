package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.finance.TransactionResponse;
import com.smartentrance.backend.model.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    @Value("${application.base-url}")
    private String baseUrl;

    public TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getFundType(),
                transaction.getPaymentMethod(),
                transaction.getDescription(),
                transaction.getStatus(),
                resolveDocumentUrl(transaction.getProofUrl()),
                resolveDocumentUrl(transaction.getExternalProofUrl()),
                transaction.getCreatedAt()
        );
    }

    private String resolveDocumentUrl(String rawPath) {
        if (rawPath == null || rawPath.isBlank()) {
            return null;
        }

        if (rawPath.startsWith("http")) {
            return rawPath;
        }

        return baseUrl + "/api/uploads/files/" + rawPath;
    }
}