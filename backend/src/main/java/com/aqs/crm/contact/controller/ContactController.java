package com.aqs.crm.contact.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.contact.dto.ContactCreateRequest;
import com.aqs.crm.contact.dto.ContactDto;
import com.aqs.crm.contact.service.ContactService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/contacts")
@Tag(name = "Contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactDto>>> getContactsByCompany(@PathVariable Long companyId) {
        List<ContactDto> contacts = contactService.getContactsByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.ok(contacts));
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<ApiResponse<ContactDto>> getContact(
            @PathVariable Long companyId,
            @PathVariable Long contactId) {
        ContactDto contact = contactService.getContact(companyId, contactId);
        return ResponseEntity.ok(ApiResponse.ok(contact));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactDto>> createContact(
            @PathVariable Long companyId,
            @Valid @RequestBody ContactCreateRequest request) {
        ContactDto contact = contactService.createContact(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Contact created successfully", contact));
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<ApiResponse<ContactDto>> updateContact(
            @PathVariable Long companyId,
            @PathVariable Long contactId,
            @Valid @RequestBody ContactCreateRequest request) {
        ContactDto contact = contactService.updateContact(companyId, contactId, request);
        return ResponseEntity.ok(ApiResponse.ok("Contact updated successfully", contact));
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(
            @PathVariable Long companyId,
            @PathVariable Long contactId) {
        contactService.deleteContact(companyId, contactId);
        return ResponseEntity.ok(ApiResponse.ok("Contact deleted successfully", null));
    }
}

