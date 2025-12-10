package com.smartentrance.backend.config;

import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.UserRole;
import com.smartentrance.backend.repository.UserRepository;
import com.smartentrance.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (Objects.requireNonNull(userService.findByEmail("admin@dev.com")).isEmpty()) {

            User admin = new User();
            admin.setFullName("Dev Admin");
            admin.setEmail("admin@dev.com");
            admin.setHashedPassword(passwordEncoder.encode("password"));
            admin.setRole(UserRole.BUILDING_MANAGER);

            userService.save(admin);
            System.out.println("DEV ADMIN USER CREATED: admin@dev.com / password");
        }
    }
}