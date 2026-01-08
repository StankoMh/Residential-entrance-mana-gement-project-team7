package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.notice.NoticeResponse;
import com.smartentrance.backend.model.Notice;
import org.springframework.stereotype.Component;

@Component
public class NoticeMapper {

    public NoticeResponse toResponse(Notice notice) {
        return new NoticeResponse(
                notice.getId(),
                notice.getCreatedBy().getId(),
                notice.getTitle(),
                notice.getDescription(),
                notice.getLocation(),
                notice.getEventDateTime()
        );
    }
}