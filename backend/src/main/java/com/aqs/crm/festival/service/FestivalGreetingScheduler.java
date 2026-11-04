package com.aqs.crm.festival.service;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
@Slf4j
@RequiredArgsConstructor
public class FestivalGreetingScheduler {

    private final FestivalService festivalService;

    /**
     * Daily festival greetings job running at 09:15 AM IST (Asia/Kolkata).
     * Protected by ShedLock distributed lock to guarantee single-instance execution.
     */
    @Scheduled(cron = "0 15 9 * * *", zone = "Asia/Kolkata")
    @SchedulerLock(name = "festivalGreetingJob", lockAtLeastFor = "PT2M", lockAtMostFor = "PT15M")
    public void runDailyFestivalGreetingJob() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        log.info("Starting scheduled daily festival greetings evaluation for date: {}", today);
        try {
            int dispatched = festivalService.evaluateAndDispatchDailyGreetings(today);
            log.info("Scheduled festival greeting run complete: {} greetings queued", dispatched);
        } catch (Exception ex) {
            log.error("Error occurred during festival greeting evaluation: {}", ex.getMessage(), ex);
        }
    }
}

