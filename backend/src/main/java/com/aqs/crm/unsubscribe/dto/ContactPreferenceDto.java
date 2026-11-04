package com.aqs.crm.unsubscribe.dto;

import com.aqs.crm.contact.entity.Contact;

public record ContactPreferenceDto(
        String token,
        String contactName,
        String companyName,
        String email,
        boolean optedInGreetings,
        boolean optedInPromos
) {
    public static ContactPreferenceDto fromEntity(Contact c) {
        String fullName = (c.getFirstName() + " " + (c.getLastName() != null ? c.getLastName() : "")).trim();
        return new ContactPreferenceDto(
                c.getUnsubscribeToken(),
                fullName,
                c.getCompany() != null ? c.getCompany().getName() : "Valued Partner",
                c.getEmail(),
                Boolean.TRUE.equals(c.getOptedInGreetings()),
                Boolean.TRUE.equals(c.getOptedInPromos())
        );
    }
}

