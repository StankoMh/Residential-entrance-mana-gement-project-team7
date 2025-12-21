package com.smartentrance.backend.dto.document;

import com.smartentrance.backend.model.enums.DocumentType;
import java.time.Instant;

public record DocumentResponse(
        Long id,
        String title,
        String description,
        DocumentType type,
        String fileUrl,
        String uploaderName,
        boolean isVisible,
        Instant createdAt
) {}