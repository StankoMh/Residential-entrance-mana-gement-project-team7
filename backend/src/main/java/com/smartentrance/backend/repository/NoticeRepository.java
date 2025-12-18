package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Integer> {
    List<Notice> findAllByBuildingIdOrderByEventDateTimeDesc(Integer buildingId);

    List<Notice> findAllByBuildingIdAndEventDateTimeAfterOrderByEventDateTimeAsc(Integer buildingId, Instant now);

    List<Notice> findAllByBuildingIdAndEventDateTimeBeforeOrderByEventDateTimeDesc(Integer buildingId, Instant now);
}
