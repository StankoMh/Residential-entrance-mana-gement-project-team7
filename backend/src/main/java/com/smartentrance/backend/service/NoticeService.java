package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.notice.NoticeResponse;
import com.smartentrance.backend.dto.notice.CreateNoticeRequest;
import com.smartentrance.backend.mapper.NoticeMapper;
import com.smartentrance.backend.model.Notice;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final BuildingService buildingService;
    private final NoticeMapper noticeMapper;

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user.id)")
    public NoticeResponse createNotice(Integer buildingId, CreateNoticeRequest request, User currentUser) {
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
    @PreAuthorize("@buildingSecurity.hasAccess(#buildingId, principal.user.id)")
    public List<NoticeResponse> getNotices(Integer buildingId, FilterType filter) {
        LocalDateTime now = LocalDateTime.now();
        List<Notice> notices;
        switch (filter) {
            case FilterType.ACTIVE -> notices = noticeRepository.findAllByBuildingIdAndEventDateTimeAfterOrderByEventDateTimeAsc(buildingId, now);
            case FilterType.HISTORY -> notices = noticeRepository.findAllByBuildingIdAndEventDateTimeBeforeOrderByEventDateTimeDesc(buildingId, now);
            default -> notices = noticeRepository.findAllByBuildingIdOrderByEventDateTimeDesc(buildingId);
        }

        return notices.stream().map(noticeMapper::toResponse).toList();
    }
}