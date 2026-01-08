package com.smartentrance.backend.dto.poll;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public record PollCreateRequest(
        @NotBlank(message = "Title is required")
        String title,

        String description,

        @NotNull(message = "Start date is required")
        Instant startAt,

        @NotNull(message = "End date is required")
        @Future(message = "End date must be in the future")
        Instant endAt,

        @NotNull(message = "Options are required")
        @Size(min = 2, message = "At least two options are required")
        List<String> options
) {}