package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.notice.CreateNoticeRequest;
import com.smartentrance.backend.dto.notice.NoticeResponse;
import com.smartentrance.backend.model.Notice;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @PostMapping("/{buildingId}/notices")
    public ResponseEntity<NoticeResponse> createNotice(
            @PathVariable Integer buildingId,
            @Valid @RequestBody CreateNoticeRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        NoticeResponse noticeResponse = noticeService.createNotice(buildingId, request, userPrincipal.user());
        return ResponseEntity.ok(noticeResponse);
    }

    @GetMapping("/{buildingId}/notices")
    public ResponseEntity<List<NoticeResponse>> getNotices(
            @PathVariable Integer buildingId,
            @RequestParam Optional<FilterType> type
    ) {
        return ResponseEntity.ok(noticeService.getNotices(buildingId, type.orElse(FilterType.ALL)));
    }
}