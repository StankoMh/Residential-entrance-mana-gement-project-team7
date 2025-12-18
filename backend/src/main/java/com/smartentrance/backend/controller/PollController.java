package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.poll.*;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.PollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @GetMapping("/buildings/{buildingId}/polls")
    public ResponseEntity<List<PollResponse>> getPolls(
            @PathVariable Integer buildingId,
            @RequestParam Optional<FilterType> type
    ) {
        return ResponseEntity.ok(pollService.getPolls(buildingId, type.orElse(FilterType.ALL)));
    }

    @PostMapping("/buildings/{buildingId}/polls")
    public ResponseEntity<PollResponse> createPoll(
            @PathVariable Integer buildingId,
            @Valid @RequestBody CreatePollRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PollResponse pollResponse = pollService.createPoll(buildingId, request, userPrincipal.user());
        return ResponseEntity.ok(pollResponse);
    }

    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<CastVoteResponse> castVote(
            @PathVariable Integer pollId,
            @Valid @RequestBody CastVoteRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(
                pollService.castVote(pollId, request, userPrincipal.user())
        );
    }

    @DeleteMapping("/polls/{pollId}")
    public ResponseEntity<Void> deletePoll(
            @PathVariable Integer pollId
    ) {
        pollService.deletePoll(pollId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/polls/{pollId}")
    public ResponseEntity<PollResponse> updatePoll(
            @PathVariable Integer pollId,
            @Valid @RequestBody UpdatePollRequest request
    ) {
        return ResponseEntity.ok(pollService.updatePoll(pollId, request));
    }
}