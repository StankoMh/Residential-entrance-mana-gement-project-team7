package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.notice.NoticeCreateRequest;
import com.smartentrance.backend.dto.notice.NoticeResponse;
import com.smartentrance.backend.dto.notice.NoticeUpdateRequest;
import com.smartentrance.backend.mapper.NoticeMapper;
import com.smartentrance.backend.model.BuildingDocument;
import com.smartentrance.backend.model.Notice;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.DocumentType;
import com.smartentrance.backend.repository.DocumentRepository;
import com.smartentrance.backend.repository.NoticeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final BuildingService buildingService;
    private final NoticeMapper noticeMapper;
    private final FileStorageService fileStorageService;
    private final DocumentRepository documentRepository;

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public NoticeResponse createNotice(Integer buildingId, NoticeCreateRequest request, MultipartFile documentFile, User currentUser) {
        BuildingDocument document = null;

        // Handle document upload if provided
        if (documentFile != null && !documentFile.isEmpty()) {
            // Upload file
            String fileName = fileStorageService.storeFile(documentFile, currentUser);
            String fileUrl = "/api/uploads/files/" + fileName;

            // Create BuildingDocument entity
            document = new BuildingDocument();
            document.setBuilding(buildingService.getBuildingReference(buildingId));
            document.setUploadedBy(currentUser);
            document.setTitle(request.documentTitle() != null ? request.documentTitle() : request.title());
            document.setDescription(request.documentDescription());
            document.setType(request.documentType() != null ? request.documentType() : DocumentType.OTHER);
            document.setFileUrl(fileUrl);
            document.setVisibleToResidents(request.documentVisibleToResidents() != null ? request.documentVisibleToResidents() : true);

            // Save document
            document = documentRepository.save(document);
        }

        // Create notice
        Notice event = Notice.builder()
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .eventDateTime(request.noticeDateTime())
                .building(buildingService.getBuildingReference(buildingId))
                .createdBy(currentUser)
                .document(document)  // Link document (null if not provided)
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