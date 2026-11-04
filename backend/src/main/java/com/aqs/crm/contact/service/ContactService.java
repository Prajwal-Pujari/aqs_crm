package com.aqs.crm.contact.service;

import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contact.dto.ContactCreateRequest;
import com.aqs.crm.contact.dto.ContactDto;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contact.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<ContactDto> getContactsByCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }
        return contactRepository.findByCompanyId(companyId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContactDto getContact(Long companyId, Long contactId) {
        Contact contact = contactRepository.findByIdAndCompanyId(contactId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", contactId));
        return toDto(contact);
    }

    @Transactional
    public ContactDto createContact(Long companyId, ContactCreateRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        String unsubscribeToken = UUID.randomUUID().toString().replace("-", "");

        Contact contact = Contact.builder()
                .company(company)
                .firstName(request.firstName().trim())
                .lastName(request.lastName() != null ? request.lastName().trim() : null)
                .email(request.email() != null ? request.email().trim().toLowerCase() : null)
                .phone(request.phone())
                .role(request.role())
                .isBilling(Boolean.TRUE.equals(request.isBilling()))
                .optedInGreetings(request.optedInGreetings() == null || request.optedInGreetings())
                .optedInPromos(request.optedInPromos() == null || request.optedInPromos())
                .unsubscribeToken(unsubscribeToken)
                .notes(request.notes())
                .build();

        Contact saved = contactRepository.save(contact);
        log.info("Created contact {} for company {}", saved.getId(), companyId);
        return toDto(saved);
    }

    @Transactional
    public ContactDto updateContact(Long companyId, Long contactId, ContactCreateRequest request) {
        Contact contact = contactRepository.findByIdAndCompanyId(contactId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", contactId));

        contact.setFirstName(request.firstName().trim());
        if (request.lastName() != null) {
            contact.setLastName(request.lastName().trim());
        }
        if (request.email() != null) {
            contact.setEmail(request.email().trim().toLowerCase());
        }
        if (request.phone() != null) {
            contact.setPhone(request.phone());
        }
        if (request.role() != null) {
            contact.setRole(request.role());
        }
        if (request.isBilling() != null) {
            contact.setIsBilling(request.isBilling());
        }
        if (request.optedInGreetings() != null) {
            contact.setOptedInGreetings(request.optedInGreetings());
        }
        if (request.optedInPromos() != null) {
            contact.setOptedInPromos(request.optedInPromos());
        }
        if (request.notes() != null) {
            contact.setNotes(request.notes());
        }

        Contact saved = contactRepository.save(contact);
        log.info("Updated contact {} for company {}", saved.getId(), companyId);
        return toDto(saved);
    }

    @Transactional
    public void deleteContact(Long companyId, Long contactId) {
        Contact contact = contactRepository.findByIdAndCompanyId(contactId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", contactId));
        contactRepository.delete(contact);
        log.info("Deleted contact {} from company {}", contactId, companyId);
    }

    public ContactDto toDto(Contact contact) {
        return new ContactDto(
                contact.getId(),
                contact.getCompany().getId(),
                contact.getFirstName(),
                contact.getLastName(),
                contact.getEmail(),
                contact.getPhone(),
                contact.getRole(),
                contact.getIsBilling(),
                contact.getOptedInGreetings(),
                contact.getOptedInPromos(),
                contact.getUnsubscribeToken(),
                contact.getNotes(),
                contact.getCreatedAt(),
                contact.getUpdatedAt()
        );
    }
}

