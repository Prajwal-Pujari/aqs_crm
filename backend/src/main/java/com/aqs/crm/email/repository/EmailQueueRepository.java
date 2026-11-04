package com.aqs.crm.email.repository;

import com.aqs.crm.email.entity.EmailQueue;
import com.aqs.crm.email.entity.QueueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailQueueRepository extends JpaRepository<EmailQueue, Long> {

    List<EmailQueue> findTop50ByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
            QueueStatus status,
            LocalDateTime scheduledAt
    );

    List<EmailQueue> findByCycleIdAndStatus(Long cycleId, QueueStatus status);

    Page<EmailQueue> findByStatusOrderByCreatedAtDesc(QueueStatus status, Pageable pageable);

    long countByStatus(QueueStatus status);
}

