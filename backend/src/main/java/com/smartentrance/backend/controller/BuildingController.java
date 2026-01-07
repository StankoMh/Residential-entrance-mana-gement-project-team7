package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.building.*;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.BuildingService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @Operation(summary = "Create Building", description = "Registers a new condominium in the system. The creator automatically becomes the Manager.")
    @PostMapping
    public ResponseEntity<BuildingResponse> createBuilding(
            @Valid @RequestBody BuildingCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(buildingService.createBuildingWithSkeleton(request, principal.user()));
    }

    @Operation(summary = "Get Managed Buildings", description = "Returns a list of buildings where the current user is the manager.")
    @GetMapping("/managed")
    public ResponseEntity<List<BuildingResponse>> getMyManagedBuildings(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(buildingService.getManagedBuildings(principal.user()));
    }

    @Operation(summary = "Get Budget Config", description = "Retrieves the current repair and maintenance fund targets.")
    @GetMapping("/{buildingId}/budget")
    public ResponseEntity<UpdateBudgetRequest> getBudgets(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(buildingService.getCurrentBudgets(buildingId));
    }

    @Operation(summary = "Update Budget Config", description = "Updates the monthly targets for Repair and Maintenance funds.")
    @PutMapping("/{buildingId}/budget")
    public ResponseEntity<Void> updateBudgets(
            @PathVariable Integer buildingId,
            @RequestBody UpdateBudgetRequest req,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        buildingService.updateBuildingBudgets(buildingId, req, principal.user());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Transfer Manager Role", description = "Transfers the House Manager rights to another user. The current manager loses their privileges.")
    @PostMapping("/{buildingId}/transfer-manager/{userId}")
    public ResponseEntity<Void> transferManager(@PathVariable Integer buildingId,
                                                @PathVariable Long userId,
                                                @AuthenticationPrincipal UserPrincipal principal) {

        buildingService.transferManagerRole(buildingId, userId);
        return ResponseEntity.ok().build();
    }
}