package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.notice.NoticeResponse;
import com.smartentrance.backend.model.BuildingDocument;
import com.smartentrance.backend.model.Notice;
import org.springframework.stereotype.Component;

@Component
public class NoticeMapper {

    public NoticeResponse toResponse(Notice notice) {
        NoticeResponse.DocumentInfo documentInfo = null;

        if (notice.getDocument() != null) {
            BuildingDocument doc = notice.getDocument();
            documentInfo = new NoticeResponse.DocumentInfo(
                    doc.getId(),
                    doc.getTitle(),
                    doc.getFileUrl(),
                    doc.getType()
            );
        }

        return new NoticeResponse(
                notice.getId(),
                notice.getCreatedBy().getId(),
                notice.getTitle(),
                notice.getDescription(),
                notice.getLocation(),
                notice.getEventDateTime(),
                documentInfo
        );
    }
}