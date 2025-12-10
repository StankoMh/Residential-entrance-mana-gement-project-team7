package com.smartentrance.backend.controller;

import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.UserRole;
import com.smartentrance.backend.security.JwtService;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
@Profile("dev")
@RequiredArgsConstructor
public class DevController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping("/login-admin")
    public ResponseEntity<String> loginAsAdmin() {
        String adminEmail = "admin@dev.com";

        User admin = userService.findByEmail(adminEmail)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(adminEmail);
                    newUser.setFullName("Dev Admin");
                    newUser.setPassword("123");
                    newUser.setRole(UserRole.BUILDING_MANAGER);
                    return userService.createUser(newUser);
                });

        String token = jwtService.generateToken(
                new UserPrincipal(admin),
                1000L * 60 * 60 * 24 * 7
        );

        ResponseCookie cookie = jwtService.generateCookie(token);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("You are now logged in as ADMIN!");
    }
}