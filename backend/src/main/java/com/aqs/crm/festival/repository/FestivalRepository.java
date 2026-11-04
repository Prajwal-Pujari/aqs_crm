package com.aqs.crm.festival.repository;

import com.aqs.crm.festival.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FestivalRepository extends JpaRepository<Festival, Long> {
    List<Festival> findAllByOrderByFestivalDateAsc();
    List<Festival> findByIsActiveTrueOrderByFestivalDateAsc();
    List<Festival> findByFestivalDateAndIsActiveTrue(LocalDate festivalDate);
}

