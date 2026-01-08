package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.Transaction;
import com.smartentrance.backend.model.enums.FundType;
import com.smartentrance.backend.model.enums.TransactionStatus;
import com.smartentrance.backend.model.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.unit.id = :unitId AND t.status = com.smartentrance.backend.model.enums.TransactionStatus.CONFIRMED")
    BigDecimal calculateConfirmedBalance(@Param("unitId") Long unitId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.unit.id = :unitId " +
            "AND t.responsibleUser.id = :userId " +
            "AND t.status = com.smartentrance.backend.model.enums.TransactionStatus.CONFIRMED")
    BigDecimal calculateUserBalance(@Param("unitId") Long unitId, @Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.unit.building.id = :buildingId " +
            "AND (:type IS NULL OR t.type = :type) " +
            "AND (:status IS NULL OR t.status = :status) " +
            "ORDER BY t.createdAt DESC")
    List<Transaction> searchTransactions(
            @Param("buildingId") Integer buildingId,
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status
    );

    List<Transaction> findAllByUnitIdOrderByCreatedAtDesc(Long unitId);
    List<Transaction> findAllByUnitIdAndTypeOrderByCreatedAtDesc(Long unitId, TransactionType type);

    List<Transaction> findAllByUnitIdAndResponsibleUserIdOrderByCreatedAtDesc(Long unit_id, Long responsibleUser_id);
    List<Transaction> findAllByUnitIdAndTypeAndResponsibleUserIdOrderByCreatedAtDesc(Long unit_id, TransactionType type, Long responsibleUser_id);


    @Query("SELECT ts.fundType, SUM(ts.amount) " +
            "FROM TransactionSplit ts " +
            "JOIN ts.transaction t " +
            "WHERE t.unit.building.id = :buildingId " +
            "AND t.status = 'CONFIRMED' " +
            "GROUP BY ts.fundType")
    List<Object[]> sumIncomeByFundFromSplits(@Param("buildingId") Integer buildingId);

    @Query("SELECT t.paymentMethod, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.unit.building.id = :buildingId " +
            "AND t.status = 'CONFIRMED' " +
            "GROUP BY t.paymentMethod")
    List<Object[]> sumIncomeByMethod(@Param("buildingId") Integer buildingId);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
            "WHERE t.unit.id = :unitId " +
            "AND t.fundType = :fundType " +
            "AND t.type = 'FEE' " +
            "AND t.status = 'CONFIRMED'")
    BigDecimal sumFeesByUnitAndFund(@Param("unitId") Long unitId,
                                    @Param("fundType") FundType fundType);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
            "WHERE t.unit.id = :unitId " +
            "AND t.responsibleUser.id = :userId " +
            "AND t.fundType = :fundType " +
            "AND t.type = 'FEE' " +
            "AND t.status = 'CONFIRMED'")
    BigDecimal sumFeesByUserAndFund(@Param("unitId") Long unitId,
                                    @Param("userId") Long userId,
                                    @Param("fundType") FundType fundType);

    @Query("SELECT SUM(ts.amount) FROM TransactionSplit ts " +
            "JOIN ts.transaction t " +
            "WHERE t.unit.id = :unitId " +
            "AND ts.fundType = :fundType " +
            "AND t.status = 'CONFIRMED'")
    BigDecimal sumSplitsByUnitAndFund(@Param("unitId") Long unitId,
                                      @Param("fundType") FundType fundType);

    @Query("SELECT SUM(ts.amount) FROM TransactionSplit ts " +
            "JOIN ts.transaction t " +
            "WHERE t.unit.id = :unitId " +
            "AND t.responsibleUser.id = :userId " +
            "AND ts.fundType = :fundType " +
            "AND t.status = 'CONFIRMED'")
    BigDecimal sumSplitsByUserAndFund(@Param("unitId") Long unitId,
                                      @Param("userId") Long userId,
                                      @Param("fundType") FundType fundType);


    boolean existsByUnitIdAndStatus(Long unitId, TransactionStatus status);

    Optional<Transaction> findByReferenceId(String referenceId);

    Optional<Transaction> findByProofUrl(String url);
}