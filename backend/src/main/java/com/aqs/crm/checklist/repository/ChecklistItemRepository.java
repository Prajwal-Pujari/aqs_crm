package com.aqs.crm.checklist.repository;

import com.aqs.crm.checklist.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    List<ChecklistItem> findByCompanyIdOrderBySortOrderAsc(Long companyId);

    Optional<ChecklistItem> findByIdAndCompanyId(Long id, Long companyId);

    boolean existsByCompanyId(Long companyId);
}

