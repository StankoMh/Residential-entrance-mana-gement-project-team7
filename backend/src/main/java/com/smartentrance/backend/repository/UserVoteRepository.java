package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.UserVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoteRepository extends JpaRepository<UserVote, Integer> {
    Optional<UserVote> findByPollIdAndUnitId(Integer pollId, Long unitId);

    boolean existsByPollId(Integer pollId);

    Optional<UserVote> findByPollIdAndUserId(Integer pollId, Long userId);

    @Query("SELECT v FROM UserVote v WHERE v.user.id = :userId AND v.poll.building.id = :buildingId")
    List<UserVote> findAllByUserIdAndBuildingId(@Param("userId") Long userId, @Param("buildingId") Integer buildingId);
}
