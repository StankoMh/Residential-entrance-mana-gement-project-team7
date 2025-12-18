package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.building_event.CreateNoticeRequest;
import com.smartentrance.backend.dto.building_event.NoticeResponse;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @PostMapping("/{buildingId}/notices")
    public ResponseEntity<?> createNotice(
            @PathVariable Integer buildingId,
            @Valid @RequestBody CreateNoticeRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        noticeService.createNotice(buildingId, request, userPrincipal.user());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{buildingId}/notices")
    public ResponseEntity<List<NoticeResponse>> getNotices(
            @PathVariable Integer buildingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(
                noticeService.getNotices(buildingId)
        );
    }
}