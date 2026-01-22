package com.smartentrance.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${application.base-url}")
    private String baseUrl;

    public void sendInvitationEmail(String toEmail, String invitationCode, String buildingName, String unitNumber) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Invitation to " + buildingName + " - Unit " + unitNumber);

            String htmlContent = buildInvitationEmailHtml(invitationCode, buildingName, unitNumber);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Invitation email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send invitation email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send invitation email", e);
        }
    }

    private String buildInvitationEmailHtml(String invitationCode, String buildingName, String unitNumber) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }
                    .code-box {
                        background-color: #fff;
                        border: 2px dashed #4CAF50;
                        padding: 15px;
                        margin: 20px 0;
                        text-align: center;
                        border-radius: 5px;
                    }
                    .code {
                        font-size: 24px;
                        font-weight: bold;
                        color: #4CAF50;
                        letter-spacing: 2px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #4CAF50;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>You're Invited!</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You have been invited to join <strong>%s</strong> as a resident of Unit <strong>%s</strong>.</p>

                        <p>Use the following invitation code to complete your registration or login:</p>

                        <div class="code-box">
                            <div class="code">%s</div>
                        </div>

                        <p>This invitation code will allow you to:</p>
                        <ul>
                            <li>Register a new account if you don't have one</li>
                            <li>Access the building management system</li>
                            <li>Manage your unit and participate in building activities</li>
                        </ul>

                        <center>
                            <a href="%s" class="button">Access Smart Entrance</a>
                        </center>

                        <p style="margin-top: 30px; font-size: 14px; color: #666;">
                            If you have any questions, please contact your building manager.
                        </p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Smart Entrance System.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(buildingName, unitNumber, invitationCode, baseUrl);
    }
}
