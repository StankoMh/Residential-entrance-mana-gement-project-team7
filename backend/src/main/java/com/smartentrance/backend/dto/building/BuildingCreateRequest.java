package com.smartentrance.backend.dto.building;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record BuildingCreateRequest(
        @NotBlank(message = "Address from Google is required")
        String address,

        @NotBlank(message = "Google Place ID is required")
        String googlePlaceId,

        @NotBlank(message = "Entrance is required")
        String entrance,

        @NotBlank(message = "Building name is required")
        String name,

        @Min(value = 1, message = "The building must have at least one unit")
        @Max(value = 100, message = "The building cannot have more than 100 units")
        Integer totalUnits,

        String iban
) {}