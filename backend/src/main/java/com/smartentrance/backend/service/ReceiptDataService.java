package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.document.ReceiptDetails;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.Transaction;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.TransactionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReceiptDataService {

    public ReceiptDetails prepareReceiptData(Transaction transaction) {
        return switch (transaction.getPaymentMethod()) {
            case STRIPE -> generateStripeReceipt(transaction);
            case BANK_TRANSFER -> generateBankTransferReceipt(transaction);
            case CASH, SYSTEM -> generateSystemReceipt(transaction);
        };
    }

    public ReceiptDetails generateSystemReceipt(Transaction transaction) {
        if (!transaction.getStatus().equals(TransactionStatus.CONFIRMED)) {
            throw new IllegalStateException("Cannot generate receipt for unconfirmed transaction.");
        }

        String description = transaction.getDescription() != null
                ? transaction.getDescription()
                : "Cash Payment";

        return buildReceipt(transaction, description, "Building Manager", null);
    }

    public ReceiptDetails generateBankTransferReceipt(Transaction transaction) {
        if (!transaction.getStatus().equals(TransactionStatus.CONFIRMED)) {
            throw new IllegalStateException("Cannot generate receipt for unconfirmed transaction.");
        }

        String description = "Bank Transfer (Ref: " +
                (transaction.getReferenceId() != null ? transaction.getReferenceId() : "N/A") + ")";

        return buildReceipt(transaction, description, "Bank Transfer", transaction.getProofUrl());
    }

    public ReceiptDetails generateStripeReceipt(Transaction transaction) {
        if (!transaction.getStatus().equals(TransactionStatus.CONFIRMED)) {
            throw new IllegalStateException("Cannot generate receipt for unconfirmed transaction.");
        }

        String description = "Card Payment via Stripe";

        return buildReceipt(transaction, description, "Stripe System", transaction.getProofUrl());
    }

    private ReceiptDetails buildReceipt(Transaction transaction, String reason, String cashierLabel, String externalUrl) {
        Unit unit = transaction.getUnit();
        User payer = unit.getResponsibleUser();
        Building building = unit.getBuilding();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
        String dateStr = transaction.getCreatedAt().atZone(ZoneId.systemDefault()).format(formatter);

        String managerName;
        if (building.getManager() != null) {
            managerName = building.getManager().getFirstName() + " " + building.getManager().getLastName();
        } else {
            managerName = cashierLabel;
        }

        String payerName = (payer != null)
                ? payer.getFirstName() + " " + payer.getLastName()
                : "N/A";

        return new ReceiptDetails(
                transaction.getId(),
                dateStr,
                payerName,
                unit.getUnitNumber(),
                building.getAddress(),
                managerName,
                transaction.getAmount(),
                "EUR",
                reason,
                externalUrl
        );
    }
}