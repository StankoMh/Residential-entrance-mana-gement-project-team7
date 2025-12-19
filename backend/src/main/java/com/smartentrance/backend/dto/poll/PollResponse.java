package com.smartentrance.backend.dto.poll;

import com.smartentrance.backend.dto.enums.PollStatus;

import java.time.Instant;
import java.util.List;

public record PollResponse(
        Integer id,
        Integer createdByUserId,
        String title,
        String description,
        Instant startAt,
        Instant endAt,
        PollStatus status,
        Long totalVotes,
        Integer totalEligibleVoters,
        List<PollOptionResponse> options
) {
    public record PollOptionResponse(Integer id, String text, Long voteCount) {}
}