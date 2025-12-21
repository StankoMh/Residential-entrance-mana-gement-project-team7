package com.smartentrance.backend.dto.file;

public record FileUploadResponse(
        String fileName,
        String url,
        String type,
        long size
) {}