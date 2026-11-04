package com.aqs.crm.email.service;

import com.aqs.crm.company.entity.Company;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailLog;
import com.aqs.crm.email.entity.EmailQueue;
import com.aqs.crm.email.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailSenderService {

    private final SmtpSettingsService smtpSettingsService;
    private final EmailLogRepository emailLogRepository;

    @Value("${app.mail.from:noreply@aqs.com}")
    private String defaultFromEmail;

    public record EmailSendResult(boolean success, String errorMessage) {}

    public boolean sendHtmlEmail(String toEmail, String toName, String subject, String bodyHtml,
                                 EmailCategory category, EmailQueue queue,
                                 Company company, Contact contact, ContractCycle cycle) {
        return sendHtmlEmailWithDetails(toEmail, toName, subject, bodyHtml, category, queue, company, contact, cycle).success();
    }

    public EmailSendResult sendHtmlEmailWithDetails(String toEmail, String toName, String subject, String bodyHtml,
                                                   EmailCategory category, EmailQueue queue,
                                                   Company company, Contact contact, ContractCycle cycle) {
        log.info("Sending {} email to: <{}>, Subject: '{}'", category, toEmail, subject);

        boolean success = false;
        String errorMessage = null;

        try {
            JavaMailSender mailSender = smtpSettingsService.getEffectiveMailSender();
            String fromEmail = smtpSettingsService.getEffectiveFromEmail();
            if (fromEmail == null || fromEmail.isBlank() || "noreply@aqs.com".equals(fromEmail)) {
                fromEmail = defaultFromEmail;
            }
            String fromName = smtpSettingsService.getEffectiveFromName();

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);

            mailSender.send(message);
            success = true;
            log.info("Email successfully sent to <{}> via from=<{}>", toEmail, fromEmail);
        } catch (Exception ex) {
            log.error("Failed to send email to <{}>: {}", toEmail, ex.getMessage());
            errorMessage = ex.getMessage();
        }

        // Log the send attempt
        try {
            logEmailAttempt(queue, toEmail, toName, subject, category,
                    success ? "SENT" : "FAILED", errorMessage, company, contact, cycle);
        } catch (Exception e) {
            log.error("Failed to persist email log: {}", e.getMessage());
        }

        return new EmailSendResult(success, errorMessage);
    }

    @Transactional
    public void logEmailAttempt(EmailQueue queue, String toEmail, String toName, String subject,
                                EmailCategory category, String status, String errorMessage,
                                Company company, Contact contact, ContractCycle cycle) {
        EmailLog emailLog = EmailLog.builder()
                .queue(queue)
                .toEmail(toEmail)
                .toName(toName)
                .subject(subject)
                .category(category)
                .status(status)
                .errorMessage(errorMessage)
                .company(company)
                .contact(contact)
                .cycle(cycle)
                .build();

        emailLogRepository.save(emailLog);
    }
}

