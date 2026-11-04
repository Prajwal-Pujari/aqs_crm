package com.aqs.crm.unsubscribe.dto;

public record UnsubscribeUpdateRequest(
        Boolean optedInGreetings,
        Boolean optedInPromos
) {
}

