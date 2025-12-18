package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.building.BuildingResponse;
import com.smartentrance.backend.dto.building.CreateBuildingRequest;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.BuildingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @PostMapping("/create")
    public ResponseEntity<BuildingResponse> createBuilding(
            @Valid @RequestBody CreateBuildingRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(buildingService.createBuildingWithSkeleton(request, userPrincipal.user()));
    }
}