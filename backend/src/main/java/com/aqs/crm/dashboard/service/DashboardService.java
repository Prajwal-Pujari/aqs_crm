package com.aqs.crm.dashboard.service;

import com.aqs.crm.activity.dto.ActivityDto;
import com.aqs.crm.activity.repository.ActivityRepository;
import com.aqs.crm.company.entity.PipelineStage;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contact.repository.ContactRepository;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.entity.CycleStatus;
import com.aqs.crm.contract.repository.ContractCycleRepository;
import com.aqs.crm.dashboard.dto.DashboardStatsDto;
import com.aqs.crm.dashboard.dto.UpcomingRenewalSummaryDto;
import com.aqs.crm.email.entity.QueueStatus;
import com.aqs.crm.email.repository.EmailLogRepository;
import com.aqs.crm.email.repository.EmailQueueRepository;
import com.aqs.crm.issue.entity.IssuePriority;
import com.aqs.crm.issue.entity.IssueStatus;
import com.aqs.crm.issue.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardService {

    private final ContractCycleRepository contractCycleRepository;
    private final CompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final IssueRepository issueRepository;
    private final EmailLogRepository emailLogRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final ActivityRepository activityRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        // 1. Contract cycles stats
        List<ContractCycle> activeCycles = contractCycleRepository.findByStatusWithDetails(CycleStatus.ACTIVE);
        BigDecimal totalArr = activeCycles.stream()
                .map(ContractCycle::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ContractCycle> renewalDueCycles = contractCycleRepository.findByStatusWithDetails(CycleStatus.RENEWAL_DUE);
        BigDecimal renewalsDueSum = renewalDueCycles.stream()
                .map(ContractCycle::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ContractCycle> overdueCycles = contractCycleRepository.findByStatusWithDetails(CycleStatus.OVERDUE);
        BigDecimal overdueSum = overdueCycles.stream()
                .map(ContractCycle::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Upcoming renewals (ACTIVE or RENEWAL_DUE)
        List<ContractCycle> upcomingList = contractCycleRepository
                .findByStatusInWithDetails(List.of(CycleStatus.RENEWAL_DUE, CycleStatus.ACTIVE))
                .stream()
                .limit(8)
                .toList();

        List<UpcomingRenewalSummaryDto> upcomingRenewals = upcomingList.stream()
                .map(UpcomingRenewalSummaryDto::fromEntity)
                .toList();

        List<UpcomingRenewalSummaryDto> overdueRenewals = overdueCycles.stream()
                .limit(8)
                .map(UpcomingRenewalSummaryDto::fromEntity)
                .toList();

        // 2. Companies & Stage Breakdown
        long totalCompanies = companyRepository.count();
        long totalContacts = contactRepository.count();

        Map<String, Long> stageMap = new LinkedHashMap<>();
        for (PipelineStage stage : PipelineStage.values()) {
            stageMap.put(stage.name(), 0L);
        }

        List<Object[]> stageCounts = companyRepository.countByPipelineStage();
        for (Object[] row : stageCounts) {
            if (row[0] != null && row[1] != null) {
                stageMap.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        // 3. Open Issues by Priority
        Map<String, Long> issuesMap = new LinkedHashMap<>();
        issuesMap.put("CRITICAL", issueRepository.countByPriorityAndStatusNot(IssuePriority.CRITICAL, IssueStatus.CLOSED));
        issuesMap.put("HIGH", issueRepository.countByPriorityAndStatusNot(IssuePriority.HIGH, IssueStatus.CLOSED));
        issuesMap.put("MEDIUM", issueRepository.countByPriorityAndStatusNot(IssuePriority.MEDIUM, IssueStatus.CLOSED));
        issuesMap.put("LOW", issueRepository.countByPriorityAndStatusNot(IssuePriority.LOW, IssueStatus.CLOSED));

        // 4. Email Engine Health
        long failedEmails = emailLogRepository.countByStatus("FAILED");
        long pendingEmails = emailQueueRepository.countByStatus(QueueStatus.PENDING);

        // 5. Recent Activities
        List<ActivityDto> recentActivities = Collections.emptyList();
        try {
            recentActivities = activityRepository.findRecentWithDetails(PageRequest.of(0, 6))
                    .stream()
                    .map(ActivityDto::fromEntity)
                    .toList();
        } catch (Exception e) {
            log.warn("Could not fetch recent activities: {}", e.getMessage());
        }

        return new DashboardStatsDto(
                totalArr,
                activeCycles.size(),
                renewalDueCycles.size(),
                renewalsDueSum,
                overdueCycles.size(),
                overdueSum,
                totalCompanies,
                totalContacts,
                stageMap,
                issuesMap,
                failedEmails,
                pendingEmails,
                upcomingRenewals,
                overdueRenewals,
                recentActivities
        );
    }
}

