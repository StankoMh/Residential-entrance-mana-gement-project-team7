package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.unit.UnitResponse;
import com.smartentrance.backend.model.Unit;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class UnitMapper {

    public UnitResponse toManagementResponse(Unit unit, BigDecimal balance, boolean hasPendingPayments) {
        return new UnitResponse(
                unit.getId(),
                unit.getUnitNumber(),
                unit.getArea(),
                unit.getResidentsCount(),
                unit.getAccessCode(),
                unit.isVerified(),

                balance,
                hasPendingPayments,

                null,
                mapToOwnerInfo(unit)
        );
    }

    public UnitResponse toResidentResponse(Unit unit, BigDecimal balance, boolean hasPendingPayments) {
        return new UnitResponse(
                unit.getId(),
                unit.getUnitNumber(),
                unit.getArea(),
                unit.getResidentsCount(),
                null,
                unit.isVerified(),
                balance,
                hasPendingPayments,
                mapToBuildingInfo(unit),
                mapToOwnerInfo(unit)
        );
    }

    private UnitResponse.OwnerInfo mapToOwnerInfo(Unit unit) {
        if (unit.getResponsibleUser() == null) {
            return null;
        }
        return new UnitResponse.OwnerInfo(
                unit.getResponsibleUser().getId(),
                unit.getResponsibleUser().getFirstName(),
                unit.getResponsibleUser().getLastName(),
                unit.getResponsibleUser().getEmail()
        );
    }

    private UnitResponse.BuildingInfo mapToBuildingInfo(Unit unit) {
        if (unit.getBuilding() == null) return null;
        return new UnitResponse.BuildingInfo(
                unit.getBuilding().getId(),
                unit.getBuilding().getName(),
                unit.getBuilding().getAddress()
        );
    }
}