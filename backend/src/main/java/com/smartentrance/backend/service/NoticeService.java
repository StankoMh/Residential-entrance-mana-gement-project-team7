package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.notice.NoticeCreateRequest;
import com.smartentrance.backend.dto.notice.NoticeResponse;
import com.smartentrance.backend.dto.notice.NoticeUpdateRequest;
import com.smartentrance.backend.mapper.NoticeMapper;
import com.smartentrance.backend.model.Notice;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.repository.NoticeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final BuildingService buildingService;
    private final NoticeMapper noticeMapper;

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public NoticeResponse createNotice(Integer buildingId, NoticeCreateRequest request, User currentUser) {
        Notice event = Notice.builder()
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .eventDateTime(request.noticeDateTime())
                .building(buildingService.getBuildingReference(buildingId))
                .createdBy(currentUser)
                .build();

        Notice savedNotice = noticeRepository.save(event);
        return noticeMapper.toResponse(savedNotice);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@buildingSecurity.hasAccess(#buildingId, principal.user)")
    public List<NoticeResponse> getNotices(Integer buildingId, FilterType filter) {
        Instant now = Instant.now();
        List<Notice> notices;
        switch (filter) {
            case FilterType.ACTIVE -> notices = noticeRepository.findAllByBuildingIdAndEventDateTimeAfterOrderByEventDateTimeAsc(buildingId, now);
            case FilterType.HISTORY -> notices = noticeRepository.findAllByBuildingIdAndEventDateTimeBeforeOrderByEventDateTimeDesc(buildingId, now);
            default -> notices = noticeRepository.findAllByBuildingIdOrderByEventDateTimeDesc(buildingId);
        }

        return notices.stream().map(noticeMapper::toResponse).toList();
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManageNotice(#noticeId, principal.user)")
    public void deleteNotice(Integer noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new EntityNotFoundException("Notice not found"));

        if (notice.getEventDateTime().isBefore(Instant.now())) {
            throw new IllegalStateException("You cannot delete past notices (event has already happened).");
        }

        noticeRepository.delete(notice);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManageNotice(#noticeId, principal.user)")
    public NoticeResponse updateEvent(Integer noticeId, NoticeUpdateRequest updateData) {

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (notice.getEventDateTime().isBefore(Instant.now())) {
            throw new IllegalStateException("Cannot update past notices (event has already happened).");
        }

        if (updateData.title() != null) {
            notice.setTitle(updateData.title());
        }

        if (updateData.description() != null) {
            notice.setDescription(updateData.description());
        }

        if(updateData.location() != null) {
            notice.setLocation(updateData.location());
        }

        if (updateData.noticeDateTime() != null) {
            notice.setEventDateTime(updateData.noticeDateTime());
        }

        Notice savedNotice = noticeRepository.save(notice);
        return noticeMapper.toResponse(savedNotice);
    }
}