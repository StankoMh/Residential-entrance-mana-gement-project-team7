package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.LoginRequest;
import com.smartentrance.backend.dto.LoginResponse;
import com.smartentrance.backend.dto.RegisterUserRequest;
import com.smartentrance.backend.dto.UserResponse;
import com.smartentrance.backend.security.JwtService;
import com.smartentrance.backend.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        LoginResponse loginResponse = authService.register(request);

        ResponseCookie cookie = jwtService.generateCookie(loginResponse.getToken());

        return ResponseEntity.created(null)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse.getUser());
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = authService.login(request);

        ResponseCookie cookie = jwtService.generateCookie(loginResponse.getToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse.getUser());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtService.getCleanCookie().toString())
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}