package com.aqs.crm.email.service;

import com.aqs.crm.common.dto.PagedResponse;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.email.dto.EmailQueueDto;
import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailQueue;
import com.aqs.crm.email.entity.QueueStatus;
import com.aqs.crm.email.repository.EmailQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailQueueService {

    private final EmailQueueRepository emailQueueRepository;
    private final EmailSenderService emailSenderService;

    @Transactional
    public EmailQueue queueEmail(String toEmail, String toName, String subject, String bodyHtml,
                                 EmailCategory category, LocalDateTime scheduledAt,
                                 Company company, Contact contact, ContractCycle cycle) {
        EmailQueue queue = EmailQueue.builder()
                .toEmail(toEmail)
                .toName(toName)
                .subject(subject)
                .bodyHtml(bodyHtml)
                .category(category)
                .status(QueueStatus.PENDING)
                .retryCount(0)
                .maxRetries(3)
                .scheduledAt(scheduledAt != null ? scheduledAt : LocalDateTime.now())
                .company(company)
                .contact(contact)
                .cycle(cycle)
                .build();

        EmailQueue saved = emailQueueRepository.save(queue);
        log.info("Queued {} email for <{}> (Queue ID: {})", category, toEmail, saved.getId());
        return saved;
    }

    @Transactional
    public int processPendingQueue() {
        LocalDateTime now = LocalDateTime.now();
        List<EmailQueue> pendingItems = emailQueueRepository
                .findTop50ByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(QueueStatus.PENDING, now);

        if (pendingItems.isEmpty()) {
            return 0;
        }

        log.info("Processing {} pending email queue items", pendingItems.size());
        int processedCount = 0;

        for (EmailQueue item : pendingItems) {
            item.setStatus(QueueStatus.PROCESSING);
            emailQueueRepository.save(item);

            boolean success = emailSenderService.sendHtmlEmail(
                    item.getToEmail(),
                    item.getToName(),
                    item.getSubject(),
                    item.getBodyHtml(),
                    item.getCategory(),
                    item,
                    item.getCompany(),
                    item.getContact(),
                    item.getCycle()
            );

            if (success) {
                item.setStatus(QueueStatus.SENT);
                item.setProcessedAt(LocalDateTime.now());
                item.setErrorMessage(null);
            } else {
                int newRetry = item.getRetryCount() + 1;
                item.setRetryCount(newRetry);
                if (newRetry >= item.getMaxRetries()) {
                    item.setStatus(QueueStatus.FAILED);
                    item.setErrorMessage("Max retries exceeded");
                } else {
                    item.setStatus(QueueStatus.PENDING);
                    item.setScheduledAt(LocalDateTime.now().plusMinutes(5L * newRetry));
                    item.setErrorMessage("Failed attempt #" + newRetry);
                }
            }

            emailQueueRepository.save(item);
            processedCount++;
        }

        return processedCount;
    }

    @Transactional
    public void cancelPendingByCycleId(Long cycleId) {
        List<EmailQueue> pending = emailQueueRepository.findByCycleIdAndStatus(cycleId, QueueStatus.PENDING);
        for (EmailQueue item : pending) {
            item.setStatus(QueueStatus.CANCELLED);
            item.setErrorMessage("Contract cycle was renewed or lapsed");
        }
        if (!pending.isEmpty()) {
            emailQueueRepository.saveAll(pending);
            log.info("Cancelled {} pending queue items for cycle ID: {}", pending.size(), cycleId);
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<EmailQueueDto> getQueue(QueueStatus status, Pageable pageable) {
        Page<EmailQueue> page = emailQueueRepository.findByStatusOrderByCreatedAtDesc(
                status != null ? status : QueueStatus.PENDING, pageable);
        List<EmailQueueDto> content = page.getContent().stream().map(EmailQueueDto::fromEntity).toList();
        return PagedResponse.of(page, content);
    }
}

