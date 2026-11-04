package com.aqs.crm.activity.service;

import com.aqs.crm.activity.dto.ActivityCreateRequest;
import com.aqs.crm.activity.dto.ActivityDto;
import com.aqs.crm.activity.entity.Activity;
import com.aqs.crm.activity.repository.ActivityRepository;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contact.repository.ContactRepository;
import com.aqs.crm.task.service.TaskService;
import com.aqs.crm.user.entity.User;
import com.aqs.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final CompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;

    @Transactional
    public ActivityDto logActivity(Long companyId, ActivityCreateRequest request, Long userId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        Contact contact = null;
        if (request.contactId() != null) {
            contact = contactRepository.findById(request.contactId())
                    .orElse(null);
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        Activity activity = Activity.builder()
                .company(company)
                .contact(contact)
                .user(user)
                .type(request.type())
                .subject(request.subject())
                .details(request.details())
                .outcome(request.outcome())
                .nextFollowUp(request.nextFollowUp())
                .build();

        Activity saved = activityRepository.save(activity);
        log.info("Logged activity '{}' ({}) for company '{}'", request.subject(), request.type(), company.getName());

        // If a next follow-up date is specified, automatically generate a follow-up task
        if (request.nextFollowUp() != null) {
            taskService.createTask(
                    companyId,
                    null,
                    "Follow-up: " + request.subject(),
                    "Scheduled follow-up from logged " + request.type() + ": " + (request.details() != null ? request.details() : ""),
                    request.nextFollowUp(),
                    "MEDIUM",
                    "ACTIVITY_FOLLOWUP",
                    userId
            );
        }

        return ActivityDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivitiesByCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }
        return activityRepository.findByCompanyIdWithDetails(companyId)
                .stream()
                .map(ActivityDto::fromEntity)
                .toList();
    }
}

