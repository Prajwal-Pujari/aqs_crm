package com.aqs.crm.issue.repository;

import com.aqs.crm.issue.entity.Issue;
import com.aqs.crm.issue.entity.IssuePriority;
import com.aqs.crm.issue.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    @Query("SELECT i FROM Issue i " +
           "LEFT JOIN FETCH i.company " +
           "LEFT JOIN FETCH i.reportedByContact " +
           "LEFT JOIN FETCH i.assignedToUser " +
           "WHERE i.company.id = :companyId " +
           "ORDER BY i.createdAt DESC")
    List<Issue> findByCompanyIdWithDetails(@Param("companyId") Long companyId);

    @Query("SELECT i FROM Issue i " +
           "LEFT JOIN FETCH i.company " +
           "LEFT JOIN FETCH i.reportedByContact " +
           "LEFT JOIN FETCH i.assignedToUser " +
           "ORDER BY i.createdAt DESC")
    List<Issue> findAllWithDetails();

    long countByStatus(IssueStatus status);

    long countByPriorityAndStatusNot(IssuePriority priority, IssueStatus status);
}

