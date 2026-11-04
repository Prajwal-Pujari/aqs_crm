package com.aqs.crm.contract;

import com.aqs.crm.BaseIntegrationTest;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.entity.PipelineStage;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contract.dto.ContractCycleCreateRequest;
import com.aqs.crm.contract.dto.ContractCycleDto;
import com.aqs.crm.contract.dto.RenewRequest;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.entity.CycleStatus;
import com.aqs.crm.contract.repository.ContractCycleRepository;
import com.aqs.crm.contract.service.ContractCycleService;
import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailQueue;
import com.aqs.crm.email.entity.QueueStatus;
import com.aqs.crm.email.repository.EmailQueueRepository;
import com.aqs.crm.product.entity.Product;
import com.aqs.crm.product.repository.ProductRepository;
import com.aqs.crm.reminder.entity.ReminderLog;
import com.aqs.crm.reminder.repository.ReminderLogRepository;
import com.aqs.crm.subscription.entity.Subscription;
import com.aqs.crm.subscription.repository.SubscriptionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class RenewalFlowIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ContractCycleService contractCycleService;

    @Autowired
    private ContractCycleRepository contractCycleRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private ReminderLogRepository reminderLogRepository;

    @Autowired
    private EmailQueueRepository emailQueueRepository;

    @Test
    @DisplayName("Renewal flow: creates cycle #2, marks cycle #1 RENEWED, sets start = oldEnd + 1, cancels pending reminders")
    void testRenewalFlow() {
        // 1. Setup Company & Product
        Company company = companyRepository.save(Company.builder()
                .name("Renewal Test Enterprise " + System.currentTimeMillis())
                .pipelineStage(PipelineStage.LIVE)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("CAD Suite Pro " + System.currentTimeMillis())
                .annualPrice(new BigDecimal("20000.00"))
                .build());

        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .company(company)
                .product(product)
                .site("Headquarters")
                .version("3.0")
                .build());

        // 2. Create Cycle #1 (2026-01-01 to 2026-12-31)
        ContractCycleCreateRequest cycle1Req = new ContractCycleCreateRequest(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31),
                new BigDecimal("20000.00"),
                "PO-TEST-Y1",
                LocalDate.of(2025, 12, 15),
                "Initial subscription"
        );
        ContractCycleDto cycle1Dto = contractCycleService.createFirstCycle(subscription.getId(), cycle1Req, 1L);
        assertThat(cycle1Dto.cycleNo()).isEqualTo(1);
        assertThat(cycle1Dto.status()).isEqualTo(CycleStatus.ACTIVE);

        ContractCycle cycle1 = contractCycleRepository.findById(cycle1Dto.id()).orElseThrow();

        // 3. Simulate pending reminder and pending email queue for Cycle #1
        EmailQueue queueItem = emailQueueRepository.save(EmailQueue.builder()
                .toEmail("billing@testenterprise.com")
                .subject("Upcoming Renewal")
                .bodyHtml("<p>Reminder</p>")
                .category(EmailCategory.TRANSACTIONAL)
                .status(QueueStatus.PENDING)
                .cycle(cycle1)
                .company(company)
                .build());

        reminderLogRepository.save(ReminderLog.builder()
                .cycle(cycle1)
                .reminderType("BEFORE_30")
                .emailQueue(queueItem)
                .isCancelled(false)
                .build());

        // 4. Renew Cycle #1
        RenewRequest renewReq = new RenewRequest(
                null, // will default to 2026-12-31 + 1 day = 2027-01-01
                null, // will default to 2027-01-01 + 1 year - 1 day = 2027-12-31
                new BigDecimal("22000.00"),
                "PO-TEST-Y2",
                LocalDate.of(2026, 12, 20),
                "Year 2 renewal"
        );

        ContractCycleDto cycle2Dto = contractCycleService.renewCycle(subscription.getId(), cycle1.getId(), renewReq, 1L);

        // 5. Verify Cycle #2 properties
        assertThat(cycle2Dto.cycleNo()).isEqualTo(2);
        assertThat(cycle2Dto.startDate()).isEqualTo(LocalDate.of(2027, 1, 1));
        assertThat(cycle2Dto.endDate()).isEqualTo(LocalDate.of(2027, 12, 31));
        assertThat(cycle2Dto.amount()).isEqualByComparingTo(new BigDecimal("22000.00"));
        assertThat(cycle2Dto.status()).isEqualTo(CycleStatus.ACTIVE);
        assertThat(cycle2Dto.renewedFromId()).isEqualTo(cycle1.getId());

        // 6. Verify Cycle #1 is marked RENEWED
        ContractCycle updatedCycle1 = contractCycleRepository.findById(cycle1.getId()).orElseThrow();
        assertThat(updatedCycle1.getStatus()).isEqualTo(CycleStatus.RENEWED);

        // 7. Verify pending reminder log and queued email for Cycle #1 were cancelled
        List<ReminderLog> reminderLogs = reminderLogRepository.findByCycleId(cycle1.getId());
        assertThat(reminderLogs).isNotEmpty();
        assertThat(reminderLogs.get(0).getIsCancelled()).isTrue();

        EmailQueue updatedQueue = emailQueueRepository.findById(queueItem.getId()).orElseThrow();
        assertThat(updatedQueue.getStatus()).isEqualTo(QueueStatus.CANCELLED);
    }
}

