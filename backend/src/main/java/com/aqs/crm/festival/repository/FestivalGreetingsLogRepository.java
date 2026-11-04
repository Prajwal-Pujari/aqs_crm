package com.aqs.crm.festival.repository;

import com.aqs.crm.festival.entity.FestivalGreetingsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FestivalGreetingsLogRepository extends JpaRepository<FestivalGreetingsLog, Long> {
    boolean existsByFestivalIdAndContactIdAndGreetingYear(Long festivalId, Long contactId, Integer greetingYear);
}

