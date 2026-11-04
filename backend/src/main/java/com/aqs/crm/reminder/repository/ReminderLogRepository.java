package com.aqs.crm.reminder.repository;

import com.aqs.crm.reminder.entity.ReminderLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderLogRepository extends JpaRepository<ReminderLog, Long> {

    boolean existsByCycleIdAndReminderTypeAndContactId(Long cycleId, String reminderType, Long contactId);

    boolean existsByCycleIdAndReminderType(Long cycleId, String reminderType);

    @Query("SELECT r FROM ReminderLog r LEFT JOIN FETCH r.contact LEFT JOIN FETCH r.cycle WHERE r.cycle.id = :cycleId ORDER BY r.sentAt DESC")
    List<ReminderLog> findByCycleId(@Param("cycleId") Long cycleId);

    @Modifying
    @Query("UPDATE ReminderLog r SET r.isCancelled = true WHERE r.cycle.id = :cycleId")
    void cancelAllByCycleId(@Param("cycleId") Long cycleId);
}

