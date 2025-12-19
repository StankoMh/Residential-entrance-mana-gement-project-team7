package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.UserVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserVoteRepository extends JpaRepository<UserVote, Integer> {
    Optional<UserVote> findByPollIdAndUnitId(Integer pollId, Integer unitId);

    boolean existsByPollId(Integer pollId);
}
