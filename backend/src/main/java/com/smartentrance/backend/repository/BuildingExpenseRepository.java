package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.BuildingExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BuildingExpenseRepository extends JpaRepository<BuildingExpense, Long> {

    @Query("SELECT e.fundType, SUM(e.amount) " +
            "FROM BuildingExpense e " +
            "WHERE e.building.id = :buildingId " +
            "GROUP BY e.fundType")
    List<Object[]> sumExpensesByFund(@Param("buildingId") Integer buildingId);

    @Query("SELECT e.paymentMethod, SUM(e.amount) " +
            "FROM BuildingExpense e " +
            "WHERE e.building.id = :buildingId " +
            "GROUP BY e.paymentMethod")
    List<Object[]> sumExpensesByMethod(@Param("buildingId") Integer buildingId);

    List<BuildingExpense> findAllByBuildingIdOrderByExpenseDateDesc(Integer buildingId);
}