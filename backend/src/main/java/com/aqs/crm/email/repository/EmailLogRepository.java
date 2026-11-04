package com.aqs.crm.email.repository;

import com.aqs.crm.email.entity.EmailLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    List<EmailLog> findByCompanyIdOrderBySentAtDesc(Long companyId);

    List<EmailLog> findByCycleIdOrderBySentAtDesc(Long cycleId);

    Page<EmailLog> findAllByOrderBySentAtDesc(Pageable pageable);

    long countByStatus(String status);
}

