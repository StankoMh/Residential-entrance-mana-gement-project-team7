package com.smartentrance.backend.dto.notice;

import com.smartentrance.backend.model.enums.DocumentType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record NoticeCreateRequest(
        @NotBlank(message = "Title is required")
        String title,

        String description,

        @NotBlank(message = "Place is required")
        String location,

        @NotNull(message = "Date and time is required")
        @FutureOrPresent(message = "Notice date and time must be in the present or future")
        Instant noticeDateTime,

        // Optional document metadata (file will be passed separately in controller)
        String documentTitle,
        String documentDescription,
        DocumentType documentType,
        Boolean documentVisibleToResidents
) {}