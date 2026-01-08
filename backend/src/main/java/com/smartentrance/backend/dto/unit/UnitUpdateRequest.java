package com.smartentrance.backend.dto.unit;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public record UnitUpdateRequest(
        @DecimalMin(value = "0.0", message = "Area must be positive")
        BigDecimal area,

        @Min(value = 0, message = "Residents count cannot be negative")
        Integer residentsCount
) {}