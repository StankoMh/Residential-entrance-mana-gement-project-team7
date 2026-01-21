package com.smartentrance.backend.dto.notice;

import com.smartentrance.backend.model.enums.DocumentType;

import java.time.Instant;

public record NoticeResponse(
        Integer id,
        Long createdByUserId,
        String title,
        String description,
        String location,
        Instant noticeDateTime,
        DocumentInfo document
) {
    public record DocumentInfo(
            Long id,
            String title,
            String fileUrl,
            DocumentType type
    ) {}
}