package com.aqs.crm.email.service;

import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.email.dto.EmailTemplateDto;
import com.aqs.crm.email.entity.EmailTemplate;
import com.aqs.crm.email.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository emailTemplateRepository;

    @Transactional(readOnly = true)
    public List<EmailTemplateDto> getAllTemplates() {
        return emailTemplateRepository.findAll()
                .stream()
                .map(EmailTemplateDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmailTemplate getByTemplateKey(String templateKey) {
        return emailTemplateRepository.findByTemplateKey(templateKey)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", "templateKey", templateKey));
    }

    @Transactional(readOnly = true)
    public EmailTemplateDto getTemplateDto(String templateKey) {
        return EmailTemplateDto.fromEntity(getByTemplateKey(templateKey));
    }
}

