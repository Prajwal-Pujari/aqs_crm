package com.aqs.crm.pipeline.service;

import com.aqs.crm.audit.service.AuditService;
import com.aqs.crm.checklist.service.InstallationChecklistService;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.dto.CompanyDto;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.entity.PipelineStage;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.company.service.CompanyService;
import com.aqs.crm.pipeline.dto.StageChangeRequest;
import com.aqs.crm.pipeline.dto.StageHistoryDto;
import com.aqs.crm.pipeline.entity.StageHistory;
import com.aqs.crm.pipeline.repository.StageHistoryRepository;
import com.aqs.crm.user.entity.User;
import com.aqs.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PipelineService {

    private final CompanyRepository companyRepository;
    private final StageHistoryRepository stageHistoryRepository;
    private final UserRepository userRepository;
    private final InstallationChecklistService checklistService;
    private final AuditService auditService;
    private final CompanyService companyService;

    @Transactional
    public CompanyDto changeStage(Long companyId, StageChangeRequest request, Long userId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        PipelineStage fromStage = company.getPipelineStage();
        PipelineStage toStage = request.newStage();

        if (fromStage == toStage) {
            return companyService.getCompanyById(companyId);
        }

        User changedByUser = null;
        if (userId != null) {
            changedByUser = userRepository.findById(userId).orElse(null);
        }

        StageHistory history = StageHistory.builder()
                .company(company)
                .fromStage(fromStage)
                .toStage(toStage)
                .changedBy(changedByUser)
                .notes(request.notes())
                .build();
        stageHistoryRepository.save(history);

        company.setPipelineStage(toStage);
        companyRepository.save(company);

        // Audit log stage change
        auditService.logChange("COMPANY", companyId, "STAGE_CHANGE", "pipelineStage",
                fromStage != null ? fromStage.name() : null, toStage.name(), userId);

        // Auto-create installation checklist if moving to INSTALLATION
        if (toStage == PipelineStage.INSTALLATION) {
            log.info("Company id={} moved to INSTALLATION stage; generating default installation checklist", companyId);
            checklistService.createDefaultChecklist(companyId);
        }

        log.info("Company id={} stage changed from {} to {} by user id={}", companyId, fromStage, toStage, userId);
        return companyService.getCompanyById(companyId);
    }

    @Transactional(readOnly = true)
    public List<StageHistoryDto> getStageHistory(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }

        return stageHistoryRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(this::toDto)
                .toList();
    }

    public StageHistoryDto toDto(StageHistory history) {
        String changedByName = history.getChangedBy() != null ? history.getChangedBy().getFullName() : null;
        return new StageHistoryDto(
                history.getId(),
                history.getCompany().getId(),
                history.getFromStage() != null ? history.getFromStage().name() : null,
                history.getToStage().name(),
                changedByName,
                history.getNotes(),
                history.getCreatedAt()
        );
    }
}

