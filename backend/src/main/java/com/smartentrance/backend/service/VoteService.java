package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.poll.CreatePollRequest;
import com.smartentrance.backend.dto.poll.PollResponse;
import com.smartentrance.backend.mapper.PollMapper;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.VotesOption;
import com.smartentrance.backend.model.VotesPoll;
import com.smartentrance.backend.repository.VotesPollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VotesPollRepository pollRepository;
    private final BuildingService buildingService;
    private final PollMapper pollMapper;

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user.id)")
    public PollResponse createPoll(Integer buildingId, CreatePollRequest request, User currentUser) {
        if (request.endAt().isBefore(request.startAt())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        VotesPoll poll = new VotesPoll();
        poll.setTitle(request.title());
        poll.setDescription(request.description());
        poll.setStartAt(request.startAt());
        poll.setEndAt(request.endAt());
        poll.setBuilding(buildingService.getBuildingReference(buildingId));
        poll.setCreatedBy(currentUser);
        poll.setActive(true);

        for (String optionText : request.options()) {
            if (optionText != null && !optionText.isBlank()) {
                VotesOption optionEntity = new VotesOption();
                optionEntity.setOptionText(optionText);
                optionEntity.setPoll(poll);

                poll.getOptions().add(optionEntity);

            }
        }

        VotesPoll votesPoll = pollRepository.save(poll);
        return pollMapper.toResponse(votesPoll);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@buildingSecurity.hasAccess(#buildingId, principal.user.id)")
    public List<PollResponse> getPolls(Integer buildingId, FilterType filter) {
        LocalDateTime now = LocalDateTime.now();
        List<VotesPoll> polls;

        switch (filter) {
            case FilterType.ACTIVE -> polls = pollRepository.findAllActive(buildingId, now);
            case FilterType.HISTORY -> polls = pollRepository.findAllHistory(buildingId, now);
            default -> polls = pollRepository.findAllByBuildingIdOrderByCreatedAtDesc(buildingId);
        }

        return polls.stream()
                .map(pollMapper::toResponse)
                .toList();
    }
}