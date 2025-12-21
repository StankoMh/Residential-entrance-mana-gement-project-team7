package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.VotesPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface VotesPollRepository extends JpaRepository<VotesPoll, Integer> {

    @Query("SELECT DISTINCT p FROM VotesPoll p LEFT JOIN FETCH p.options WHERE p.building.id = :buildingId ORDER BY p.createdAt DESC")
    List<VotesPoll> findAllByBuildingIdOrderByCreatedAtDesc(@Param("buildingId") Integer buildingId);

    @Query("""
        SELECT DISTINCT p FROM VotesPoll p
        LEFT JOIN FETCH p.options
        WHERE p.building.id = :buildingId
        AND :now BETWEEN p.startAt AND p.endAt
        ORDER BY p.endAt ASC
    """)
    List<VotesPoll> findAllActive(@Param("buildingId") Integer buildingId, @Param("now") Instant now);

    @Query("""
        SELECT DISTINCT p FROM VotesPoll p
        LEFT JOIN FETCH p.options
        WHERE p.building.id = :buildingId
        AND p.endAt < :now
        ORDER BY p.endAt DESC
    """)
    List<VotesPoll> findAllHistory(@Param("buildingId") Integer buildingId, @Param("now") Instant now);
}