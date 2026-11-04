package com.aqs.crm.email.service;

import com.aqs.crm.email.dto.SmtpSettingsDto;
import com.aqs.crm.email.dto.SmtpSettingsUpdateRequest;
import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.SmtpSettings;
import com.aqs.crm.email.repository.SmtpSettingsRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Properties;

@Service
@Slf4j
@RequiredArgsConstructor
public class SmtpSettingsService {

    private final SmtpSettingsRepository smtpSettingsRepository;
    private final JavaMailSender defaultMailSender;

    @Transactional(readOnly = true)
    public SmtpSettingsDto getSettingsDto() {
        SmtpSettings settings = getOrCreateSettings();
        return SmtpSettingsDto.fromEntity(settings);
    }

    @Transactional
    public SmtpSettings getOrCreateSettings() {
        return smtpSettingsRepository.findFirstByIsActiveTrueOrderByIdDesc()
                .orElseGet(() -> {
                    SmtpSettings defaultSettings = SmtpSettings.builder()
                            .host("smtpout.secureserver.net")
                            .port(587)
                            .protocol("smtp")
                            .fromName("AQS Renewal CRM")
                            .starttlsEnabled(true)
                            .sslEnabled(false)
                            .isActive(true)
                            .build();
                    return smtpSettingsRepository.save(defaultSettings);
                });
    }

    @Transactional
    public SmtpSettingsDto updateSettings(SmtpSettingsUpdateRequest req) {
        SmtpSettings settings = getOrCreateSettings();

        settings.setHost(req.host().trim());
        settings.setPort(req.port());
        settings.setProtocol(req.protocol() != null && !req.protocol().isBlank() ? req.protocol().trim() : "smtp");
        settings.setUsername(req.username().trim());

        // Only update password if a new one is supplied
        if (req.password() != null && !req.password().isBlank()) {
            settings.setPassword(req.password());
        }

        settings.setFromEmail(req.fromEmail() != null && !req.fromEmail().isBlank() ? req.fromEmail().trim() : req.username().trim());
        settings.setFromName(req.fromName() != null && !req.fromName().isBlank() ? req.fromName().trim() : "AQS Renewal CRM");
        settings.setStarttlsEnabled(req.starttlsEnabled() != null ? req.starttlsEnabled() : true);
        settings.setSslEnabled(req.sslEnabled() != null ? req.sslEnabled() : false);
        settings.setIsActive(true);

        SmtpSettings saved = smtpSettingsRepository.save(settings);
        log.info("Saved dynamic SMTP settings in database: host={}, port={}, username={}, fromEmail={}",
                saved.getHost(), saved.getPort(), saved.getUsername(), saved.getFromEmail());

        return SmtpSettingsDto.fromEntity(saved);
    }

    /**
     * Resolves an active JavaMailSender:
     * If configured in the database, returns a dynamically constructed JavaMailSenderImpl.
     * Otherwise falls back to the default Spring mail sender.
     */
    public JavaMailSender getEffectiveMailSender() {
        Optional<SmtpSettings> opt = smtpSettingsRepository.findFirstByIsActiveTrueOrderByIdDesc();
        if (opt.isPresent()) {
            SmtpSettings s = opt.get();
            if (s.getUsername() != null && !s.getUsername().isBlank() &&
                s.getPassword() != null && !s.getPassword().isBlank()) {

                JavaMailSenderImpl impl = new JavaMailSenderImpl();
                impl.setHost(s.getHost());
                impl.setPort(s.getPort());
                impl.setUsername(s.getUsername());
                impl.setPassword(s.getPassword());
                impl.setProtocol(s.getProtocol() != null ? s.getProtocol() : "smtp");

                Properties props = impl.getJavaMailProperties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", String.valueOf(Boolean.TRUE.equals(s.getStarttlsEnabled())));
                if (Boolean.TRUE.equals(s.getStarttlsEnabled())) {
                    props.put("mail.smtp.starttls.required", "true");
                }
                props.put("mail.smtp.ssl.enable", String.valueOf(Boolean.TRUE.equals(s.getSslEnabled())));
                if (Boolean.TRUE.equals(s.getSslEnabled())) {
                    props.put("mail.smtp.socketFactory.port", String.valueOf(s.getPort()));
                    props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                    props.put("mail.smtp.socketFactory.fallback", "false");
                }
                props.put("mail.smtp.ssl.trust", "*");
                props.put("mail.smtp.connectiontimeout", "10000");
                props.put("mail.smtp.timeout", "10000");
                props.put("mail.smtp.writetimeout", "10000");

                log.debug("Using dynamic database-backed JavaMailSender for host={}:{}", s.getHost(), s.getPort());
                return impl;
            }
        }

        log.debug("Using default Spring-configured JavaMailSender");
        return defaultMailSender;
    }

    public String getEffectiveFromEmail() {
        return smtpSettingsRepository.findFirstByIsActiveTrueOrderByIdDesc()
                .map(SmtpSettings::getFromEmail)
                .filter(e -> e != null && !e.isBlank())
                .orElse("noreply@aqs.com");
    }

    public String getEffectiveFromName() {
        return smtpSettingsRepository.findFirstByIsActiveTrueOrderByIdDesc()
                .map(SmtpSettings::getFromName)
                .filter(n -> n != null && !n.isBlank())
                .orElse("AQS Renewal CRM");
    }
}
