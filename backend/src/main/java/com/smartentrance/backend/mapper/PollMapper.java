package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.enums.PollStatus;
import com.smartentrance.backend.dto.poll.PollResponse;
import com.smartentrance.backend.model.VotesPoll;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class PollMapper {

    public PollResponse toResponse(VotesPoll poll, Integer userVotedOptionId) {
        Instant now = Instant.now();
        PollStatus status = calculateStatus(poll, now);

        List<PollResponse.PollOptionResponse> options = poll.getOptions().stream()
                .map(opt -> new PollResponse.PollOptionResponse(
                        opt.getId(),
                        opt.getOptionText(),
                        (long) opt.getVotes().size()
                ))
                .toList();

        Long totalVotes = options.stream()
                .mapToLong(PollResponse.PollOptionResponse::voteCount)
                .sum();

        int totalEligible = poll.getEligibleVotersCount() != null ? poll.getEligibleVotersCount() : 0;

        return new PollResponse(
                poll.getId(),
                poll.getCreatedBy().getId(),
                poll.getTitle(),
                poll.getDescription(),
                poll.getStartAt(),
                poll.getEndAt(),
                status,
                totalVotes,
                totalEligible,
                userVotedOptionId,
                options
        );
    }

    private PollStatus calculateStatus(VotesPoll poll, Instant now) {
        if (now.isBefore(poll.getStartAt())) return PollStatus.PLANNED;
        if (now.isAfter(poll.getEndAt())) return PollStatus.COMPLETED;
        return PollStatus.ACTIVE;
    }
}