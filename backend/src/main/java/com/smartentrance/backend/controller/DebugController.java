package com.smartentrance.backend.controller;

import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.repository.BuildingRepository;
import com.smartentrance.backend.service.FinanceService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final FinanceService financeService;
    private final BuildingRepository buildingRepository;

    @Operation(summary = "Trigger Monthly Fees", description = "[DEV] Manually triggers the monthly fee generation process for the current month. Useful for testing.")
    @PostMapping("/fees/{buildingId}")
    public ResponseEntity<String> triggerFees(@PathVariable Integer buildingId) {
        Building building = buildingRepository.findById(buildingId).orElseThrow();
        String currentMonth = LocalDate.now().getMonth().toString();

        financeService.processMonthlyFeesForBuilding(building, "TEST-" + currentMonth);

        return ResponseEntity.ok("Fees triggered for building " + building.getName());
    }
}