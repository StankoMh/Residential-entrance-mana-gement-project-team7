package com.smartentrance.backend.payment;

import com.smartentrance.backend.service.FinanceService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final FinanceService financeService;

    @Value("${stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping("/stripe")
    @Hidden
    public ResponseEntity<String> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(400).body("Invalid signature");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Webhook error");
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);

            if (intent != null) {
                handlePaymentSuccess(intent);
            }
        }

        return ResponseEntity.ok().build();
    }

    private void handlePaymentSuccess(PaymentIntent intent) {
        String unitIdStr = intent.getMetadata().get("unit_id");

        if (unitIdStr != null) {
            Long unitId = Long.parseLong(unitIdStr);
            BigDecimal grossAmount = BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            String receiptUrl = null;
            BigDecimal stripeFee = BigDecimal.ZERO;

            String latestChargeId = intent.getLatestCharge();

            if (latestChargeId != null) {
                try {
                    com.stripe.param.ChargeRetrieveParams params =
                            com.stripe.param.ChargeRetrieveParams.builder()
                                    .addExpand("balance_transaction")
                                    .build();

                    Charge charge = Charge.retrieve(latestChargeId, params, null);
                    receiptUrl = charge.getReceiptUrl();

                    if (charge.getBalanceTransactionObject() != null) {
                        long feeInCents = charge.getBalanceTransactionObject().getFee();
                        stripeFee = BigDecimal.valueOf(feeInCents).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    }

                } catch (StripeException e) {
                    System.err.println("Error retrieving charge details: " + e.getMessage());
                }
            }

            financeService.recordStripeSuccess(unitId, grossAmount, stripeFee, intent.getId(), receiptUrl);
        }
    }
}