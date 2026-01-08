package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.building.BuildingResponse;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class BuildingMapper {
    public BuildingResponse toResponse(Building building) {
        return new BuildingResponse(
                building.getId(),
                building.getName(),
                building.getAddress(),
                building.getEntrance(),
                building.getUnits() != null ? building.getUnits().size() : 0,
                building.getIban(),
                mapToManagerInfo(building.getManager())
        );
    }

    public BuildingResponse toResponse(Building building, Integer totalUnits) {
        return new BuildingResponse(
                building.getId(),
                building.getName(),
                building.getAddress(),
                building.getEntrance(),
                totalUnits,
                building.getIban(),
                mapToManagerInfo(building.getManager())
        );
    }

    private BuildingResponse.ManagerInfo mapToManagerInfo(User manager) {
        if (manager == null) {
            return null;
        }
        return new BuildingResponse.ManagerInfo(
                manager.getId(),
                manager.getFirstName(),
                manager.getLastName(),
                manager.getEmail()
        );
    }
}