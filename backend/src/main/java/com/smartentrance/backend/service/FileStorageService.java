package com.smartentrance.backend.service;

import com.smartentrance.backend.config.FileStorageProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PreAuthorize("isAuthenticated()")
    public String storeFile(byte[] content, String fileName) {
        Path targetLocation = getSecurePath(fileName);

        try {
            Files.write(targetLocation, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    @PreAuthorize("isAuthenticated()")
    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        String fileExtension = "";
        int lastDotIndex = originalFileName.lastIndexOf(".");
        if (lastDotIndex > 0) {
            fileExtension = originalFileName.substring(lastDotIndex);
        }

        // 2. Валидация на разширението (whitelist)
        if (!fileExtension.matches("^[.a-zA-Z0-9]*$")) {
            throw new RuntimeException("Security Error: Invalid file extension.");
        }

        String newFileName = UUID.randomUUID() + fileExtension;

        Path targetLocation = getSecurePath(newFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + newFileName, ex);
        }
    }

    @PreAuthorize("@buildingSecurity.canAccessFile(#fileName, principal.user)")
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

        // Проверка за Path Traversal
        if (cleanFileName.contains("..")) {
            throw new RuntimeException("Filename contains invalid path sequence " + cleanFileName);
        }

        Path targetLocation = this.fileStorageLocation.resolve(cleanFileName).normalize().toAbsolutePath();
        Path storageRoot = this.fileStorageLocation.toAbsolutePath();

        if (!targetLocation.startsWith(storageRoot)) {
            throw new RuntimeException("Security Error: Cannot access file outside of the target directory.");
        }

        return targetLocation;
    }
}