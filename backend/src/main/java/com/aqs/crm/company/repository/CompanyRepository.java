package com.aqs.crm.company.repository;

import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.entity.PipelineStage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Page<Company> findByPipelineStage(PipelineStage stage, Pageable pageable);

    Page<Company> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Company> findByNameContainingIgnoreCaseAndPipelineStage(String name, PipelineStage stage, Pageable pageable);

    @Query("SELECT c.pipelineStage, COUNT(c) FROM Company c GROUP BY c.pipelineStage")
    List<Object[]> countByPipelineStage();

    List<Company> findByAssignedToId(Long userId);
}
