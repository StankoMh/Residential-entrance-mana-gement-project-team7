package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.VotesPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VotesPollRepository extends JpaRepository<VotesPoll, Integer> {
    List<VotesPoll> findAllByBuildingIdOrderByCreatedAtDesc(Integer buildingId);

    @Query("""
        SELECT p FROM VotesPoll p 
        WHERE p.building.id = :buildingId 
        AND p.isActive = true 
        AND :now BETWEEN p.startAt AND p.endAt
        ORDER BY p.endAt ASC
    """)
    List<VotesPoll> findAllActive(@Param("buildingId") Integer buildingId, @Param("now") LocalDateTime now);

    @Query("""
        SELECT p FROM VotesPoll p 
        WHERE p.building.id = :buildingId 
        AND (p.isActive = false OR p.endAt < :now)
        ORDER BY p.endAt DESC
    """)
    List<VotesPoll> findAllHistory(@Param("buildingId") Integer buildingId, @Param("now") LocalDateTime now);
}
