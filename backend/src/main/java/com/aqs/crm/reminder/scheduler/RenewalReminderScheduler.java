package com.aqs.crm.reminder.scheduler;

import com.aqs.crm.email.service.EmailQueueService;
import com.aqs.crm.reminder.service.RenewalReminderService;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Slf4j
@RequiredArgsConstructor
public class RenewalReminderScheduler {

    private final RenewalReminderService renewalReminderService;
    private final EmailQueueService emailQueueService;

    /**
     * Daily job running at 9:00 AM IST.
     * Protected by ShedLock so across any number of app replicas, only ONE instance runs.
     */
    @Scheduled(cron = "${app.scheduler.reminders-cron:0 0 9 * * ?}", zone = "Asia/Kolkata")
    @SchedulerLock(name = "renewalReminderTask", lockAtMostFor = "15m", lockAtLeastFor = "1m")
    public void executeDailyRenewalReminders() {
        LocalDate today = LocalDate.now();
        log.info("=== Starting Daily Renewal Reminder Job for {} (IST) ===", today);

        try {
            int remindersTriggered = renewalReminderService.processRemindersForDate(today);
            log.info("Daily renewal evaluation completed. {} reminders generated.", remindersTriggered);

            // Process any pending emails in queue
            int processedEmails = emailQueueService.processPendingQueue();
            log.info("Email queue dispatch completed. {} emails processed.", processedEmails);
        } catch (Exception ex) {
            log.error("Error occurred during daily renewal reminder execution: {}", ex.getMessage(), ex);
        }

        log.info("=== Finished Daily Renewal Reminder Job ===");
    }
}

