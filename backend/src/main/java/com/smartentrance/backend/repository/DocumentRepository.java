package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.BuildingDocument;
import com.smartentrance.backend.model.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<BuildingDocument, Long> {

    List<BuildingDocument> findAllByBuildingIdOrderByCreatedAtDesc(Integer buildingId);

    List<BuildingDocument> findAllByBuildingIdAndIsVisibleToResidentsTrueOrderByCreatedAtDesc(Integer buildingId);

    List<BuildingDocument> findAllByBuildingIdAndType(Integer buildingId, DocumentType type);

    Optional<BuildingDocument> findByFileUrl(String url);
}