package com.aqs.crm.email.repository;

import com.aqs.crm.email.entity.SmtpSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SmtpSettingsRepository extends JpaRepository<SmtpSettings, Long> {

    Optional<SmtpSettings> findFirstByIsActiveTrueOrderByIdDesc();
}

