package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.auth.LoginRequest;
import com.smartentrance.backend.dto.auth.LoginResponse;
import com.smartentrance.backend.dto.user.UserRegisterRequest;
import com.smartentrance.backend.dto.user.UserResponse;
import com.smartentrance.backend.mapper.UserMapper;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.security.JwtService;
import com.smartentrance.backend.security.UserPrincipal;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public LoginResponse register(UserRegisterRequest request) {
        User user = userMapper.toEntity(request);

        user.setHashedPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userService.saveUser(user);

        String token = jwtService.generateToken(new UserPrincipal(savedUser), request.isRememberMe());

        return new LoginResponse(token, userMapper.toResponse(savedUser));
    }

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        if (auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
            String token = jwtService.generateToken(userPrincipal, request.isRememberMe());

            return new LoginResponse(token, userMapper.toResponse(userPrincipal.user()));
        } else {
            throw new IllegalStateException("Unexpected principal type");
        }
    }

    public UserResponse getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadCredentialsException("Invalid session or token");
        }

        try {
            Long userId = principal.user().getId();
            User user = userService.getUserById(userId);
            return userMapper.toResponse(user);
        } catch (EntityNotFoundException e) {
            throw new BadCredentialsException("User session invalid");
        }
    }
}