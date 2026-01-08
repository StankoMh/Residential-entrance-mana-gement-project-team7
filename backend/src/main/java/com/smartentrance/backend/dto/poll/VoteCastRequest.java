package com.smartentrance.backend.dto.poll;

import jakarta.validation.constraints.NotNull;

public record VoteCastRequest(
        @NotNull(message = "You must select an option to vote")
        Integer optionId,
        @NotNull(message = "You must specify the unit which is voting.")
        Long unitId
) {}