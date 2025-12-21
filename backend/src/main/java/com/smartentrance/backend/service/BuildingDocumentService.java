package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.document.CreateDocumentRequest;
import com.smartentrance.backend.dto.document.DocumentResponse;
import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.model.BuildingDocument;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.repository.BuildingRepository;
import com.smartentrance.backend.repository.DocumentRepository;
import com.smartentrance.backend.security.BuildingSecurity;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuildingDocumentService {

    private final DocumentRepository documentRepository;
    private final BuildingRepository buildingRepository;
    private final BuildingSecurity buildingSecurity;

    public List<DocumentResponse> getDocumentsForBuilding(Integer buildingId, User user) {
        List<BuildingDocument> docs;
        boolean isManager = buildingSecurity.isManager(buildingId, user);

        if (isManager) {
            docs = documentRepository.findAllByBuildingIdOrderByCreatedAtDesc(buildingId);
        } else {
            docs = documentRepository.findAllByBuildingIdAndIsVisibleToResidentsTrueOrderByCreatedAtDesc(buildingId);
        }

        return docs.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void createDocument(Integer buildingId, CreateDocumentRequest req, User uploader) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new EntityNotFoundException("Building not found"));

        BuildingDocument doc = new BuildingDocument();
        doc.setBuilding(building);
        doc.setUploadedBy(uploader);
        doc.setTitle(req.title());
        doc.setDescription(req.description());
        doc.setType(req.type());
        doc.setFileUrl(req.fileUrl());
        doc.setVisibleToResidents(req.isVisibleToResidents());

        documentRepository.save(doc);
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        documentRepository.deleteById(documentId);
    }

    private DocumentResponse mapToResponse(BuildingDocument doc) {
        String uploaderName = (doc.getUploadedBy() != null)
                ? doc.getUploadedBy().getFirstName() + " " + doc.getUploadedBy().getLastName()
                : "System";

        return new DocumentResponse(
                doc.getId(), doc.getTitle(), doc.getDescription(), doc.getType(),
                doc.getFileUrl(), uploaderName, doc.isVisibleToResidents(), doc.getCreatedAt()
        );
    }
}