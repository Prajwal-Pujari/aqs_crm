package com.aqs.crm.pipeline.repository;

import com.aqs.crm.pipeline.entity.StageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StageHistoryRepository extends JpaRepository<StageHistory, Long> {

    List<StageHistory> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}

