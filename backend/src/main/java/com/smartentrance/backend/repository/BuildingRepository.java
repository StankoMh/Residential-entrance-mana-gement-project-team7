package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.Building;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Stream;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Integer> {

    boolean existsByGooglePlaceIdAndEntrance(String googlePlaceId, String entrance);

    boolean existsByIdAndManagerId(Integer id, Integer managerId);

    List<Building> findAllByManagerId(Integer managerId);

    @QueryHints(value = @QueryHint(name = HINT_FETCH_SIZE, value = "50"))
    @Query("SELECT b FROM Building b")
    Stream<Building> streamAll();

}
