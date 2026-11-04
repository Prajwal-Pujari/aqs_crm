package com.aqs.crm.company.service;

import com.aqs.crm.common.dto.PagedResponse;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.dto.CompanyCreateRequest;
import com.aqs.crm.company.dto.CompanyDto;
import com.aqs.crm.company.dto.CompanyUpdateRequest;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.entity.PipelineStage;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public PagedResponse<CompanyDto> getAllCompanies(String search, PipelineStage stage, Pageable pageable) {
        Page<Company> page;

        if (search != null && !search.isBlank() && stage != null) {
            page = companyRepository.findByNameContainingIgnoreCaseAndPipelineStage(search.trim(), stage, pageable);
        } else if (search != null && !search.isBlank()) {
            page = companyRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else if (stage != null) {
            page = companyRepository.findByPipelineStage(stage, pageable);
        } else {
            page = companyRepository.findAll(pageable);
        }

        var dtos = page.getContent().stream().map(this::toDto).toList();
        return PagedResponse.of(page, dtos);
    }

    @Transactional(readOnly = true)
    public CompanyDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return toDto(company);
    }

    @Transactional
    public CompanyDto createCompany(CompanyCreateRequest request, Long userId) {
        log.info("Creating company '{}' by user {}", request.name(), userId);

        Company company = Company.builder()
                .name(request.name())
                .industry(request.industry())
                .website(request.website())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .phone(request.phone())
                .notes(request.notes())
                .servicesProvided(request.servicesProvided())
                .pipelineStage(request.pipelineStage())
                .build();

        User createdByUser = new User();
        createdByUser.setId(userId);
        company.setCreatedBy(createdByUser);

        if (request.assignedTo() != null) {
            User assignedToUser = new User();
            assignedToUser.setId(request.assignedTo());
            company.setAssignedTo(assignedToUser);
        }

        Company saved = companyRepository.save(company);
        log.info("Company '{}' created with id {}", saved.getName(), saved.getId());
        return toDto(saved);
    }

    @Transactional
    public CompanyDto updateCompany(Long id, CompanyUpdateRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        if (request.name() != null) {
            company.setName(request.name());
        }
        if (request.industry() != null) {
            company.setIndustry(request.industry());
        }
        if (request.website() != null) {
            company.setWebsite(request.website());
        }
        if (request.address() != null) {
            company.setAddress(request.address());
        }
        if (request.city() != null) {
            company.setCity(request.city());
        }
        if (request.state() != null) {
            company.setState(request.state());
        }
        if (request.country() != null) {
            company.setCountry(request.country());
        }
        if (request.phone() != null) {
            company.setPhone(request.phone());
        }
        if (request.notes() != null) {
            company.setNotes(request.notes());
        }
        if (request.servicesProvided() != null) {
            company.setServicesProvided(request.servicesProvided());
        }
        if (request.pipelineStage() != null) {
            company.setPipelineStage(request.pipelineStage());
        }
        if (request.assignedTo() != null) {
            User assignedToUser = new User();
            assignedToUser.setId(request.assignedTo());
            company.setAssignedTo(assignedToUser);
        }

        Company saved = companyRepository.save(company);
        log.info("Company '{}' (id={}) updated", saved.getName(), saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        companyRepository.delete(company);
        log.info("Company id={} deleted", id);
    }

    private CompanyDto toDto(Company entity) {
        return new CompanyDto(
                entity.getId(),
                entity.getName(),
                entity.getIndustry(),
                entity.getWebsite(),
                entity.getAddress(),
                entity.getCity(),
                entity.getState(),
                entity.getCountry(),
                entity.getPhone(),
                entity.getNotes(),
                entity.getPipelineStage() != null ? entity.getPipelineStage().name() : null,
                entity.getServicesProvided(),
                entity.getAssignedTo() != null ? entity.getAssignedTo().getId() : null,
                entity.getAssignedTo() != null ? entity.getAssignedTo().getFullName() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
