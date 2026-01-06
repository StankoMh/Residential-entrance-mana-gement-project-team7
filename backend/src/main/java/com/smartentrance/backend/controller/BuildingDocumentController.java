package com.smartentrance.backend.controller;

import com.smartentrance.backend.dto.document.CreateDocumentRequest;
import com.smartentrance.backend.dto.document.DocumentResponse;
import com.smartentrance.backend.model.enums.DocumentType;
import com.smartentrance.backend.security.UserPrincipal;
import com.smartentrance.backend.service.BuildingDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings/{buildingId}/documents")
@RequiredArgsConstructor
public class BuildingDocumentController {

    private final BuildingDocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            @PathVariable Integer buildingId,
            @RequestParam(required = false) DocumentType type,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(documentService.getDocumentsForBuilding(buildingId, type, principal.user()));
    }

    @PostMapping
    public ResponseEntity<Void> createDocument(
            @PathVariable Integer buildingId,
            @RequestBody CreateDocumentRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        documentService.createDocument(buildingId, req, principal.user());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long documentId, @PathVariable Integer buildingId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok().build();
    }
}