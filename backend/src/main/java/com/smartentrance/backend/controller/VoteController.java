package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.enums.FilterType;
import com.smartentrance.backend.dto.poll.CreatePollRequest;
import com.smartentrance.backend.dto.poll.PollResponse;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @GetMapping("/{buildingId}/polls")
    public ResponseEntity<List<PollResponse>> getPolls(
            @PathVariable Integer buildingId,
            @RequestParam Optional<FilterType> type
    ) {
        return ResponseEntity.ok(voteService.getPolls(buildingId, type.orElse(FilterType.ALL)));
    }

    @PostMapping("/{buildingId}/polls")
    public ResponseEntity<PollResponse> createPoll(
            @PathVariable Integer buildingId,
            @Valid @RequestBody CreatePollRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PollResponse pollResponse = voteService.createPoll(buildingId, request, userPrincipal.user());
        return ResponseEntity.ok(pollResponse);
    }
}