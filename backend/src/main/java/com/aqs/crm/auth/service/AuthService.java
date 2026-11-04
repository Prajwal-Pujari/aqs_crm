package com.aqs.crm.auth.service;

import com.aqs.crm.auth.dto.ChangePasswordRequest;
import com.aqs.crm.auth.dto.LoginRequest;
import com.aqs.crm.auth.dto.LoginResponse;
import com.aqs.crm.common.exception.BadRequestException;
import com.aqs.crm.security.JwtTokenProvider;
import com.aqs.crm.security.UserPrincipal;
import com.aqs.crm.user.dto.UserDto;
import com.aqs.crm.user.entity.User;
import com.aqs.crm.user.repository.UserRepository;
import com.aqs.crm.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        log.info("Attempting login for username: {}", request.username());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String jwt = tokenProvider.generateToken(userPrincipal);
        User user = userService.getUserById(userPrincipal.getId());
        UserDto userDto = userService.toDto(user);

        log.info("User {} logged in successfully", userPrincipal.getUsername());
        return LoginResponse.of(jwt, userDto);
    }

    public LoginResponse refreshToken(Long userId) {
        User user = userService.getUserById(userId);
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String jwt = tokenProvider.generateToken(userPrincipal);
        return LoginResponse.of(jwt, userService.toDto(user));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userService.getUserById(userId);

        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user id {}", userId);
    }
}

