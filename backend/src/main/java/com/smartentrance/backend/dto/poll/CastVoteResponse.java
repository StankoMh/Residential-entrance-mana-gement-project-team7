package com.smartentrance.backend.dto.poll;

import java.time.Instant;

public record CastVoteResponse(
        Integer id,
        Integer unitNumber,
        Instant votedAt
){}
