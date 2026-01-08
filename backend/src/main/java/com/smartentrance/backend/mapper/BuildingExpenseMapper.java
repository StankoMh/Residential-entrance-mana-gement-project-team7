package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.finance.BuildingExpenseResponse;
import com.smartentrance.backend.model.BuildingExpense;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class BuildingExpenseMapper {

    @Value("${application.base-url}")
    private String baseUrl;

    public BuildingExpenseResponse toResponse(BuildingExpense expense) {
        String createdByName = "System";
        if (expense.getCreatedBy() != null) {
            createdByName = expense.getCreatedBy().getFirstName() + " " + expense.getCreatedBy().getLastName();
        }

        return new BuildingExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getFundType(),
                resolveDocumentUrl(expense.getDocumentUrl()),
                expense.getExpenseDate(),
                createdByName
        );
    }

    private String resolveDocumentUrl(String rawPath) {
        if (rawPath == null || rawPath.isBlank()) return null;
        if (rawPath.startsWith("http")) return rawPath;
        return baseUrl + "/api/uploads/files/" + rawPath;
    }
}