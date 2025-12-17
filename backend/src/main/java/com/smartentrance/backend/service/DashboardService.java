package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.dashboard.DashboardResponse;
import com.smartentrance.backend.dto.dashboard.ManagedBuilding;
import com.smartentrance.backend.dto.dashboard.ResidentUnit;
import com.smartentrance.backend.mapper.BuildingMapper;
import com.smartentrance.backend.mapper.UnitMapper;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BuildingService buildingService;
    private final UnitService unitService;
    private final BuildingMapper buildingMapper;
    private final UnitMapper unitMapper;

    @Transactional(readOnly = true)
    public DashboardResponse getUserDashboard(User user) {

        List<ManagedBuilding> managedBuildings = buildingService.findAllByManagerId(user.getId())
                .stream()
                .map(buildingMapper::toManagedBuilding)
                .toList();

        List<ResidentUnit> myHomes = unitService.findAllByResponsibleUserId(user.getId())
                .stream()
                .map(unitMapper::toResidentUnit)
                .toList();

        return new DashboardResponse(managedBuildings, myHomes);
    }
}