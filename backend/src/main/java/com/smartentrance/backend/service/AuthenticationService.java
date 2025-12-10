package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.LoginRequest;
import com.smartentrance.backend.dto.LoginResponse;
import com.smartentrance.backend.dto.RegisterUserRequest;
import com.smartentrance.backend.dto.UserResponse;
import com.smartentrance.backend.mapper.UserMapper;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.security.JwtService;
import com.smartentrance.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserService userService;
    private final JwtService jwtService; // Използваме новия сървиз
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;

    public LoginResponse register(RegisterUserRequest request) {
        User userDraft = userMapper.toEntity(request);
        User savedUser = userService.createUser(userDraft);

        String token = jwtService.generateToken(new UserPrincipal(savedUser));

        return new LoginResponse(token, userMapper.toResponse(savedUser));
    }

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        User user = userPrincipal.getUser();

        String token = jwtService.generateToken(userPrincipal);

        return new LoginResponse(token, userMapper.toResponse(user));
    }

    public UserResponse getCurrentUser() {
        User currentUser = userService.getCurrentUser();
        return userMapper.toResponse(currentUser);
    }
}