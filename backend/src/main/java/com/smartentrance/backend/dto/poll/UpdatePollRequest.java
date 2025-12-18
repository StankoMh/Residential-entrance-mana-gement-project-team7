package com.smartentrance.backend.dto.poll;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record UpdatePollRequest(

        String title,

        String description,

        @FutureOrPresent(message = "Start time should be in the present or future")
        Instant startAt,

        @Future(message = "End time should be in the future")
        Instant endAt
) {}