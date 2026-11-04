package com.aqs.crm.issue.service;

import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contact.repository.ContactRepository;
import com.aqs.crm.issue.dto.IssueCreateRequest;
import com.aqs.crm.issue.dto.IssueDto;
import com.aqs.crm.issue.dto.IssueUpdateRequest;
import com.aqs.crm.issue.entity.Issue;
import com.aqs.crm.issue.entity.IssueStatus;
import com.aqs.crm.issue.repository.IssueRepository;
import com.aqs.crm.user.entity.User;
import com.aqs.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final CompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional
    public IssueDto createIssue(Long companyId, IssueCreateRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        Contact contact = null;
        if (request.reportedByContactId() != null) {
            contact = contactRepository.findById(request.reportedByContactId()).orElse(null);
        }

        User assignedTo = null;
        if (request.assignedToUserId() != null) {
            assignedTo = userRepository.findById(request.assignedToUserId()).orElse(null);
        }

        Issue issue = Issue.builder()
                .company(company)
                .reportedByContact(contact)
                .assignedToUser(assignedTo)
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .status(IssueStatus.OPEN)
                .build();

        Issue saved = issueRepository.save(issue);
        log.info("Created support issue '{}' (Priority: {}) for company '{}'", request.title(), request.priority(), company.getName());
        return IssueDto.fromEntity(saved);
    }

    @Transactional
    public IssueDto updateIssue(Long issueId, IssueUpdateRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        if (request.title() != null && !request.title().isBlank()) {
            issue.setTitle(request.title());
        }
        if (request.description() != null && !request.description().isBlank()) {
            issue.setDescription(request.description());
        }
        if (request.priority() != null) {
            issue.setPriority(request.priority());
        }
        if (request.status() != null) {
            issue.setStatus(request.status());
            if (request.status() == IssueStatus.RESOLVED || request.status() == IssueStatus.CLOSED) {
                if (issue.getResolvedAt() == null) {
                    issue.setResolvedAt(Instant.now());
                }
            } else {
                issue.setResolvedAt(null);
            }
        }
        if (request.resolutionNotes() != null) {
            issue.setResolutionNotes(request.resolutionNotes());
        }
        if (request.assignedToUserId() != null) {
            User user = userRepository.findById(request.assignedToUserId()).orElse(null);
            issue.setAssignedToUser(user);
        }

        Issue saved = issueRepository.save(issue);
        log.info("Updated issue id={} (Status: {}, Priority: {})", issueId, issue.getStatus(), issue.getPriority());
        return IssueDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getIssuesByCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }
        return issueRepository.findByCompanyIdWithDetails(companyId)
                .stream()
                .map(IssueDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getAllIssues() {
        return issueRepository.findAllWithDetails()
                .stream()
                .map(IssueDto::fromEntity)
                .toList();
    }
}

