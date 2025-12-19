package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.VotesOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VotesOptionRepository extends JpaRepository<VotesOption, Integer> {
    Optional<VotesOption> findByIdAndPollId(Integer optionId, Integer pollId);
}
