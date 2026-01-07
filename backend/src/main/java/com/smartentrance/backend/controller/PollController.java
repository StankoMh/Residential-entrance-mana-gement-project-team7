package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.poll.*;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.PollService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @Operation(summary = "List Polls", description = "Retrieves all voting polls for the building, filterable by status (Active/History).")
    @GetMapping("/buildings/{buildingId}/polls")
    public ResponseEntity<List<PollResponse>> getPolls(
            @PathVariable Integer buildingId,
            @RequestParam Optional<FilterType> type,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(pollService.getPolls(buildingId, type.orElse(FilterType.ALL), userPrincipal.user()));
    }

    @Operation(summary = "Get Poll Details", description = "Returns detailed information about a specific poll, including options and current results.")
    @GetMapping("/polls/{pollId}")
    public ResponseEntity<PollResponse> getPoll(
            @PathVariable Integer pollId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(pollService.getPollById(pollId, userPrincipal.user()));
    }

    @Operation(summary = "Create Poll", description = "Creates a new voting poll for residents with multiple options.")
    @PostMapping("/buildings/{buildingId}/polls")
    public ResponseEntity<PollResponse> createPoll(
            @PathVariable Integer buildingId,
            @Valid @RequestBody PollCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PollResponse pollResponse = pollService.createPoll(buildingId, request, userPrincipal.user());
        return ResponseEntity.ok(pollResponse);
    }

    @Operation(summary = "Cast Vote", description = "Records a vote for a specific option. Each unit can vote only once per poll.")
    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<VoteCastResponse> castVote(
            @PathVariable Integer pollId,
            @Valid @RequestBody VoteCastRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(
                pollService.castVote(pollId, request, userPrincipal.user())
        );
    }

    @Operation(summary = "Delete Poll", description = "Removes a poll and all associated votes.")
    @DeleteMapping("/polls/{pollId}")
    public ResponseEntity<Void> deletePoll(
            @PathVariable Integer pollId
    ) {
        pollService.deletePoll(pollId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update Poll", description = "Updates poll details (title, deadline) if the poll is not yet completed.")
    @PutMapping("/polls/{pollId}")
    public ResponseEntity<PollResponse> updatePoll(
            @PathVariable Integer pollId,
            @Valid @RequestBody PollUpdateRequest request
    ) {
        return ResponseEntity.ok(pollService.updatePoll(pollId, request));
    }
}