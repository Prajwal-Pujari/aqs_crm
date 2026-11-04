package com.aqs.crm.unsubscribe.service;

import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contact.repository.ContactRepository;
import com.aqs.crm.unsubscribe.dto.ContactPreferenceDto;
import com.aqs.crm.unsubscribe.dto.UnsubscribeUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UnsubscribeService {

    private final ContactRepository contactRepository;

    @Transactional(readOnly = true)
    public ContactPreferenceDto getPreferences(String token) {
        Contact contact = findByToken(token);
        return ContactPreferenceDto.fromEntity(contact);
    }

    @Transactional
    public ContactPreferenceDto updatePreferences(String token, UnsubscribeUpdateRequest req) {
        Contact contact = findByToken(token);

        if (req.optedInGreetings() != null) {
            contact.setOptedInGreetings(req.optedInGreetings());
        }
        if (req.optedInPromos() != null) {
            contact.setOptedInPromos(req.optedInPromos());
        }

        Contact saved = contactRepository.save(contact);
        log.info("Updated communication preferences for contact id={}, email={}: greetings={}, promos={}",
                saved.getId(), saved.getEmail(), saved.getOptedInGreetings(), saved.getOptedInPromos());

        return ContactPreferenceDto.fromEntity(saved);
    }

    private Contact findByToken(String token) {
        if (token == null || token.isBlank()) {
            throw new ResourceNotFoundException("Invalid or missing unsubscribe token");
        }
        return contactRepository.findByUnsubscribeToken(token.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No contact found for the given unsubscribe link"));
    }
}

