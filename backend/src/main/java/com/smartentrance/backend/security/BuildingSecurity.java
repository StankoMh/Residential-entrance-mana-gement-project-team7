package com.smartentrance.backend.security;

import com.smartentrance.backend.repository.BuildingRepository;
import com.smartentrance.backend.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component("buildingSecurity")
@RequiredArgsConstructor
public class BuildingSecurity {

    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;

    public boolean hasAccess(Integer buildingId, Integer userId) {
        return buildingRepository.existsByIdAndManagerId(buildingId, userId)
                || unitRepository.existsByBuildingIdAndResponsibleUserId(buildingId, userId);
    }


    public boolean isManager(Integer buildingId, Integer userId) {
        return buildingRepository.existsByIdAndManagerId(buildingId, userId);
    }
}