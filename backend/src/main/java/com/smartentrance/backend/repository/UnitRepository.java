package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.Unit;
import com.smartentrance.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Integer> {

    Optional<Unit> findByAccessCode(String accessCode);

    boolean existsByAccessCode(String accessCode);

    List<Unit> findAllByResponsibleUserId(Integer userId);

    boolean existsByBuildingIdAndResponsibleUserId(Integer buildingId, Integer userId);

    List<Unit> findAllByBuildingIdOrderByUnitNumberAsc(Integer buildingId);

    int countByBuildingId(Integer buildingId);
}