package com.smartentrance.backend.service;

import com.smartentrance.backend.dto.finance.*;
import com.smartentrance.backend.mapper.BuildingExpenseMapper;
import com.smartentrance.backend.mapper.TransactionMapper;
import com.smartentrance.backend.model.*;
import com.smartentrance.backend.model.enums.*;
import com.smartentrance.backend.repository.*;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final TransactionRepository transactionRepository;
    private final BuildingExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    private final TransactionMapper transactionMapper;
    private final BuildingExpenseMapper expenseMapper;

    private final UnitService unitService;
    private final BuildingService buildingService;
    private final PdfReceiptService pdfReceiptService;
    private final FileStorageService fileStorageService;

    @Value("${payment.currency:EUR}")
    private String currency;

    @Value("${payment.stripe.fee-percent}")
    private BigDecimal stripeFeePercent;

    @Value("${payment.stripe.fixed-fee}")
    private BigDecimal stripeFixedFee;

    @PreAuthorize("@buildingSecurity.isUnitOwner(#unitId, principal.user)")
    public String initiateStripeDeposit(Long unitId, BigDecimal amount, User user) throws StripeException {
        long amountInCents = amount.multiply(new BigDecimal(100)).longValue();
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency)
                .setDescription("Deposit Unit " + unitId)
                .putMetadata("unit_id", unitId.toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .build();
        return PaymentIntent.create(params).getClientSecret();
    }

    @Transactional
    public void recordStripeSuccess(Long unitId, BigDecimal amount, String stripeId, String receiptUrl) {
        if (transactionRepository.findByReferenceId(stripeId).isPresent()) return;

        createPaymentTransaction(unitId, amount, PaymentMethod.STRIPE, null,
                "Stripe Deposit", stripeId, receiptUrl, null);

        recordStripeFeeAsExpense(unitId, amount, stripeId);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.canManageUnit(#unitId, principal.user)")
    public void recordCashDeposit(Long unitId, BigDecimal amount, FundType fund, String note, User principal) {
        createPaymentTransaction(unitId, amount, PaymentMethod.CASH, fund, note, null, null, principal);
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.isUnitOwner(#unitId, principal.user)")
    public void submitBankTransfer(Long unitId, BigDecimal amount, String reference, String userUploadedFile) {
        createBaseTransaction(unitId, amount, TransactionType.PAYMENT, PaymentMethod.BANK_TRANSFER,
                FundType.GENERAL, "Bank Transfer (Pending)", reference, userUploadedFile, TransactionStatus.PENDING);
    }

    @Transactional
    public void approveTransaction(Long transactionId, User manager) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        if (t.getStatus() == TransactionStatus.CONFIRMED) return;

        applyWaterfallLogic(t);

        t.setStatus(TransactionStatus.CONFIRMED);
        transactionRepository.save(t);

        generateAndAttachPdf(t, manager);
    }

    @Transactional
    public void rejectTransaction(Long transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));
        transactionRepository.delete(t);
    }

    private void createPaymentTransaction(Long unitId, BigDecimal amount, PaymentMethod method,
                                          FundType targetFund, String desc, String refId,
                                          String proofUrl, User issuer) {

        Transaction t = createBaseTransaction(unitId, amount, TransactionType.PAYMENT, method,
                FundType.GENERAL, desc, refId, proofUrl, TransactionStatus.CONFIRMED);

        if (targetFund != null) {
            t.addSplit(targetFund, amount);
        } else {
            applyWaterfallLogic(t);
        }

        transactionRepository.save(t);
        generateAndAttachPdf(t, issuer);
    }

    private void applyWaterfallLogic(Transaction t) {
        BigDecimal remainingMoney = t.getAmount();
        Long unitId = t.getUnit().getId();

        BigDecimal repairDebt = getFundDebt(unitId, FundType.REPAIR);
        if (remainingMoney.compareTo(BigDecimal.ZERO) > 0 && repairDebt.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal toPay = remainingMoney.min(repairDebt);
            t.addSplit(FundType.REPAIR, toPay);
            remainingMoney = remainingMoney.subtract(toPay);
        }

        BigDecimal maintDebt = getFundDebt(unitId, FundType.MAINTENANCE);
        if (remainingMoney.compareTo(BigDecimal.ZERO) > 0 && maintDebt.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal toPay = remainingMoney.min(maintDebt);
            t.addSplit(FundType.MAINTENANCE, toPay);
            remainingMoney = remainingMoney.subtract(toPay);
        }

        if (remainingMoney.compareTo(BigDecimal.ZERO) > 0) {
            t.addSplit(FundType.GENERAL, remainingMoney);
        }
    }

    @Transactional
    @PreAuthorize("@buildingSecurity.isManager(#buildingId, principal.user)")
    public void createExpense(Integer buildingId, CreateExpenseRequest req, User manager) {
        Building building = buildingService.findById(buildingId)
                .orElseThrow(() -> new EntityNotFoundException("Building not found"));

        BuildingExpense expense = new BuildingExpense();
        expense.setBuilding(building);
        expense.setAmount(req.amount());
        expense.setDescription(req.description());
        expense.setFundType(req.fundType());
        expense.setDocumentUrl(req.documentUrl());
        expense.setExpenseDate(Instant.now());
        expense.setCreatedBy(manager);
        expense.setPaymentMethod(req.paymentMethod());

        expenseRepository.save(expense);
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processMonthlyFeesForBuilding(Building building, String month) {
        if (building.getRepairBudget() == null || building.getMaintenanceBudget() == null) return;
        List<Unit> units = unitService.findAllByBuildingId(building.getId())
                .stream().filter(Unit::isVerified).toList();
        if (units.isEmpty()) return;

        BigDecimal totalArea = units.stream().map(Unit::getArea).reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalResidents = units.stream().mapToInt(u -> u.getResidentsCount() != null ? u.getResidentsCount() : 0).sum();

        for (Unit unit : units) {
            try {
                if (totalArea.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal myShareRatio = unit.getArea().divide(totalArea, 4, RoundingMode.HALF_UP);
                    BigDecimal myRepairFee = building.getRepairBudget().multiply(myShareRatio);
                    chargeFeeInternal(unit, myRepairFee, FundType.REPAIR, "Monthly Repair " + month);
                }
                if (totalResidents > 0 && unit.getResidentsCount() > 0) {
                    BigDecimal pricePerPerson = building.getMaintenanceBudget().divide(new BigDecimal(totalResidents), 2, RoundingMode.HALF_UP);
                    BigDecimal myMaintenanceFee = pricePerPerson.multiply(new BigDecimal(unit.getResidentsCount()));
                    chargeFeeInternal(unit, myMaintenanceFee, FundType.MAINTENANCE, "Monthly Maint " + month);
                }
            } catch (Exception e) {
                System.out.println("Error fee unit " + unit.getId() + ": " + e.getMessage());
            }
        }
    }

    @Transactional
    public void createExtraordinaryExpense(Integer buildingId, BigDecimal totalAmount,
                                           String description, FundType fundType,
                                           SplitMethod splitMethod) {
        List<Unit> units = unitService.findAllByBuildingId(buildingId);
        BigDecimal totalDivisor = BigDecimal.ZERO;

        if (splitMethod == SplitMethod.BY_AREA) {
            totalDivisor = units.stream().map(Unit::getArea).reduce(BigDecimal.ZERO, BigDecimal::add);
        } else if (splitMethod == SplitMethod.BY_OCCUPANT) {
            totalDivisor = BigDecimal.valueOf(units.stream().mapToInt(u -> u.getResidentsCount() == null ? 0 : u.getResidentsCount()).sum());
        } else {
            totalDivisor = BigDecimal.valueOf(units.size());
        }

        if (totalDivisor.compareTo(BigDecimal.ZERO) == 0) return;

        for (Unit unit : units) {
            BigDecimal share = BigDecimal.ZERO;
            if (splitMethod == SplitMethod.BY_AREA) {
                share = unit.getArea().divide(totalDivisor, 4, RoundingMode.HALF_UP).multiply(totalAmount);
            } else if (splitMethod == SplitMethod.BY_OCCUPANT) {
                share = BigDecimal.valueOf(unit.getResidentsCount() == null ? 0 : unit.getResidentsCount())
                        .divide(totalDivisor, 4, RoundingMode.HALF_UP).multiply(totalAmount);
            } else {
                share = totalAmount.divide(totalDivisor, 2, RoundingMode.HALF_UP);
            }
            chargeFeeInternal(unit, share, fundType, "EXTRA: " + description);
        }
    }

    public FinancialSummary getBuildingFinancialSummary(Integer buildingId) {
        List<Object[]> incomeByFund = transactionRepository.sumIncomeByFundFromSplits(buildingId);
        List<Object[]> expenseByFund = expenseRepository.sumExpensesByFund(buildingId);
        List<Object[]> incomeByMethod = transactionRepository.sumIncomeByMethod(buildingId);
        List<Object[]> expenseByMethod = expenseRepository.sumExpensesByMethod(buildingId);

        BigDecimal repairIncome = getSumFromList(incomeByFund, FundType.REPAIR.name());
        BigDecimal repairExpense = getSumFromList(expenseByFund, FundType.REPAIR.name());
        FinancialSummary.FundBreakdown repairBreakdown = new FinancialSummary.FundBreakdown(
                repairIncome, repairExpense, repairIncome.subtract(repairExpense));

        BigDecimal maintIncome = getSumFromList(incomeByFund, FundType.MAINTENANCE.name())
                .add(getSumFromList(incomeByFund, FundType.GENERAL.name()));
        BigDecimal maintExpense = getSumFromList(expenseByFund, FundType.MAINTENANCE.name())
                .add(getSumFromList(expenseByFund, FundType.GENERAL.name()));
        FinancialSummary.FundBreakdown maintBreakdown = new FinancialSummary.FundBreakdown(
                maintIncome, maintExpense, maintIncome.subtract(maintExpense));

        BigDecimal cashIn = getSumFromList(incomeByMethod, PaymentMethod.CASH.name());
        BigDecimal cashOut = getSumFromList(expenseByMethod, PaymentMethod.CASH.name());
        BigDecimal cashOnHand = cashIn.subtract(cashOut);

        BigDecimal stripeIn = getSumFromList(incomeByMethod, PaymentMethod.STRIPE.name());
        BigDecimal bankIn = getSumFromList(incomeByMethod, PaymentMethod.BANK_TRANSFER.name());
        BigDecimal totalBankIn = stripeIn.add(bankIn);
        BigDecimal bankOut = getSumFromList(expenseByMethod, PaymentMethod.BANK_TRANSFER.name());
        BigDecimal bankAccount = totalBankIn.subtract(bankOut);

        BigDecimal totalBalance = repairBreakdown.balance().add(maintBreakdown.balance());
        return new FinancialSummary(totalBalance, repairBreakdown, maintBreakdown, cashOnHand, bankAccount);
    }

    @PreAuthorize("@buildingSecurity.canAccessUnitFinance(#unitId, principal.user)")
    public BigDecimal getBalance(Long unitId) { return transactionRepository.calculateConfirmedBalance(unitId); }

    @Transactional(readOnly = true)
    public boolean hasPendingPayments(Long unitId) {
        return transactionRepository.existsByUnitIdAndStatus(unitId, TransactionStatus.PENDING);
    }

    public List<TransactionResponse> getBuildingTransactions(Integer bId, TransactionType type, TransactionStatus status) {
        return transactionRepository.searchTransactions(bId, type, status).stream().map(transactionMapper::toResponse).toList();
    }

    public List<TransactionResponse> getTransactionHistory(Long unitId, TransactionType type) {
        List<Transaction> transactions = (type != null)
                ? transactionRepository.findAllByUnitIdAndTypeOrderByCreatedAtDesc(unitId, type)
                : transactionRepository.findAllByUnitIdOrderByCreatedAtDesc(unitId);
        return transactions.stream().map(transactionMapper::toResponse).toList();
    }

    @PreAuthorize("@buildingSecurity.hasAccess(#buildingId, principal.user)")
    public List<BuildingExpenseResponse> getBuildingExpenses(Integer bId) {
        return expenseRepository.findAllByBuildingIdOrderByExpenseDateDesc(bId).stream().map(expenseMapper::toResponse).toList();
    }


    private Transaction createBaseTransaction(Long unitId, BigDecimal amount, TransactionType type, PaymentMethod method,
                                              FundType fund, String desc, String refId, String externalProof, TransactionStatus status) {
        Unit unit = unitService.findById(unitId).orElseThrow();
        Transaction t = new Transaction();
        t.setUnit(unit);
        t.setAmount(amount);
        t.setType(type);
        t.setPaymentMethod(method);
        t.setDescription(desc);
        t.setFundType(fund);
        t.setReferenceId(refId);
        t.setExternalProofUrl(externalProof);
        t.setStatus(status);
        t.setCreatedAt(Instant.now());
        return transactionRepository.save(t);
    }

    private void chargeFeeInternal(Unit unit, BigDecimal amount, FundType fundType, String description) {
        BigDecimal negativeAmount = amount.abs().negate();
        createBaseTransaction(unit.getId(), negativeAmount, TransactionType.FEE, PaymentMethod.SYSTEM,
                fundType, description, null, null, TransactionStatus.CONFIRMED);
    }

    private void recordStripeFeeAsExpense(Long unitId, BigDecimal amount, String stripeId) {
        Unit unit = unitService.findById(unitId).orElseThrow();
        BigDecimal feeAmount = amount.multiply(stripeFeePercent).add(stripeFixedFee).setScale(2, RoundingMode.HALF_UP);
        BuildingExpense feeExpense = new BuildingExpense();
        feeExpense.setBuilding(unit.getBuilding());
        feeExpense.setAmount(feeAmount);
        feeExpense.setDescription("Stripe Fee (Tx: " + stripeId + ")");
        feeExpense.setFundType(FundType.GENERAL);
        feeExpense.setExpenseDate(Instant.now());
        feeExpense.setPaymentMethod(PaymentMethod.SYSTEM);
        expenseRepository.save(feeExpense);
    }

    private void generateAndAttachPdf(Transaction transaction, User issuer) {
        try {
            byte[] pdfBytes = pdfReceiptService.generateReceipt(transaction, issuer);
            String fileName = "receipt_" + transaction.getId() + "_" + System.currentTimeMillis() + ".pdf";
            fileStorageService.storeFile(pdfBytes, fileName);
            transaction.setProofUrl(fileName);
            transactionRepository.save(transaction);
        } catch (Exception e) {
            System.err.println("FAILED TO GENERATE PDF: " + e.getMessage());
        }
    }

    private BigDecimal getFundDebt(Long unitId, FundType fundType) {
        BigDecimal totalFees = transactionRepository.sumFeesByUnitAndFund(unitId, fundType);
        if (totalFees == null) totalFees = BigDecimal.ZERO;
        BigDecimal totalPaid = transactionRepository.sumSplitsByUnitAndFund(unitId, fundType);
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;
        BigDecimal netBalance = totalFees.add(totalPaid);
        return netBalance.compareTo(BigDecimal.ZERO) < 0 ? netBalance.abs() : BigDecimal.ZERO;
    }

    private BigDecimal getSumFromList(List<Object[]> list, String keyName) {
        if (list == null || list.isEmpty()) return BigDecimal.ZERO;
        for (Object[] row : list) {
            if (row[0].toString().equals(keyName)) return (BigDecimal) row[1];
        }
        return BigDecimal.ZERO;
    }

    @Transactional
    public void createSystemNote(Long unitId, String description, String fileUrl) {
        createBaseTransaction(
                unitId,
                BigDecimal.ZERO,
                TransactionType.PAYMENT,
                PaymentMethod.SYSTEM,
                FundType.GENERAL,
                description,
                null,
                fileUrl,
                TransactionStatus.CONFIRMED
        );
    }

    @Transactional
    public void clearUnitBalance(Long unitId) {
        BigDecimal currentBalance = transactionRepository.calculateConfirmedBalance(unitId);

        if (currentBalance == null || currentBalance.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        BigDecimal adjustment = currentBalance.negate();

        if (adjustment.compareTo(BigDecimal.ZERO) > 0) {
            createPaymentTransaction(
                    unitId,
                    adjustment,
                    PaymentMethod.SYSTEM,
                    null,
                    "Ownership Transfer: Debt Write-off",
                    null,
                    null,
                    null
            );
        } else {
            createBaseTransaction(
                    unitId,
                    adjustment,
                    TransactionType.PAYMENT,
                    PaymentMethod.CASH,
                    FundType.GENERAL,
                    "Ownership Transfer: Refund",
                    null,
                    null,
                    TransactionStatus.CONFIRMED
            );
        }
    }

    public enum SplitMethod { BY_AREA, BY_OCCUPANT, EQUAL_PER_UNIT }
}