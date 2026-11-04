package com.aqs.crm.task.repository;

import com.aqs.crm.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByCompanyIdOrderByDueDateAsc(Long companyId);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t " +
           "LEFT JOIN FETCH t.company " +
           "LEFT JOIN FETCH t.cycle " +
           "LEFT JOIN FETCH t.assignedTo " +
           "LEFT JOIN FETCH t.createdBy " +
           "WHERE t.company.id = :companyId " +
           "ORDER BY t.dueDate ASC")
    List<Task> findByCompanyIdWithDetails(@org.springframework.data.repository.query.Param("companyId") Long companyId);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t " +
           "LEFT JOIN FETCH t.company " +
           "LEFT JOIN FETCH t.cycle " +
           "LEFT JOIN FETCH t.assignedTo " +
           "LEFT JOIN FETCH t.createdBy " +
           "ORDER BY t.dueDate ASC")
    List<Task> findAllWithDetails();

    List<Task> findByCycleId(Long cycleId);

    List<Task> findByAssignedToIdAndIsCompletedFalseOrderByDueDateAsc(Long userId);
}

