package com.aqs.crm.user.dto;

import com.aqs.crm.user.entity.Role;

import java.time.Instant;

public record UserDto(
        Long id,
        String username,
        String email,
        String fullName,
        Role role,
        Boolean isActive,
        Instant createdAt
) {
}

