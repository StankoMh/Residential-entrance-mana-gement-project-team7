package com.smartentrance.backend.dto.poll;

import java.time.Instant;

public record VoteCastResponse(
        Integer id,
        Integer unitNumber,
        Instant votedAt
){}
