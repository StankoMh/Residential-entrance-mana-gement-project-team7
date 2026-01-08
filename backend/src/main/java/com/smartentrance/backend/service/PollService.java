package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.poll.*;
import com.smartentrance.backend.mapper.PollMapper;
import com.smartentrance.backend.model.*;
import com.smartentrance.backend.repository.UserVoteRepository;
import com.smartentrance.backend.repository.VotesOptionRepository;
import com.smartentrance.backend.repository.VotesPollRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollService {

    private final VotesPollRepository pollRepository;
    private final UserVoteRepository userVoteRepository;
    private final VotesOptionRepository optionRepository;
    private final BuildingService buildingService;
    private final UnitService unitService;
    private final PollMapper pollMapper;

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public PollResponse createPoll(Integer buildingId, PollCreateRequest request, User currentUser) {
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

        for (String optionText : request.options()) {
            if (optionText != null && !optionText.isBlank()) {
                VotesOption optionEntity = new VotesOption();
                optionEntity.setOptionText(optionText);
                optionEntity.setPoll(poll);
                poll.getOptions().add(optionEntity);
            }
        }

        VotesPoll votesPoll = pollRepository.save(poll);

        return pollMapper.toResponse(votesPoll, null);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@buildingSecurity.hasAccess(#buildingId, principal.user)")
    public List<PollResponse> getPolls(Integer buildingId, FilterType filter, User currentUser) {
        Instant now = Instant.now();
        List<VotesPoll> polls;

        switch (filter) {
            case ACTIVE -> polls = pollRepository.findAllActive(buildingId, now);
            case HISTORY -> polls = pollRepository.findAllHistory(buildingId, now);
            default -> polls = pollRepository.findAllByBuildingIdOrderByCreatedAtDesc(buildingId);
        }

        Map<Integer, Integer> userVotesMap = userVoteRepository.findAllByUserIdAndBuildingId(currentUser.getId(), buildingId)
                .stream()
                .collect(Collectors.toMap(
                        v -> v.getPoll().getId(),
                        v -> v.getOption().getId()
                ));

        return polls.stream()
                .map(poll -> pollMapper.toResponse(
                        poll,
                        userVotesMap.get(poll.getId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@buildingSecurity.hasAccessByPollId(#pollId, principal.user)") // TODO: FIX
    public PollResponse getPollById(Integer pollId, User currentUser) {
        VotesPoll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new EntityNotFoundException("Poll not found"));

        Integer userVotedOptionId = userVoteRepository.findByPollIdAndUserId(pollId, currentUser.getId())
                .map(v -> v.getOption().getId())
                .orElse(null);

        return pollMapper.toResponse(poll, userVotedOptionId);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canVote(#pollId, #request.unitId(), principal.user)")
    public VoteCastResponse castVote(Integer pollId, VoteCastRequest request, User currentUser) {

        VotesPoll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new EntityNotFoundException("Poll not found"));

        Instant now = Instant.now();
        if (now.isBefore(poll.getStartAt()) || now.isAfter(poll.getEndAt())) {
            throw new IllegalArgumentException("Voting is not allowed at this time.");
        }

        Unit unit = unitService.findById(request.unitId())
                .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

        VotesOption option = optionRepository.findByIdAndPollId(request.optionId(), pollId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid option for this poll"));

        UserVote vote = userVoteRepository.findByPollIdAndUnitId(pollId, unit.getId())
                .map(existingVote -> {
                    existingVote.setOption(option);
                    existingVote.setUser(currentUser);
                    existingVote.setVotedAt(Instant.now());
                    return existingVote;
                })
                .orElseGet(() -> {
                    UserVote newVote = new UserVote();
                    newVote.setPoll(poll);
                    newVote.setUnit(unit);
                    newVote.setUser(currentUser);
                    newVote.setOption(option);
                    return newVote;
                });

        UserVote savedVote = userVoteRepository.save(vote);

        return new VoteCastResponse(savedVote.getId(), unit.getUnitNumber(), savedVote.getVotedAt());
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManagePoll(#pollId, principal.user)")
    public void deletePoll(Integer pollId) {
        if (userVoteRepository.existsByPollId(pollId)) {
            throw new IllegalStateException("Cannot delete poll with existing votes.");
        }

        VotesPoll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new EntityNotFoundException("Poll not found"));

        pollRepository.delete(poll);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManagePoll(#pollId, principal.user)")
    public PollResponse updatePoll(Integer pollId, PollUpdateRequest request) {
        VotesPoll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new EntityNotFoundException("Poll not found"));

        if (!poll.getStartAt().isAfter(Instant.now())) {
            throw new IllegalStateException("Cannot update polls that have already started.");
        }

        if (request.title() != null) poll.setTitle(request.title());
        if (request.description() != null) poll.setDescription(request.description());

        Instant newStart = request.startAt() != null ? request.startAt() : poll.getStartAt();
        Instant newEnd = request.endAt() != null ? request.endAt() : poll.getEndAt();

        if (newEnd.isBefore(newStart)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        if (request.startAt() != null) poll.setStartAt(request.startAt());
        if (request.endAt() != null) poll.setEndAt(request.endAt());

        VotesPoll savedPoll = pollRepository.save(poll);

        return pollMapper.toResponse(savedPoll, null);
    }
}