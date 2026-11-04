package com.aqs.crm.auth.dto;

import com.aqs.crm.user.dto.UserDto;

public record LoginResponse(
        String token,
        String tokenType,
        UserDto user
) {
    public static LoginResponse of(String token, UserDto user) {
        return new LoginResponse(token, "Bearer", user);
    }
}

