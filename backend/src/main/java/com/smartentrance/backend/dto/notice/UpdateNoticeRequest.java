package com.smartentrance.backend.dto.notice;

import jakarta.validation.constraints.FutureOrPresent;
import java.time.Instant;

public record UpdateNoticeRequest(
        String title,

        String description,

        String location,

        @FutureOrPresent(message = "The notice date and time must be in the future or present")
        Instant noticeDateTime
) {}