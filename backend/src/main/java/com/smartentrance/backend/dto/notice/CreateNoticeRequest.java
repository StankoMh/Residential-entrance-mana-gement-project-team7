package com.smartentrance.backend.dto.notice;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreateNoticeRequest(
        @NotBlank(message = "Title is required")
        String title,

        String description,

        @NotBlank(message = "Place is required")
        String location,

        @NotNull(message = "Date and time is required")
        @FutureOrPresent(message = "Notice date and time must be in the present or future")
        LocalDateTime noticeDateTime
) {}