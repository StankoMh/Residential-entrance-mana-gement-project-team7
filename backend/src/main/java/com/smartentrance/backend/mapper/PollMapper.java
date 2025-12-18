package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.poll.PollResponse;
import com.smartentrance.backend.model.VotesPoll;
import com.smartentrance.backend.dto.enums.PollStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class PollMapper {

    public PollResponse toResponse(VotesPoll poll) {
        LocalDateTime now = LocalDateTime.now();

        PollStatus status;

        if (!poll.isActive()) {
            status = PollStatus.STOPPED;
        } else if (now.isBefore(poll.getStartAt())) {
            status = PollStatus.PLANNED;
        } else if (now.isAfter(poll.getEndAt())) {
            status = PollStatus.COMPLETED;
        } else {
            status = PollStatus.ACTIVE;
        }

        List<PollResponse.PollOptionResponse> options = poll.getOptions().stream()
                .map(opt -> new PollResponse.PollOptionResponse(opt.getId(), opt.getOptionText()))
                .toList();

        return new PollResponse(
                poll.getId(),
                poll.getCreatedBy().getId(),
                poll.getTitle(),
                poll.getDescription(),
                poll.getStartAt(),
                poll.getEndAt(),
                poll.isActive(),
                status,
                options
        );
    }
}