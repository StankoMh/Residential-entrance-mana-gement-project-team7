package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.unit.UnitJoinRequest;
import com.smartentrance.backend.dto.unit.UnitResponse;
import com.smartentrance.backend.dto.unit.UnitUpdateRequest;
import com.smartentrance.backend.mapper.UnitMapper;
import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.repository.UnitRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;

    @Transactional
    public UnitResponse joinUnit(UnitJoinRequest request, User currentUser) {
        Unit unit = unitRepository.findByAccessCode(request.accessCode())
                .orElseThrow(() -> new EntityNotFoundException("Invalid access code."));

        if (unit.getResponsibleUser() != null) {
            throw new EntityExistsException("This unit is already occupied.");
        }

        unit.setResponsibleUser(currentUser);
        unit.setResidentsCount(request.residentsCount());
        unit.setArea(request.area());
        unit.setVerified(false);
        unit.setAccessCode(generateUniqueAccessCode());

        return unitMapper.toResidentResponse(unitRepository.save(unit));
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManageUnit(#unitId, principal.user)")
    public UnitResponse updateUnit(Integer unitId, UnitUpdateRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        unit.setArea(request.area());
        unit.setResidentsCount(request.residentsCount());
        unit.setVerified(true);

        return unitMapper.toResidentResponse(unitRepository.save(unit));
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManageUnit(#unitId, principal.user)")
    public void verifyUnit(Integer unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        unit.setVerified(true);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public List<UnitResponse> getUnitsByBuilding(Integer buildingId) {
        return unitRepository.findAllByBuildingIdOrderByUnitNumberAsc(buildingId)
                .stream()
                .map(unitMapper::toManagementResponse)
                .toList();
    }

    public List<UnitResponse> getMyUnits(User user) {
        return unitRepository.findAllByResponsibleUserId(user.getId())
                .stream()
                .map(unitMapper::toResidentResponse)
                .toList();
    }

    public String generateUniqueAccessCode() {
        String code;
        do {
            code = generateRandomString(8);
        } while (unitRepository.existsByAccessCode(code));
        return code;
    }

    private String generateRandomString(int length) {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public void saveAll(List<Unit> units){
        unitRepository.saveAll(units);
    }

    public Optional<Unit> findById(Integer id) {
        return unitRepository.findById(id);
    }

    public List<Unit> findAllByResponsibleUserId(Integer userId) {
        return unitRepository.findAllByResponsibleUserId(userId);
    }
}