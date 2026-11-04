package com.aqs.crm.timeline.service;

import com.aqs.crm.activity.repository.ActivityRepository;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.email.repository.EmailLogRepository;
import com.aqs.crm.issue.repository.IssueRepository;
import com.aqs.crm.pipeline.repository.StageHistoryRepository;
import com.aqs.crm.po.repository.PoDocumentRepository;
import com.aqs.crm.timeline.dto.TimelineEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class TimelineService {

    private final CompanyRepository companyRepository;
    private final ActivityRepository activityRepository;
    private final IssueRepository issueRepository;
    private final StageHistoryRepository stageHistoryRepository;
    private final PoDocumentRepository poDocumentRepository;
    private final EmailLogRepository emailLogRepository;

    @Transactional(readOnly = true)
    public List<TimelineEventDto> getCompanyTimeline(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }

        List<TimelineEventDto> events = new ArrayList<>();

        // 1. Activities (Calls, Emails, Meetings, Notes)
        try {
            activityRepository.findByCompanyIdWithDetails(companyId).forEach(act -> {
                String author = act.getUser() != null ? act.getUser().getFullName() :
                        (act.getContact() != null ? act.getContact().getFirstName() : "Team Member");
                Map<String, Object> meta = new HashMap<>();
                if (act.getOutcome() != null) meta.put("outcome", act.getOutcome());
                if (act.getNextFollowUp() != null) meta.put("nextFollowUp", act.getNextFollowUp().toString());

                events.add(new TimelineEventDto(
                        "act-" + act.getId(),
                        "ACTIVITY",
                        act.getSubject(),
                        act.getDetails(),
                        act.getType().name(),
                        act.getOutcome() != null ? act.getOutcome() : act.getType().name(),
                        author,
                        act.getCreatedAt(),
                        meta
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching activities for timeline: {}", e.getMessage());
        }

        // 2. Support Issues & Tickets
        try {
            issueRepository.findByCompanyIdWithDetails(companyId).forEach(issue -> {
                String author = issue.getReportedByContact() != null ?
                        issue.getReportedByContact().getFirstName() : "Support Desk";
                Map<String, Object> meta = new HashMap<>();
                meta.put("priority", issue.getPriority().name());
                meta.put("status", issue.getStatus().name());
                if (issue.getResolutionNotes() != null) meta.put("resolutionNotes", issue.getResolutionNotes());

                events.add(new TimelineEventDto(
                        "issue-" + issue.getId(),
                        "ISSUE",
                        "Support Ticket: " + issue.getTitle(),
                        issue.getDescription(),
                        issue.getPriority().name(),
                        issue.getStatus().name(),
                        author,
                        issue.getCreatedAt(),
                        meta
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching issues for timeline: {}", e.getMessage());
        }

        // 3. Stage Transitions
        try {
            stageHistoryRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).forEach(stage -> {
                String author = stage.getChangedBy() != null ? stage.getChangedBy().getFullName() : "System";
                String transition = (stage.getFromStage() != null ? stage.getFromStage().name() + " → " : "") + stage.getToStage().name();

                events.add(new TimelineEventDto(
                        "stage-" + stage.getId(),
                        "STAGE_CHANGE",
                        "Stage Changed: " + transition,
                        stage.getNotes() != null ? stage.getNotes() : "Account advanced to " + stage.getToStage().name(),
                        stage.getToStage().name(),
                        stage.getToStage().name(),
                        author,
                        stage.getCreatedAt(),
                        Map.of("toStage", stage.getToStage().name())
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching stage transitions for timeline: {}", e.getMessage());
        }

        // 4. PO Document Uploads
        try {
            poDocumentRepository.findByCompanyIdWithDetails(companyId).forEach(doc -> {
                String author = doc.getUploadedBy() != null ? doc.getUploadedBy().getFullName() : "Admin";
                String cycleNo = doc.getCycle() != null ? "Cycle #" + doc.getCycle().getCycleNo() : "Cycle Document";

                events.add(new TimelineEventDto(
                        "po-" + doc.getId(),
                        "PO_DOCUMENT",
                        "PO Document Uploaded: " + doc.getFileName(),
                        "Stored in MinIO S3 (" + (doc.getFileSize() / 1024) + " KB) - SHA-256 Verified",
                        doc.getContentType(),
                        cycleNo,
                        author,
                        doc.getCreatedAt(),
                        Map.of("fileHash", doc.getFileHash() != null ? doc.getFileHash() : "")
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching PO documents for timeline: {}", e.getMessage());
        }

        // 5. Transactional & Reminder Emails
        try {
            emailLogRepository.findByCompanyIdOrderBySentAtDesc(companyId).forEach(eml -> {
                String to = eml.getToEmail() != null ? eml.getToEmail() : "Client Contact";
                String status = eml.getStatus() != null ? eml.getStatus() : "SENT";
                events.add(new TimelineEventDto(
                        "email-" + eml.getId(),
                        "EMAIL",
                        "Email Sent: " + eml.getSubject(),
                        "Delivered to " + to,
                        eml.getCategory() != null ? eml.getCategory().name() : "TRANSACTIONAL",
                        status,
                        "AQS Email Engine",
                        eml.getSentAt(),
                        Map.of("status", status)
                ));
            });
        } catch (Exception e) {
            log.warn("Error fetching emails for timeline: {}", e.getMessage());
        }

        // Sort chronological descending (latest first)
        events.sort(Comparator.comparing(TimelineEventDto::timestamp, Comparator.nullsLast(Comparator.reverseOrder())));
        return events;
    }
}
