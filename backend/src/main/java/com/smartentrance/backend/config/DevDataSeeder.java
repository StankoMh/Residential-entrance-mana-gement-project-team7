package com.smartentrance.backend.config;

import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.UserRole;
import com.smartentrance.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@dev.com").isEmpty()) {

            User admin = new User();
            admin.setFullName("Dev Admin");
            admin.setEmail("admin@dev.com");
            admin.setHashedPassword(passwordEncoder.encode("password"));
            admin.setRole(UserRole.BUILDING_MANAGER);

            userRepository.save(admin);
            System.out.println("DEV ADMIN USER CREATED: admin@dev.com / password");
        }
    }
}