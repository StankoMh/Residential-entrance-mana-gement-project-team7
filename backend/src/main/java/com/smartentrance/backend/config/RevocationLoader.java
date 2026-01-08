package com.smartentrance.backend.config;

import com.smartentrance.backend.model.RevocationEntry;
import com.smartentrance.backend.repository.RevocationRepository;
import com.smartentrance.backend.security.TokenRevocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RevocationLoader implements CommandLineRunner {

    private final RevocationRepository revocationRepository;
    private final TokenRevocationService revocationService;

    @Value("${application.security.jwt.remember-me.expiration}")
    private Long rememberMeExpiration;

    @Override
    public void run(String... args) {
        long threshold = System.currentTimeMillis() - rememberMeExpiration;
        revocationRepository.deleteOlderThan(threshold);

        List<RevocationEntry> entries = revocationRepository.findAll();

        if (!entries.isEmpty()) {
            Map<Long, Long> loadedData = new HashMap<>();

            for (RevocationEntry entry : entries) {
                loadedData.put(entry.getUserId(), entry.getRevokedAt());
            }

            revocationService.loadRevocations(loadedData);

            System.out.println("✅ Security blacklist loaded");
        }
    }
}