package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.auth.LoginRequest;
import com.smartentrance.backend.dto.auth.LoginResponse;
import com.smartentrance.backend.dto.user.UserRegisterRequest;
import com.smartentrance.backend.dto.user.UserResponse;
import com.smartentrance.backend.security.JwtService;
import com.smartentrance.backend.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authService;
    private final JwtService jwtService;

    @Operation(summary = "Register User", description = "Creates a new user account with email and password and logs them in")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        LoginResponse loginResponse = authService.register(request);

        ResponseCookie cookie = jwtService.generateCookie(loginResponse.getToken(), request.isRememberMe());

        return ResponseEntity.created(URI.create("/api/auth/me"))
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse.getUser());
    }

    @Operation(summary = "Login", description = "Authenticates a user and sets a secure HttpOnly session cookie.")
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = authService.login(request);

        ResponseCookie cookie = jwtService.generateCookie(loginResponse.getToken(), request.isRememberMe());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse.getUser());
    }

    @Operation(summary = "Logout", description = "Clears the auth cookies.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtService.getCleanCookie().toString())
                .build();
    }

    @Operation(summary = "Get Current User", description = "Returns the profile details of the currently logged-in user.")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.getAuthenticatedUser());
    }
}