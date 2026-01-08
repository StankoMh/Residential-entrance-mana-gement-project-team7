    package com.smartentrance.backend.dto.notice;

    import java.time.Instant;

    public record NoticeResponse(
            Integer id,
            Long createdByUserId,
            String title,
            String description,
            String location,
            Instant noticeDateTime
    ) {}