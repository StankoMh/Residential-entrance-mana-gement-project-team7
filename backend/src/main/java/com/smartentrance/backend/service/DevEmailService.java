package com.smartentrance.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Development email service that logs emails instead of sending them
 * Use this when you don't have a real email server configured
 * Active only when 'dev' profile is enabled
 */
@Service
@Profile("dev")
@Slf4j
public class DevEmailService implements EmailSender {

    @Value("${application.base-url}")
    private String baseUrl;

    private static final String EMAIL_LOG_DIR = "./dev-emails";
    private static final DateTimeFormatter FILE_NAME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss").withZone(ZoneId.systemDefault());

    public DevEmailService() {
        createEmailLogDirectory();
        log.info("✅ DevEmailService initialized - Emails will be logged to console and saved to files");
    }

    private void createEmailLogDirectory() {
        try {
            Path emailDir = Paths.get(EMAIL_LOG_DIR);
            if (!Files.exists(emailDir)) {
                Files.createDirectories(emailDir);
                log.info("Created email log directory: {}", EMAIL_LOG_DIR);
            }
        } catch (IOException e) {
            log.error("Failed to create email log directory", e);
        }
    }

    @Override
    public void sendInvitationEmail(String toEmail, String invitationCode, String buildingName, String unitNumber) {
        String emailContent = buildInvitationEmailContent(toEmail, invitationCode, buildingName, unitNumber);

        // Log to console
        log.info("\n" + "=".repeat(80));
        log.info("📧 DEVELOPMENT EMAIL - NOT ACTUALLY SENT");
        log.info("=".repeat(80));
        log.info(emailContent);
        log.info("=".repeat(80) + "\n");

        // Save to file
        saveEmailToFile(toEmail, invitationCode, emailContent);
    }

    private String buildInvitationEmailContent(String toEmail, String invitationCode,
                                               String buildingName, String unitNumber) {
        String acceptUrl = baseUrl + "/accept-invitation?code=" + invitationCode + "&email=" + toEmail;

        return """

                TO: %s
                FROM: noreply@smartentrance.com
                SUBJECT: Invitation to %s - Unit %s

                ═══════════════════════════════════════════════════════════════
                                    YOU'RE INVITED!
                ═══════════════════════════════════════════════════════════════

                Hello,

                You have been invited to join %s as a resident of Unit %s.

                ┌─────────────────────────────────────────────────────────────┐
                │                                                             │
                │               YOUR INVITATION CODE                          │
                │                                                             │
                │                     %s                          │
                │                                                             │
                └─────────────────────────────────────────────────────────────┘

                This invitation code will allow you to:
                  ✓ Register a new account if you don't have one
                  ✓ Access the building management system
                  ✓ Manage your unit and participate in building activities

                ──────────────────────────────────────────────────────────────

                TO ACCEPT THIS INVITATION:

                Option 1 - Register (if you don't have an account):
                  POST %s/api/auth/register
                  {
                    "firstName": "Your Name",
                    "lastName": "Your Last Name",
                    "email": "%s",
                    "password": "your-password",
                    "invitationCode": "%s"
                  }

                Option 2 - Login (if you already have an account):
                  POST %s/api/auth/login
                  {
                    "email": "%s",
                    "password": "your-password",
                    "invitationCode": "%s"
                  }

                Option 3 - Accept via Web:
                  %s

                ──────────────────────────────────────────────────────────────

                This invitation expires in 7 days.

                If you have any questions, please contact your building manager.

                ═══════════════════════════════════════════════════════════════
                This is an automated message from Smart Entrance System (DEV MODE)
                ═══════════════════════════════════════════════════════════════

                """.formatted(
                toEmail, buildingName, unitNumber,
                buildingName, unitNumber,
                invitationCode,
                baseUrl, toEmail, invitationCode,
                baseUrl, toEmail, invitationCode,
                acceptUrl
        );
    }

    private void saveEmailToFile(String toEmail, String invitationCode, String content) {
        try {
            String timestamp = FILE_NAME_FORMATTER.format(Instant.now());
            String fileName = String.format("%s_invitation_%s_%s.txt",
                    timestamp, toEmail.replace("@", "_at_"), invitationCode);
            Path filePath = Paths.get(EMAIL_LOG_DIR, fileName);

            Files.writeString(filePath, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            log.info("📄 Email saved to file: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to save email to file", e);
        }
    }
}
