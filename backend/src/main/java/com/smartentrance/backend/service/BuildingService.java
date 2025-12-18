package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.building.BuildingResponse;
import com.smartentrance.backend.dto.building.CreateBuildingRequest;
import com.smartentrance.backend.mapper.BuildingMapper;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.repository.BuildingRepository;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final BuildingMapper buildingMapper;
    private final UnitService unitService;
    private final UserService userService;

    @Transactional
    public BuildingResponse createBuildingWithSkeleton(CreateBuildingRequest request, User manager) {

        if (buildingRepository.existsByGooglePlaceIdAndEntrance(request.googlePlaceId(), request.entrance().toUpperCase())) {
            throw new EntityExistsException("This building entrance is already registered.");
        }

        User managerProxy = userService.getUserReference(manager.getId());

        Building building = Building.builder()
                .name(request.name())
                .address(request.address())
                .googlePlaceId(request.googlePlaceId())
                .entrance(request.entrance().toUpperCase())
                .totalUnits(request.totalUnits())
                .manager(managerProxy)
                .build();

        building = buildingRepository.save(building);

        List<Unit> skeletonUnits = new ArrayList<>();
        for (int i = 1; i <= request.totalUnits(); i++) {
            skeletonUnits.add(Unit.builder()
                    .building(building)
                    .unitNumber(i)
                    .accessCode(unitService.generateUniqueAccessCode())
                    .residents(0)
                    .area(BigDecimal.ZERO)
                    .build());
        }

        unitService.saveAll(skeletonUnits);

        return buildingMapper.toResponse(building, manager, request.totalUnits());
    }

    public List<Building> findAllByManagerId(Integer managerId) {
        return buildingRepository.findAllByManagerId(managerId);
    }

    public Optional<Building> findById(Integer buildingId) {
        return buildingRepository.findById(buildingId);
    }

    public Building getBuildingReference(Integer buildingId) {
        return buildingRepository.getReferenceById(buildingId);
    }
}