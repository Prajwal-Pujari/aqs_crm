package com.aqs.crm.reminder.repository;

import com.aqs.crm.reminder.entity.ReminderConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderConfigRepository extends JpaRepository<ReminderConfig, Long> {

    @Query("SELECT r FROM ReminderConfig r JOIN FETCH r.template WHERE r.isActive = true ORDER BY r.daysOffset ASC")
    List<ReminderConfig> findActiveConfigsWithTemplate();

    Optional<ReminderConfig> findByTriggerCode(String triggerCode);
}

