package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.enums.PollStatus;
import com.smartentrance.backend.dto.poll.PollResponse;
import com.smartentrance.backend.model.VotesPoll;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class PollMapper {

    public PollResponse toResponse(VotesPoll poll) {
        Instant now = Instant.now();

        PollStatus status;

        if (now.isBefore(poll.getStartAt())) {
            status = PollStatus.PLANNED;
        } else if (now.isAfter(poll.getEndAt())) {
            status = PollStatus.COMPLETED;
        } else {
            status = PollStatus.ACTIVE;
        }

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
                options
        );
    }
}