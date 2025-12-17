package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.building.BuildingResponse;
import com.smartentrance.backend.dto.dashboard.ManagedBuilding;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class BuildingMapper {
    public BuildingResponse toResponse(Building building) {
        User manager = building.getManager();

        return new BuildingResponse(
                building.getId(),
                building.getName(),
                building.getAddress(),
                building.getGooglePlaceId(),
                building.getEntrance(),
                manager != null ? manager.getId() : null,
                manager != null ? manager.getEmail() : null,
                building.getUnits() != null ? building.getUnits().size() : 0,
                building.getCreatedAt()
        );
    }

    public BuildingResponse toResponse(Building building, User managerFromToken, Integer totalUnits) {
        return new BuildingResponse(
                building.getId(),
                building.getName(),
                building.getAddress(),
                building.getGooglePlaceId(),
                building.getEntrance(),
                managerFromToken.getId(),
                managerFromToken.getEmail(),
                totalUnits,
                building.getCreatedAt()
        );
    }

    public ManagedBuilding toManagedBuilding(Building building) {
        return new ManagedBuilding(
                building.getId(),
                building.getName(),
                building.getAddress(),
                building.getTotalUnits()
        );
    }
}