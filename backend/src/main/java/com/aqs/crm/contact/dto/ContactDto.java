package com.aqs.crm.contact.dto;

import java.time.Instant;

public record ContactDto(
        Long id,
        Long companyId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String role,
        Boolean isBilling,
        Boolean optedInGreetings,
        Boolean optedInPromos,
        String unsubscribeToken,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}

