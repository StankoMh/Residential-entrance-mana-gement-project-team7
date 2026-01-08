package com.smartentrance.backend.scheduler;

import com.smartentrance.backend.config.FileStorageProperties;
import com.smartentrance.backend.repository.BuildingExpenseRepository;
import com.smartentrance.backend.repository.DocumentRepository;
import com.smartentrance.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class FileCleanupService {

    private final FileStorageProperties fileStorageProperties;
    private final TransactionRepository transactionRepository;
    private final BuildingExpenseRepository expenseRepository;
    private final DocumentRepository documentRepository;

    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupOrphanedFiles() {
        System.out.println("Starting orphan file cleanup...");

        Path uploadDir = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();

        try (Stream<Path> files = Files.list(uploadDir)) {
            files.forEach(this::checkAndDeleteFile);
        } catch (IOException e) {
            System.err.println("Error reading upload directory: " + e.getMessage());
        }
    }

    private void checkAndDeleteFile(Path filePath) {
        try {
            BasicFileAttributes attrs = Files.readAttributes(filePath, BasicFileAttributes.class);
            Instant fileTime = attrs.creationTime().toInstant();

            if (fileTime.isAfter(Instant.now().minus(24, ChronoUnit.HOURS))) {
                return;
            }

            String fileName = filePath.getFileName().toString();

            boolean isUsed = isFileUsedInDatabase(fileName);

            if (!isUsed) {
                Files.delete(filePath);
                System.out.println("Deleted orphaned file: " + fileName);
            }

        } catch (Exception e) {
            System.err.println("Failed to process file: " + filePath);
        }
    }

    private boolean isFileUsedInDatabase(String fileName) {

        if (transactionRepository.findByProofUrl(fileName).isPresent()) return true;

        if (expenseRepository.existsByDocumentUrl(fileName)) return true;

        if (documentRepository.findByFileUrl(fileName).isPresent()) return true;

        return false;
    }
}