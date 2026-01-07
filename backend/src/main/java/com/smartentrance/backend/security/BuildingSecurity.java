package com.smartentrance.backend.security;

import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.BuildingDocument;
import com.smartentrance.backend.model.Transaction;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("buildingSecurity")
@RequiredArgsConstructor
public class BuildingSecurity {

    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;
    private final NoticeRepository noticeRepository;
    private final VotesPollRepository pollRepository;
    private final TransactionRepository transactionRepository;
    private final DocumentRepository documentRepository;

    public boolean canManageUnit(Long unitId, User user) {
        return unitRepository.findById(unitId)
                .map(unit -> unit.getBuilding().getManager().getId().equals(user.getId()))
                .orElse(false);
    }

    public boolean hasAccess(Integer buildingId, User user) {
        return buildingRepository.existsByIdAndManagerId(buildingId, user.getId())
                || unitRepository.existsByBuildingIdAndResponsibleUserId(buildingId, user.getId());
    }

    public boolean isManager(Integer buildingId, User user) {
        return buildingRepository.existsByIdAndManagerId(buildingId, user.getId());
    }

    public boolean canManageDocument(Long documentId, User user) {
        return documentRepository.findById(documentId)
                .map(doc -> isManager(doc.getBuilding().getId(), user))
                .orElse(false);
    }

    public boolean isUnitResponsible(Long unitId, User user) {
        return unitRepository.findById(unitId)
                .map(unit -> unit.getResponsibleUser() != null &&
                        unit.getResponsibleUser().getId().equals(user.getId()))
                .orElse(false);
    }

    public boolean canManageNotice(Integer noticeId, User user) {
        return noticeRepository.findById(noticeId)
                .map(notice -> {
                    Building building = notice.getBuilding();

                    return building.getManager().getId().equals(user.getId());
                })
                .orElse(false);
    }

    public boolean canVote(Integer pollId, Long unitId, User user) {
        return pollRepository.findById(pollId)
                .map(poll -> unitRepository.findById(unitId)
                        .map(unit -> {
                            boolean isResponsible = unit.getResponsibleUser() != null
                                    && unit.getResponsibleUser().getId().equals(user.getId());

                            boolean sameBuilding = unit.getBuilding().getId().equals(poll.getBuilding().getId());

                            return isResponsible && sameBuilding && unit.isVerified();
                        })
                        .orElse(false))
                .orElse(false);
    }

    public boolean canManageUnitByTransactionId(Long transactionId, User user) {
        return transactionRepository.findById(transactionId)
                .map(t -> canManageUnit(t.getUnit().getId(), user))
                .orElse(false);
    }

    public boolean isUnitOwner(Long unitId, User user) {
        return unitRepository.findById(unitId)
                .map(unit -> unit.getResponsibleUser() != null &&
                        unit.getResponsibleUser().getId().equals(user.getId()))
                .orElse(false);
    }

    public boolean canAccessUnitFinance(Long unitId, User user) {
        return isUnitOwner(unitId, user) || canManageUnit(unitId, user);
    }

    public boolean canManagePoll(Integer pollId, User user) {
        return pollRepository.findById(pollId)
                .map(poll -> poll.getBuilding().getManager().getId().equals(user.getId()))
                .orElse(false);
    }

    public boolean hasAccessByPollId(Integer pollId, User user) {
        return pollRepository.findById(pollId)
                .map(poll -> hasAccess(poll.getBuilding().getId(), user))
                .orElse(false);
    }

    public boolean isManagerByBuildingId(Integer buildingId, User user) {
        return buildingRepository.existsByIdAndManagerId(buildingId, user.getId());
    }

}