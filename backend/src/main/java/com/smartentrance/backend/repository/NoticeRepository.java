package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Integer> {
    List<Notice> findAllByBuildingIdOrderByEventDateTimeDesc(Integer buildingId);

    List<Notice> findAllByBuildingIdAndEventDateTimeAfterOrderByEventDateTimeAsc(Integer buildingId, LocalDateTime now);

    List<Notice> findAllByBuildingIdAndEventDateTimeBeforeOrderByEventDateTimeDesc(Integer buildingId, LocalDateTime now);
}
