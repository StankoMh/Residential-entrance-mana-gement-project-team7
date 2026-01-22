package com.smartentrance.backend.scheduler;

import com.smartentrance.backend.service.InvitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvitationExpiryScheduler {

    private final InvitationService invitationService;

    @Scheduled(cron = "0 0 3 * * ?")
    public void expireOldInvitations() {
        log.info("START: Invitation expiry check...");
        try {
            invitationService.expireOldInvitations();
            log.info("END: Invitation expiry check finished successfully.");
        } catch (Exception e) {
            log.error("FAILED: Invitation expiry check failed: {}", e.getMessage(), e);
        }
    }
}
