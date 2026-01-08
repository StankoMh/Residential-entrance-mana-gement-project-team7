package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.building.BuildingCreateRequest;
import com.smartentrance.backend.dto.building.BuildingResponse;
import com.smartentrance.backend.dto.building.UpdateBudgetRequest;
import com.smartentrance.backend.mapper.BuildingMapper;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.BuildingDocument;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.DocumentType;
import com.smartentrance.backend.repository.BuildingRepository;
import com.smartentrance.backend.repository.DocumentRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final DocumentRepository documentRepository;

    @Transactional
    @PreAuthorize("isAuthenticated()")
    public BuildingResponse createBuildingWithSkeleton(BuildingCreateRequest request, User manager) {
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
                .iban(request.iban())
                .build();

        building = buildingRepository.save(building);

        List<Unit> skeletonUnits = new ArrayList<>();
        for (int i = 1; i <= request.totalUnits(); i++) {
            skeletonUnits.add(Unit.builder()
                    .building(building)
                    .unitNumber(i)
                    .accessCode(unitService.generateUniqueAccessCode())
                    .residentsCount(0)
                    .area(BigDecimal.ZERO)
                    .build());
        }
        unitService.saveAll(skeletonUnits);

        return buildingMapper.toResponse(building, request.totalUnits());
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public void updateBuildingBudgets(Integer buildingId, UpdateBudgetRequest req, User manager) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new EntityNotFoundException("Building not found"));

        if (req.repairBudget() != null) building.setRepairBudget(req.repairBudget());
        if (req.maintenanceBudget() != null) building.setMaintenanceBudget(req.maintenanceBudget());

        if (req.protocolFileUrl() != null && !req.protocolFileUrl().isBlank()) {
            BuildingDocument doc = new BuildingDocument();
            doc.setBuilding(building);
            doc.setUploadedBy(manager);
            doc.setTitle("Budget Protocol");
            doc.setDescription("Monthly budget protocol document.");
            doc.setType(DocumentType.PROTOCOL);
            doc.setFileUrl(req.protocolFileUrl());
            doc.setVisibleToResidents(true);

            documentRepository.save(doc);
            building.setBudgetProtocol(doc);
        }
        buildingRepository.save(building);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public void transferManagerRole(Integer buildingId, Long newManagerId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new EntityNotFoundException("Building not found"));

        User newManager = userService.getUserReference(newManagerId);
        if (newManager == null) throw new EntityNotFoundException("New manager user not found");

        building.setManager(newManager);
        buildingRepository.save(building);
    }

    public UpdateBudgetRequest getCurrentBudgets(Integer buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new EntityNotFoundException("Building not found"));

        String protocolUrl = (building.getBudgetProtocol() != null)
                ? building.getBudgetProtocol().getFileUrl()
                : null;

        return new UpdateBudgetRequest(
                building.getRepairBudget(),
                building.getMaintenanceBudget(),
                protocolUrl
        );
    }

    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public List<BuildingResponse> getManagedBuildings(User user) {
        return buildingRepository.findAllByManagerId(user.getId())
                .stream().map(buildingMapper::toResponse).toList();
    }

    public Optional<Building> findById(Integer buildingId) {
        return buildingRepository.findById(buildingId);
    }

    public Building getBuildingReference(Integer buildingId) {
        return buildingRepository.getReferenceById(buildingId);
    }
}