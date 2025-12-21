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
import org.springframework.context.annotation.Lazy;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
public class UnitService {

    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;
    private final FinanceService financeService;

    public UnitService(UnitRepository unitRepository,
                       UnitMapper unitMapper,
                       @Lazy FinanceService financeService) {
        this.unitRepository = unitRepository;
        this.unitMapper = unitMapper;
        this.financeService = financeService;
    }

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

        Unit savedUnit = unitRepository.save(unit);

        BigDecimal balance = financeService.getBalance(savedUnit.getId());
        boolean hasPending = financeService.hasPendingPayments(savedUnit.getId());

        return unitMapper.toResidentResponse(savedUnit, balance, hasPending);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManageUnit(#unitId, principal.user)")
    public UnitResponse updateUnit(Long unitId, UnitUpdateRequest request, User user) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        unit.setArea(request.area());
        unit.setResidentsCount(request.residentsCount());

        boolean isManager = unit.getBuilding().getManager().equals(user);
        unit.setVerified(isManager);

        Unit savedUnit = unitRepository.save(unit);

        BigDecimal balance = financeService.getBalance(savedUnit.getId());
        boolean hasPending = financeService.hasPendingPayments(savedUnit.getId());

        return unitMapper.toResidentResponse(savedUnit, balance, hasPending);
    }

    // Нова функционалност: Смяна на собственост
    // UnitService.java

    @Transactional
    @PreAuthorize("@buildingSecurity.isManagerForUnit(#unitId, principal.user)")
    public UnitResponse transferOwnership(Long unitId, boolean keepBalance, String protocolUrl) {

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        if (!keepBalance) {
            financeService.clearUnitBalance(unitId);
        }
        if (protocolUrl != null) {
            financeService.createSystemNote(unitId, "Смяна на собственост / Ownership Transfer", protocolUrl);
        }

        unit.setResponsibleUser(null); // Махаме стария
        unit.setVerified(false);       // Новият трябва да се верифицира
        unit.setResidentsCount(0);     // Новият ще каже колко хора са
        unit.setAccessCode(generateUniqueAccessCode()); // Нова парола за новия човек

        Unit saved = unitRepository.save(unit);

        BigDecimal newBalance = financeService.getBalance(saved.getId());
        return unitMapper.toManagementResponse(saved, newBalance, false);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManageUnit(#unitId, principal.user)")
    public void verifyUnit(Long unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));
        unit.setVerified(true);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public List<UnitResponse> getUnitsByBuilding(Integer buildingId) {
        return unitRepository.findAllByBuildingIdOrderByUnitNumberAsc(buildingId)
                .stream()
                .map(unit -> {
                    BigDecimal balance = financeService.getBalance(unit.getId());
                    boolean hasPending = financeService.hasPendingPayments(unit.getId());
                    return unitMapper.toManagementResponse(unit, balance, hasPending);
                })
                .toList();
    }

    public List<UnitResponse> getMyUnits(User user) {
        return unitRepository.findAllByResponsibleUserId(user.getId())
                .stream()
                .map(unit -> {
                    BigDecimal balance = financeService.getBalance(unit.getId());
                    boolean hasPending = financeService.hasPendingPayments(unit.getId());
                    return unitMapper.toResidentResponse(unit, balance, hasPending);
                })
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
        for (int i = 0; i < length; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        return sb.toString();
    }

    public void saveAll(List<Unit> units){ unitRepository.saveAll(units); }
    public Optional<Unit> findById(Long id) { return unitRepository.findById(id); }
    public List<Unit> findAllByBuildingId(Integer buildingId) { return unitRepository.findAllByBuildingId(buildingId); }
}