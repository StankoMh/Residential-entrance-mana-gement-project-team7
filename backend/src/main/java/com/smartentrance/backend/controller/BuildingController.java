package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.building.*;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.BuildingService;
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

    @PostMapping
    public ResponseEntity<BuildingResponse> createBuilding(
            @Valid @RequestBody BuildingCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(buildingService.createBuildingWithSkeleton(request, principal.user()));
    }

    @GetMapping("/managed")
    public ResponseEntity<List<BuildingResponse>> getMyManagedBuildings(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(buildingService.getManagedBuildings(principal.user()));
    }

    @GetMapping("/{buildingId}/budget")
    public ResponseEntity<UpdateBudgetRequest> getBudgets(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(buildingService.getCurrentBudgets(buildingId));
    }

    @PutMapping("/{buildingId}/budget")
    public ResponseEntity<Void> updateBudgets(
            @PathVariable Integer buildingId,
            @RequestBody UpdateBudgetRequest req,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        buildingService.updateBuildingBudgets(buildingId, req, principal.user());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{buildingId}/transfer-manager/{userId}")
    public ResponseEntity<Void> transferManager(@PathVariable Integer buildingId,
                                                @PathVariable Long userId,
                                                @AuthenticationPrincipal UserPrincipal principal) {

        buildingService.transferManagerRole(buildingId, userId);
        return ResponseEntity.ok().build();
    }
}