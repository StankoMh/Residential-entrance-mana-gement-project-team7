package com.smartentrance.backend.service;

/**
 * Interface for sending emails
 */
public interface EmailSender {
    void sendInvitationEmail(String toEmail, String invitationCode, String buildingName, String unitNumber);
}
