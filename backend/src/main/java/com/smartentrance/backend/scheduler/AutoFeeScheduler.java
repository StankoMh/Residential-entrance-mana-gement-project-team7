package com.smartentrance.backend.scheduler;

import com.smartentrance.backend.model.Building;
import com.smartentrance.backend.repository.BuildingRepository;
import com.smartentrance.backend.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
public class AutoFeeScheduler {

    private final BuildingRepository buildingRepository;
    private final FinanceService financeService;

    @Scheduled(cron = "0 0 2 1 * ?")
    @Transactional(readOnly = true)
    public void runMonthlyFees() {
        System.out.println("START: Monthly fee processing...");
        String currentMonth = LocalDate.now().getMonth().toString();

        try (Stream<Building> buildingStream = buildingRepository.streamAll()) {

            buildingStream.forEach(building -> {
                try {
                    financeService.processMonthlyFeesForBuilding(building, currentMonth);
                } catch (Exception e) {
                    System.err.println("FAILED to process building ID " + building.getId() + ": " + e.getMessage());
                }
            });

        } catch (Exception e) {
            System.err.println("CRITICAL DB ERROR: " + e.getMessage());
        }

        System.out.println("END: Monthly fee processing finished.");
    }
}