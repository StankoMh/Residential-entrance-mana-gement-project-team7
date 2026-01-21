package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.notice.NoticeCreateRequest;
import com.smartentrance.backend.dto.notice.NoticeResponse;
import com.smartentrance.backend.dto.notice.NoticeUpdateRequest;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.NoticeService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @Operation(summary = "Create Notice (JSON)", description = "Publishes a new announcement or General Assembly notice for the building residents.")
    @PostMapping(value = "/buildings/{buildingId}/notices", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NoticeResponse> createNoticeJson(
            @PathVariable Integer buildingId,
            @Valid @RequestBody NoticeCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        NoticeResponse noticeResponse = noticeService.createNotice(buildingId, request, null, userPrincipal.user());
        return ResponseEntity.ok(noticeResponse);
    }

    @Operation(summary = "Create Notice (with Document)", description = "Publishes a new announcement with an optional document attachment.")
    @PostMapping(value = "/buildings/{buildingId}/notices", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NoticeResponse> createNoticeMultipart(
            @PathVariable Integer buildingId,
            @Valid @ModelAttribute NoticeCreateRequest request,
            @RequestPart(value = "documentFile", required = false) MultipartFile documentFile,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        NoticeResponse noticeResponse = noticeService.createNotice(buildingId, request, documentFile, userPrincipal.user());
        return ResponseEntity.ok(noticeResponse);
    }

    @Operation(summary = "List Notices", description = "Retrieves a list of active or past notices for the building.")
    @GetMapping("/buildings/{buildingId}/notices")
    public ResponseEntity<List<NoticeResponse>> getNotices(
            @PathVariable Integer buildingId,
            @RequestParam Optional<FilterType> type
    ) {
        return ResponseEntity.ok(noticeService.getNotices(buildingId, type.orElse(FilterType.ALL)));
    }

    @Operation(summary = "Delete Notice", description = "Removes an announcement from the building board.")
    @DeleteMapping("/notices/{noticeId}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Integer noticeId,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        noticeService.deleteNotice(noticeId);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update Notice", description = "Modifies the details (title, description, time) of an existing notice.")
    @PutMapping("/notices/{noticeId}")
    public ResponseEntity<NoticeResponse> updateEvent(
            @PathVariable Integer noticeId,
            @RequestBody @Valid NoticeUpdateRequest updateData,
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.ok(noticeService.updateEvent(noticeId, updateData));
    }
}