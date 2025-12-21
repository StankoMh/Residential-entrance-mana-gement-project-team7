package com.smartentrance.backend.payment;

import com.smartentrance.backend.service.FinanceService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.ChargeCollection;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final FinanceService financeService;

    @Value("${stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Signature", e);
            return ResponseEntity.status(400).body("Invalid signature");
        } catch (Exception e) {
            log.error("Webhook error", e);
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
        log.info("Payment Succeeded: " + intent.getId());

        String unitIdStr = intent.getMetadata().get("unit_id");

        if (unitIdStr != null) {
            Long unitId = Long.parseLong(unitIdStr);
            BigDecimal amount = BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100));

            String receiptUrl = null;

            String latestChargeId = intent.getLatestCharge();

            if (latestChargeId != null) {
                try {
                    Charge charge = Charge.retrieve(latestChargeId);
                    receiptUrl = charge.getReceiptUrl();

                    log.info("Stripe Receipt URL retrieved: " + receiptUrl);
                } catch (StripeException e) {
                    log.error("Failed to retrieve charge details for receipt URL", e);
                }
            }

            financeService.recordStripeSuccess(unitId, amount, intent.getId(), receiptUrl);

            log.info("Successfully recorded deposit for Unit ID: " + unitId);
        }
    }
}