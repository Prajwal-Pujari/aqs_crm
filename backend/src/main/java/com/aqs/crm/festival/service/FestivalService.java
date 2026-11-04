package com.aqs.crm.festival.service;

import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contact.repository.ContactRepository;
import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailTemplate;
import com.aqs.crm.email.service.EmailQueueService;
import com.aqs.crm.email.service.EmailTemplateService;
import com.aqs.crm.email.service.TemplateRenderer;
import com.aqs.crm.festival.dto.FestivalCreateRequest;
import com.aqs.crm.festival.dto.FestivalDto;
import com.aqs.crm.festival.dto.FestivalUpdateRequest;
import com.aqs.crm.festival.entity.Festival;
import com.aqs.crm.festival.entity.FestivalGreetingsLog;
import com.aqs.crm.festival.repository.FestivalGreetingsLogRepository;
import com.aqs.crm.festival.repository.FestivalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class FestivalService {

    private final FestivalRepository festivalRepository;
    private final FestivalGreetingsLogRepository festivalGreetingsLogRepository;
    private final ContactRepository contactRepository;
    private final EmailTemplateService emailTemplateService;
    private final TemplateRenderer templateRenderer;
    private final EmailQueueService emailQueueService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional(readOnly = true)
    public List<FestivalDto> getAllFestivals() {
        return festivalRepository.findAllByOrderByFestivalDateAsc().stream()
                .map(FestivalDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public FestivalDto getFestival(Long id) {
        return FestivalDto.fromEntity(findOrThrow(id));
    }

    @Transactional
    public FestivalDto createFestival(FestivalCreateRequest req) {
        Festival festival = Festival.builder()
                .name(req.name().trim())
                .festivalDate(req.festivalDate())
                .templateKey(req.templateKey() != null && !req.templateKey().isBlank()
                        ? req.templateKey().trim()
                        : "festival_greeting_default")
                .customMessage(req.customMessage() != null ? req.customMessage().trim() : null)
                .isActive(req.isActive() != null ? req.isActive() : true)
                .build();

        Festival saved = festivalRepository.save(festival);
        log.info("Created festival: id={}, name={}, date={}", saved.getId(), saved.getName(), saved.getFestivalDate());
        return FestivalDto.fromEntity(saved);
    }

    @Transactional
    public FestivalDto updateFestival(Long id, FestivalUpdateRequest req) {
        Festival festival = findOrThrow(id);
        festival.setName(req.name().trim());
        festival.setFestivalDate(req.festivalDate());
        if (req.templateKey() != null && !req.templateKey().isBlank()) {
            festival.setTemplateKey(req.templateKey().trim());
        }
        festival.setCustomMessage(req.customMessage() != null ? req.customMessage().trim() : null);
        if (req.isActive() != null) {
            festival.setIsActive(req.isActive());
        }

        Festival saved = festivalRepository.save(festival);
        log.info("Updated festival: id={}, name={}", saved.getId(), saved.getName());
        return FestivalDto.fromEntity(saved);
    }

    @Transactional
    public void deleteFestival(Long id) {
        Festival festival = findOrThrow(id);
        festivalRepository.delete(festival);
        log.info("Deleted festival: id={}", id);
    }

    @Transactional
    public FestivalDto toggleFestival(Long id) {
        Festival festival = findOrThrow(id);
        festival.setIsActive(!Boolean.TRUE.equals(festival.getIsActive()));
        Festival saved = festivalRepository.save(festival);
        log.info("Toggled festival: id={}, isActive={}", saved.getId(), saved.getIsActive());
        return FestivalDto.fromEntity(saved);
    }

    /**
     * Evaluates all active festivals for the given date (matching month & day)
     * and queues greetings for all opted-in contacts idempotently.
     */
    @Transactional
    public int evaluateAndDispatchDailyGreetings(LocalDate date) {
        log.info("Evaluating daily festival greetings for date: {}", date);
        List<Festival> activeFestivals = festivalRepository.findByIsActiveTrueOrderByFestivalDateAsc();
        int totalQueued = 0;

        for (Festival f : activeFestivals) {
            if (f.getFestivalDate().getMonth() == date.getMonth() &&
                f.getFestivalDate().getDayOfMonth() == date.getDayOfMonth()) {
                totalQueued += dispatchGreetingsForFestival(f, date.getYear());
            }
        }

        log.info("Completed daily festival greetings check: {} emails queued", totalQueued);
        return totalQueued;
    }

    /**
     * Manually triggers festival greetings for a specific festival (for the current year).
     */
    @Transactional
    public int triggerGreetingsForFestival(Long festivalId) {
        Festival festival = findOrThrow(festivalId);
        int year = LocalDate.now().getYear();
        return dispatchGreetingsForFestival(festival, year);
    }

    private int dispatchGreetingsForFestival(Festival festival, int year) {
        List<Contact> optedInContacts = contactRepository.findByOptedInGreetingsTrueAndEmailIsNotNull();
        if (optedInContacts.isEmpty()) {
            log.info("No opted-in contacts found with email for festival: {}", festival.getName());
            return 0;
        }

        EmailTemplate template = emailTemplateService.getByTemplateKey(
                festival.getTemplateKey() != null ? festival.getTemplateKey() : "festival_greeting_default"
        );

        int queuedCount = 0;
        for (Contact contact : optedInContacts) {
            if (contact.getEmail() == null || contact.getEmail().isBlank()) {
                continue;
            }

            // Check idempotency
            boolean alreadySent = festivalGreetingsLogRepository
                    .existsByFestivalIdAndContactIdAndGreetingYear(festival.getId(), contact.getId(), year);

            if (alreadySent) {
                log.debug("Skipping already sent greeting for festival={}, contact={}, year={}",
                        festival.getName(), contact.getEmail(), year);
                continue;
            }

            // Ensure unsubscribe token exists
            if (contact.getUnsubscribeToken() == null || contact.getUnsubscribeToken().isBlank()) {
                contact.setUnsubscribeToken(UUID.randomUUID().toString().replace("-", ""));
                contactRepository.save(contact);
            }

            String unsubscribeUrl = frontendUrl + "/unsubscribe/" + contact.getUnsubscribeToken();

            Map<String, Object> vars = new HashMap<>();
            String contactFullName = (contact.getFirstName() + " " + (contact.getLastName() != null ? contact.getLastName() : "")).trim();
            vars.put("contact_name", contactFullName);
            vars.put("company_name", contact.getCompany() != null ? contact.getCompany().getName() : "Valued Partner");
            vars.put("festival_name", festival.getName());
            vars.put("custom_message", festival.getCustomMessage() != null ? festival.getCustomMessage() : "");
            vars.put("unsubscribe_url", unsubscribeUrl);

            String subject = templateRenderer.render(template.getSubject(), vars);
            String bodyHtml = templateRenderer.render(template.getBodyHtml(), vars);

            // Queue the greeting email
            emailQueueService.queueEmail(
                    contact.getEmail(),
                    contactFullName,
                    subject,
                    bodyHtml,
                    EmailCategory.GREETING,
                    null,
                    contact.getCompany(),
                    contact,
                    null
            );

            // Log greeting dispatch
            FestivalGreetingsLog gLog = FestivalGreetingsLog.builder()
                    .festival(festival)
                    .contact(contact)
                    .greetingYear(year)
                    .build();
            festivalGreetingsLogRepository.save(gLog);

            queuedCount++;
        }

        log.info("Queued {} festival greeting emails for festival: '{}' (Year: {})",
                queuedCount, festival.getName(), year);
        return queuedCount;
    }

    private Festival findOrThrow(Long id) {
        return festivalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Festival", "id", id));
    }
}

