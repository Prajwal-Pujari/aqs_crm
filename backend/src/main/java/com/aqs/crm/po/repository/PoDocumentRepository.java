package com.aqs.crm.po.repository;

import com.aqs.crm.po.entity.PoDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PoDocumentRepository extends JpaRepository<PoDocument, Long> {

    List<PoDocument> findByCycleId(Long cycleId);

    Optional<PoDocument> findByIdAndCycleId(Long id, Long cycleId);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM PoDocument d " +
           "LEFT JOIN FETCH d.uploadedBy " +
           "LEFT JOIN FETCH d.cycle c " +
           "LEFT JOIN FETCH c.subscription s " +
           "WHERE s.company.id = :companyId " +
           "ORDER BY d.createdAt DESC")
    List<PoDocument> findByCompanyIdWithDetails(@org.springframework.data.repository.query.Param("companyId") Long companyId);
}

