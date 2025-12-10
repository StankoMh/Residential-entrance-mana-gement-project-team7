package com.smartentrance.backend.service;

import com.smartentrance.backend.exception.ResourceConflictException;
import com.smartentrance.backend.exception.ResourceNotFoundException;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.UserRole;
import com.smartentrance.backend.repository.UserRepository;
import com.smartentrance.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.text.html.Option;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResourceConflictException(User.class, "email", user.getEmail());
        }

        user.setHashedPassword(passwordEncoder.encode(user.getPassword()));
        user.setPassword(null);

        if (user.getRole() == null) user.setRole(UserRole.RESIDENT);

        return userRepository.save(user);
    }

    @Cacheable(value = "users", key = "#email")
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#user.email")
    public User save(User user) {
        return userRepository.save(user);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No user logged in");
        }

        if (authentication.getPrincipal() instanceof UserPrincipal(User user)) {
            return user;
        }

        throw new IllegalStateException();
    }
}