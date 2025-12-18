package com.smartentrance.backend.dto.notice;

import java.time.LocalDateTime;

public record NoticeResponse(
        Integer id,
        Integer createdByUserId,
        String title,
        String description,
        String location,
        LocalDateTime noticeDateTime
) {}