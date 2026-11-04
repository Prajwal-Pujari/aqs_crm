package com.aqs.crm.dashboard.dto;

import com.aqs.crm.activity.dto.ActivityDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardStatsDto(
        BigDecimal totalArr,
        long activeContractsCount,
        long renewalsDueCount,
        BigDecimal renewalsDueSum,
        long overdueCount,
        BigDecimal overdueSum,
        long totalCompaniesCount,
        long totalContactsCount,
        Map<String, Long> stagesBreakdown,
        Map<String, Long> openIssuesByPriority,
        long failedEmailsCount,
        long pendingQueueCount,
        List<UpcomingRenewalSummaryDto> upcomingRenewals,
        List<UpcomingRenewalSummaryDto> overdueContracts,
        List<ActivityDto> recentActivities
) {
}

