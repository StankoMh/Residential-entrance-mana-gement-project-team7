package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.building_event.NoticeResponse;
import com.smartentrance.backend.dto.building_event.CreateNoticeRequest;
import com.smartentrance.backend.mapper.NoticeMapper;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.Notice;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.repository.NoticeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final BuildingService buildingService;
    private final NoticeMapper noticeMapper;

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user.id)")
    public void createNotice(Integer buildingId, CreateNoticeRequest request, User currentUser) {
        Building building = buildingService.findById(buildingId)
                .orElseThrow(() -> new EntityNotFoundException("Building not found"));

        Notice event = Notice.builder()
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .eventDateTime(request.noticeDateTime())
                .building(building)
                .createdBy(currentUser)
                .build();

        noticeRepository.save(event);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@buildingSecurity.hasAccess(#buildingId, principal.user.id)")
    public List<NoticeResponse> getNotices(Integer buildingId) {
        return noticeRepository.findAllByBuildingIdOrderByEventDateTimeAsc(buildingId)
                .stream()
                .map(noticeMapper::toResponse)
                .toList();
    }
}