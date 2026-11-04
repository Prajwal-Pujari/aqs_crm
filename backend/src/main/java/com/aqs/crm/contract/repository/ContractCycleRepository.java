package com.aqs.crm.contract.repository;

import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.entity.CycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractCycleRepository extends JpaRepository<ContractCycle, Long> {

    List<ContractCycle> findBySubscriptionIdOrderByCycleNoDesc(Long subscriptionId);

    Optional<ContractCycle> findByIdAndSubscriptionId(Long id, Long subscriptionId);

    Optional<ContractCycle> findTopBySubscriptionIdOrderByCycleNoDesc(Long subscriptionId);

    @Query("SELECT cc FROM ContractCycle cc WHERE cc.status = 'ACTIVE' AND cc.endDate BETWEEN :start AND :end")
    List<ContractCycle> findActiveWithEndDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT cc FROM ContractCycle cc WHERE cc.status = 'ACTIVE' AND cc.endDate < :date")
    List<ContractCycle> findActiveOverdue(@Param("date") LocalDate date);

    int countByStatus(CycleStatus status);

    List<ContractCycle> findByStatusIn(List<CycleStatus> statuses);

    @Query("SELECT cc FROM ContractCycle cc WHERE cc.status IN ('ACTIVE','RENEWAL_DUE') AND cc.endDate BETWEEN :start AND :end")
    List<ContractCycle> findDueForRenewalBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT cc FROM ContractCycle cc " +
           "LEFT JOIN FETCH cc.subscription s " +
           "LEFT JOIN FETCH s.company " +
           "LEFT JOIN FETCH s.product " +
           "WHERE cc.status = :status " +
           "ORDER BY cc.endDate ASC")
    List<ContractCycle> findByStatusWithDetails(@Param("status") CycleStatus status);

    @Query("SELECT cc FROM ContractCycle cc " +
           "LEFT JOIN FETCH cc.subscription s " +
           "LEFT JOIN FETCH s.company " +
           "LEFT JOIN FETCH s.product " +
           "WHERE cc.status IN :statuses " +
           "ORDER BY cc.endDate ASC")
    List<ContractCycle> findByStatusInWithDetails(@Param("statuses") List<CycleStatus> statuses);
}

