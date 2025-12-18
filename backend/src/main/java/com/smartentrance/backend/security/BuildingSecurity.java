package com.smartentrance.backend.security;

import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.repository.BuildingRepository;
import com.smartentrance.backend.repository.NoticeRepository;
import com.smartentrance.backend.repository.UnitRepository;
import com.smartentrance.backend.repository.VotesPollRepository;
import lombok.RequiredArgsConstructor;
 import org.springframework.stereotype.Component;

@Component("buildingSecurity")
@RequiredArgsConstructor
public class BuildingSecurity {

    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;
    private final NoticeRepository noticeRepository;
    private final VotesPollRepository pollRepository;

    public boolean hasAccess(Integer buildingId, Integer userId) {
        return buildingRepository.existsByIdAndManagerId(buildingId, userId)
                || unitRepository.existsByBuildingIdAndResponsibleUserId(buildingId, userId);
    }


    public boolean isManager(Integer buildingId, Integer userId) {
        return buildingRepository.existsByIdAndManagerId(buildingId, userId);
    }

    public boolean canManageNotice(Integer noticeId, Integer userId) {
        // 1. Търсим съобщението
        return noticeRepository.findById(noticeId)
                .map(notice -> {
                    Building building = notice.getBuilding();

                    return building.getManager().getId().equals(userId);
                })
                .orElse(false);
    }

    public boolean canVote(Integer pollId, Integer unitId, Integer userId) {
        return pollRepository.findById(pollId)
                .map(poll -> unitRepository.findById(unitId)
                        .map(unit -> {
                            boolean isResponsible = unit.getResponsibleUser() != null
                                    && unit.getResponsibleUser().getId().equals(userId);

                            boolean sameBuilding = unit.getBuilding().getId().equals(poll.getBuilding().getId());

                            return isResponsible && sameBuilding;
                        })
                        .orElse(false))
                .orElse(false);
    }

    public boolean canManagePoll(Integer pollId, Integer userId) {
        return pollRepository.findById(pollId)
                .map(poll -> poll.getBuilding().getManager().getId().equals(userId))
                .orElse(false);
    }
}