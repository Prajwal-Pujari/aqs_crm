package com.aqs.crm.checklist.service;

import com.aqs.crm.checklist.dto.ChecklistItemDto;
import com.aqs.crm.checklist.entity.ChecklistItem;
import com.aqs.crm.checklist.repository.ChecklistItemRepository;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.user.entity.User;
import com.aqs.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class InstallationChecklistService {

    private final ChecklistItemRepository checklistItemRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    private static final List<String[]> DEFAULT_CHECKLIST = List.of(
            new String[]{"Verify system requirements", "Check OS, memory, disk, and network prerequisites on target host."},
            new String[]{"Obtain server access credentials", "Receive SSH/RDP and sudo/admin credentials securely."},
            new String[]{"Install software on client server", "Deploy product binaries or containers onto the target environment."},
            new String[]{"Configure database connection", "Set up database connection pool, run initial migrations and verify connectivity."},
            new String[]{"Import initial data", "Load master data, baseline catalog, and client specific settings."},
            new String[]{"Run acceptance tests", "Execute automated smoke tests and verify key workflows end-to-end."},
            new String[]{"Train primary users", "Conduct orientation and hands-on training session with client operators."},
            new String[]{"Handover documentation", "Share operational manuals, runbooks, and support contact details."},
            new String[]{"Go-live sign-off", "Obtain client formal sign-off confirming successful installation."}
    );

    @Transactional
    public void createDefaultChecklist(Long companyId) {
        if (checklistItemRepository.existsByCompanyId(companyId)) {
            log.info("Checklist items already exist for company id={}; skipping default creation", companyId);
            return;
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        int sortOrder = 1;
        for (String[] item : DEFAULT_CHECKLIST) {
            ChecklistItem checklistItem = ChecklistItem.builder()
                    .company(company)
                    .title(item[0])
                    .description(item[1])
                    .isCompleted(false)
                    .sortOrder(sortOrder++)
                    .build();
            checklistItemRepository.save(checklistItem);
        }
        log.info("Created {} default checklist items for company id={}", DEFAULT_CHECKLIST.size(), companyId);
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemDto> getChecklist(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }
        return checklistItemRepository.findByCompanyIdOrderBySortOrderAsc(companyId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ChecklistItemDto toggleItem(Long companyId, Long itemId, Long userId) {
        ChecklistItem item = checklistItemRepository.findByIdAndCompanyId(itemId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("ChecklistItem", "id", itemId));

        boolean newStatus = !Boolean.TRUE.equals(item.getIsCompleted());
        item.setIsCompleted(newStatus);

        if (newStatus) {
            item.setCompletedAt(Instant.now());
            if (userId != null) {
                User user = userRepository.findById(userId).orElse(null);
                item.setCompletedBy(user);
            }
        } else {
            item.setCompletedAt(null);
            item.setCompletedBy(null);
        }

        ChecklistItem saved = checklistItemRepository.save(item);
        log.info("Checklist item id={} toggled to {} by user={}", itemId, newStatus, userId);
        return toDto(saved);
    }

    public ChecklistItemDto toDto(ChecklistItem item) {
        String completedByName = item.getCompletedBy() != null ? item.getCompletedBy().getFullName() : null;
        return new ChecklistItemDto(
                item.getId(),
                item.getCompany().getId(),
                item.getTitle(),
                item.getDescription(),
                item.getIsCompleted(),
                item.getCompletedAt(),
                completedByName,
                item.getSortOrder(),
                item.getCreatedAt()
        );
    }
}

