package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.unit.JoinUnitRequest;
import com.smartentrance.backend.dto.unit.UnitResponse;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @PostMapping("/join")
    public ResponseEntity<UnitResponse> joinUnit(
            @Valid @RequestBody JoinUnitRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(unitService.joinUnit(request, userPrincipal.user()));
    }
}