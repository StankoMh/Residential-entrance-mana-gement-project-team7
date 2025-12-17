package com.smartentrance.backend.dto.dashboard;

public record ResidentUnit(
        Integer unitId,
        Integer unitNumber,
        String buildingName,
        String buildingAddress
) {}