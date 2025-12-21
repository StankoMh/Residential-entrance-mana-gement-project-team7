package com.smartentrance.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartentrance.backend.dto.finance.CashDepositRequest;
import com.smartentrance.backend.model.*;
import com.smartentrance.backend.model.enums.UserRole;
import com.smartentrance.backend.repository.*;
import com.smartentrance.backend.service.FinanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = true)
@Transactional // Важно: Изчиства базата след всеки тест
@ActiveProfiles("test") // Ще ползва application-test.yaml ако имаш, или H2 по дефолт
public class FullFlowIntegrationTest {

    @Autowired private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    // Repositories за setup на данните
    @Autowired private UserRepository userRepository;
    @Autowired private BuildingRepository buildingRepository;
    @Autowired private UnitRepository unitRepository;
    @Autowired private FinanceService financeService;

    private User manager;
    private Building building;
    private Unit unit;
    @Autowired
    private WebApplicationContext context;

    @BeforeEach
    void setupData() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        // 1. ПЪРВО записваме потребителя и КЛЪЦВАМЕ резултата в променливата
        // Това гарантира, че мениджърът има ID в базата
        manager = userRepository.save(User.builder()
                .email("manager@test.com")
                .hashedPassword("password")
                .firstName("Boss")
                .lastName("Man")
                .role(UserRole.USER)
                .build());

        // 2. ВТОРО създаваме сградата, като даваме ВЕЧЕ ЗАПИСАНИЯ manager
        building = Building.builder()
                .name("Test Tower")
                .address("Sofia 1000")
                .googlePlaceId("DUMMY_ID")
                .entrance("A")
                .totalUnits(1)
                .manager(manager) // <--- Тук се предава записания обект с ID
                .repairBudget(new BigDecimal("100.00"))
                .maintenanceBudget(new BigDecimal("50.00"))
                .build();

        building = buildingRepository.save(building);

        // 3. ТРЕТО създаваме Unit-а
        unit = Unit.builder()
                .building(building)
                .unitNumber(1)
                .accessCode("ABCDEFGH")
                .area(new BigDecimal("100.00"))
                .residentsCount(1)
                .isVerified(true)
                .responsibleUser(manager)
                .build();

        unit = unitRepository.save(unit);
    }

    @Test
    @WithMockUser(username = "manager@test.com", roles = "USER") // Симулираме логнат потребител
    void testMonthlyFeesAndPaymentFlow() throws Exception {

        // --- СТЪПКА 1: Начисляване на такси ---
        // Тъй като unit е 100% от сградата, той поема целия бюджет:
        // Ремонт: 100 лв, Вход: 50 лв. Общо дълг: 150 лв.

        financeService.processMonthlyFeesForBuilding(building, "JANUARY");

        // Проверка чрез API: Балансът трябва да е -150.00
        mockMvc.perform(get("/api/units/" + unit.getId() + "/balance"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(-150.0));

        // --- СТЪПКА 2: Частично плащане (80 лв) ---
        // Според водопада: Първо покриваме Ремонт (100 лв дълг).
        // Значи всичките 80 лв отиват за Ремонт.

        CashDepositRequest req1 = new CashDepositRequest(new BigDecimal("80.00"), null, "Partial Pay");

        mockMvc.perform(post("/api/units/" + unit.getId() + "/payments/cash")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        // Проверка: Балансът е -70.00 (150 - 80)
        mockMvc.perform(get("/api/units/" + unit.getId() + "/balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(-70.0));

        // --- СТЪПКА 3: Доплащане и Преплащане (100 лв) ---
        // Остават: 20 лв за Ремонт + 50 лв за Вход = 70 лв дълг.
        // Плащаме 100 лв.
        // Разпределение: 20 (Ремонт) + 50 (Вход) + 30 (General).

        CashDepositRequest req2 = new CashDepositRequest(new BigDecimal("100.00"), null, "Full Pay + Bonus");

        mockMvc.perform(post("/api/units/" + unit.getId() + "/payments/cash")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk());

        // Проверка: Балансът трябва да е +30.00
        mockMvc.perform(get("/api/units/" + unit.getId() + "/balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(30.0));

        // --- СТЪПКА 4: Проверка на Dashboard Summary ---
        // Мениджърът отваря таблото. Трябва да види събраните пари.
        // Общо събрани: 180 лв.
        // В касата: 180 лв.

        mockMvc.perform(get("/api/buildings/" + building.getId() + "/finance/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cashOnHands").value(180.0))
                .andExpect(jsonPath("$.repairFund.income").value(100.0)) // 80 + 20
                .andExpect(jsonPath("$.maintenanceFund.income").value(80.0)); // 50 (maint) + 30 (general/bonus)
    }
}