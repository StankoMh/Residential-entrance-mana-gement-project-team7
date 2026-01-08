package com.smartentrance.backend.dto.unit;

import java.math.BigDecimal;

public record UnitResponse(
        Long id,
        Integer unitNumber,
        BigDecimal area,
        Integer residents,
        String accessCode,
        boolean isVerified,
        BigDecimal balance,
        boolean hasPendingPayments,
        BuildingInfo buildingInfo,
        OwnerInfo ownerInfo
) {
    public record BuildingInfo(Integer id, String name, String address) {}
    public record OwnerInfo (Long id, String firstName, String lastName, String email) {}
}