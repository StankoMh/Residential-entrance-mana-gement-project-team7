package com.smartentrance.backend.dto.building;

public record BuildingResponse(
        Integer id,
        String name,
        String address,
        String entrance,
        Integer totalUnits,
        String iban,
        ManagerInfo managerInfo
) {
    public record ManagerInfo(
            Integer id,
            String firstName,
            String lastName,
            String email
    ) {}
}