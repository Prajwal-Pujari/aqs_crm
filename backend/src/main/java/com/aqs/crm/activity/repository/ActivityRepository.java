package com.aqs.crm.activity.repository;

import com.aqs.crm.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    @Query("SELECT a FROM Activity a " +
           "LEFT JOIN FETCH a.company " +
           "LEFT JOIN FETCH a.contact " +
           "LEFT JOIN FETCH a.user " +
           "WHERE a.company.id = :companyId " +
           "ORDER BY a.createdAt DESC")
    List<Activity> findByCompanyIdWithDetails(@Param("companyId") Long companyId);

    @Query("SELECT a FROM Activity a " +
           "LEFT JOIN FETCH a.company " +
           "LEFT JOIN FETCH a.contact " +
           "LEFT JOIN FETCH a.user " +
           "ORDER BY a.createdAt DESC")
    List<Activity> findRecentWithDetails(org.springframework.data.domain.Pageable pageable);
}

