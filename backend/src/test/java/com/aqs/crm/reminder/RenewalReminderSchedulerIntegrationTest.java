package com.aqs.crm.reminder;

import com.aqs.crm.BaseIntegrationTest;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.entity.PipelineStage;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contact.repository.ContactRepository;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.entity.CycleStatus;
import com.aqs.crm.contract.repository.ContractCycleRepository;
import com.aqs.crm.email.entity.EmailQueue;
import com.aqs.crm.email.repository.EmailQueueRepository;
import com.aqs.crm.product.entity.Product;
import com.aqs.crm.product.repository.ProductRepository;
import com.aqs.crm.reminder.entity.ReminderLog;
import com.aqs.crm.reminder.repository.ReminderLogRepository;
import com.aqs.crm.reminder.service.RenewalReminderService;
import com.aqs.crm.subscription.entity.Subscription;
import com.aqs.crm.subscription.repository.SubscriptionRepository;
import com.aqs.crm.task.entity.Task;
import com.aqs.crm.task.repository.TaskRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class RenewalReminderSchedulerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private RenewalReminderService reminderService;

    @Autowired
    private ContractCycleRepository cycleRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private ReminderLogRepository reminderLogRepository;

    @Autowired
    private EmailQueueRepository emailQueueRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    @DisplayName("Reminder Scheduler: triggers 60-day reminder, enforces idempotency on rerun, and catches up missed windows")
    void testReminderSchedulerIdempotencyAndCatchUp() {
        LocalDate today = LocalDate.of(2026, 6, 1);

        // 1. Setup Company, Billing Contact, Product, Subscription
        Company company = companyRepository.save(Company.builder()
                .name("Reminder Test Corp " + System.currentTimeMillis())
                .pipelineStage(PipelineStage.LIVE)
                .build());

        Contact billingContact = contactRepository.save(Contact.builder()
                .company(company)
                .firstName("Suresh")
                .lastName("Patel")
                .email("suresh.patel@testcorp.com")
                .isBilling(true)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("MES Suite " + System.currentTimeMillis())
                .annualPrice(new BigDecimal("18000.00"))
                .build());

        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .company(company)
                .product(product)
                .site("Mumbai Plant")
                .build());

        // Cycle A: Expiry is exactly today + 60 days (2026-07-31)
        ContractCycle cycleA = cycleRepository.save(ContractCycle.builder()
                .subscription(subscription)
                .cycleNo(1)
                .startDate(LocalDate.of(2025, 8, 1))
                .endDate(today.plusDays(60)) // 60 days away
                .amount(new BigDecimal("18000.00"))
                .poNumber("PO-CYCLE-A")
                .status(CycleStatus.ACTIVE)
                .build());

        // 2. FIRST RUN: Evaluate reminders for `today`
        int firstRunCount = reminderService.processRemindersForDate(today);
        assertThat(firstRunCount).isGreaterThanOrEqualTo(1);

        // Verify reminder log exists
        List<ReminderLog> logsA = reminderLogRepository.findByCycleId(cycleA.getId());
        assertThat(logsA).hasSize(1);
        assertThat(logsA.get(0).getReminderType()).isEqualTo("BEFORE_60");
        assertThat(logsA.get(0).getContact().getId()).isEqualTo(billingContact.getId());

        // Verify email queue entry
        List<EmailQueue> queuedEmails = emailQueueRepository.findByCycleIdAndStatus(
                cycleA.getId(), com.aqs.crm.email.entity.QueueStatus.PENDING);
        assertThat(queuedEmails).hasSize(1);
        assertThat(queuedEmails.get(0).getToEmail()).isEqualTo("suresh.patel@testcorp.com");
        assertThat(queuedEmails.get(0).getSubject()).contains("60 days");

        // Verify internal follow-up task was auto-created
        List<Task> tasks = taskRepository.findByCycleId(cycleA.getId());
        assertThat(tasks).isNotEmpty();
        assertThat(tasks.get(0).getSource()).isEqualTo("REMINDER");

        // 3. IDEMPOTENCY TEST: Run SECOND time for same date
        int secondRunCount = reminderService.processRemindersForDate(today);
        assertThat(secondRunCount).isEqualTo(0);

        List<ReminderLog> logsAfterSecondRun = reminderLogRepository.findByCycleId(cycleA.getId());
        assertThat(logsAfterSecondRun).hasSize(1); // Still exactly 1!

        // 4. CATCH-UP TEST:
        // Create Cycle B where 60-day exact mark was missed (e.g. expiry is 50 days away)
        ContractCycle cycleB = cycleRepository.save(ContractCycle.builder()
                .subscription(subscription)
                .cycleNo(1)
                .startDate(LocalDate.of(2025, 8, 1))
                .endDate(today.plusDays(50)) // Missed the exact 60-day mark because server was offline
                .amount(new BigDecimal("18000.00"))
                .poNumber("PO-CYCLE-B")
                .status(CycleStatus.ACTIVE)
                .build());

        int catchUpRunCount = reminderService.processRemindersForDate(today);
        assertThat(catchUpRunCount).isGreaterThanOrEqualTo(1);

        // Verify cycleB received catch-up BEFORE_60 reminder
        List<ReminderLog> logsB = reminderLogRepository.findByCycleId(cycleB.getId());
        assertThat(logsB).hasSize(1);
        assertThat(logsB.get(0).getReminderType()).isEqualTo("BEFORE_60");
    }
}

