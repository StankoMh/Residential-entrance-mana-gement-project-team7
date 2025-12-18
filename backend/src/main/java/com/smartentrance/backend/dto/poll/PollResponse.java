package com.smartentrance.backend.dto.poll;

import com.smartentrance.backend.dto.enums.PollStatus;

import java.time.LocalDateTime;
import java.util.List;

public record PollResponse(
        Integer id,
        Integer createdByUserId,
        String title,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        boolean isActive,
        PollStatus status,
        List<PollOptionResponse> options
) {
    public record PollOptionResponse(Integer id, String text) {}
}