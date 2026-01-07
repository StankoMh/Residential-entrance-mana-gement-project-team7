package com.smartentrance.backend.service;

import com.smartentrance.backend.config.FileStorageProperties;
import com.smartentrance.backend.model.User;
import org.apache.tika.Tika;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final Tika tika = new Tika();

    private final Map<Long, Instant> uploadRateLimit = new ConcurrentHashMap<>();

    private static final int UPLOAD_COOLDOWN_SECONDS = 10;

    private static final long MIN_FREE_SPACE_BYTES = 500 * 1024 * 1024;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf", "image/jpeg", "image/png", "image/jpg"
    );

    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory.", ex);
        }
    }

    @PreAuthorize("isAuthenticated()")
    public String storeFile(byte[] content, String fileName) {
        if (!fileName.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("System Error: Internal file generation must be PDF.");
        }
        Path targetLocation = getSecurePath(fileName);
        try {
            Files.write(targetLocation, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    @PreAuthorize("isAuthenticated()")
    public String storeFile(MultipartFile file, User user) {
        Instant lastUpload = uploadRateLimit.get(user.getId());
        if (lastUpload != null && lastUpload.plusSeconds(UPLOAD_COOLDOWN_SECONDS).isAfter(Instant.now())) {
            throw new RuntimeException("Rate Limit Exceeded: Please wait " + UPLOAD_COOLDOWN_SECONDS + " seconds between uploads.");
        }
        uploadRateLimit.put(user.getId(), Instant.now());

        try {
            long freeSpace = Files.getFileStore(this.fileStorageLocation).getUsableSpace();
            if (freeSpace < MIN_FREE_SPACE_BYTES) {
                throw new RuntimeException("Server Error: Not enough disk space. Please contact support.");
            }
        } catch (IOException e) {
            System.err.println("Could not check disk space: " + e.getMessage());
        }

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (file.isEmpty()) throw new RuntimeException("Empty file.");

        try {
            String detectedType = tika.detect(file.getInputStream());
            if (!ALLOWED_MIME_TYPES.contains(detectedType)) {
                throw new RuntimeException("Security Error: Invalid file type: " + detectedType);
            }

            String fileExtension = "";
            int lastDotIndex = originalFileName.lastIndexOf(".");
            if (lastDotIndex > 0) fileExtension = originalFileName.substring(lastDotIndex);

            String newFileName = UUID.randomUUID() + fileExtension;
            Path targetLocation = getSecurePath(newFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return newFileName;

        } catch (IOException ex) {
            throw new RuntimeException("Upload failed.", ex);
        }
    }

    @PreAuthorize("isAuthenticated()")
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = getSecurePath(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) return resource;
            else throw new RuntimeException("File not found " + fileName);
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    private Path getSecurePath(String fileName) {
        String cleanFileName = StringUtils.cleanPath(fileName);
        if (cleanFileName.contains("..")) {
            throw new RuntimeException("Filename contains invalid path sequence");
        }
        Path targetLocation = this.fileStorageLocation.resolve(cleanFileName).normalize().toAbsolutePath();
        if (!targetLocation.startsWith(this.fileStorageLocation.toAbsolutePath())) {
            throw new RuntimeException("Security Error: Path traversal attempt.");
        }
        return targetLocation;
    }
    @Scheduled(fixedRate = 600000)
    public void cleanUpRateLimitCache() {
        Instant now = Instant.now();
        uploadRateLimit.entrySet().removeIf(entry ->
                entry.getValue().plusSeconds(60).isBefore(now)
        );
    }

}