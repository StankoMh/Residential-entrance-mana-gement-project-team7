import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  XCircle,
  Banknote,
  Receipt,
  FileText,
  DollarSign,
  ExternalLink,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  FundType,
  PaymentMethod,
} from "../types/database";
import {
  BuildingExpense,
  BudgetData,
  FinancialSummary,
  CreateExpenseRequest,
} from "../services/buildingService";
import { UnitResponseFromAPI } from "../services/unitService";
import { buildingService } from "../services/buildingService";
import { paymentService } from "../services/paymentService";
import { unitService } from "../services/unitService";
import { useSelection } from "../contexts/SelectionContext";
import { CashPaymentModal } from "./CashPaymentModal";
import { ExpenseModal } from "./ExpenseModal";
import { BudgetModal } from "./BudgetModal";
import { toast } from "sonner";

// Тип за обединени транзакции и разходи
type CombinedItem = {
  id: number;
  type: "transaction" | "expense";
  transactionType?: TransactionType;
  description: string;
  fundType: FundType | string; // Приема и enum и string literals
  amount: number;
  transactionStatus?: TransactionStatus;
  paymentMethod?: PaymentMethod | string; // Приема всички PaymentMethod стойности
  createdAt: string;
  documentUrl?: string | null;
  externalDocumentUrl?: string | null;
  expenseDate?: string;
  createdBy?: string;
  unitId?: number;
  unitNumber?: number;
};

export function PaymentsManagement() {
  const { selectedBuilding } = useSelection();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<BuildingExpense[]>([]);
  const [units, setUnits] = useState<UnitResponseFromAPI[]>([]);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType | "expense">("all");

  useEffect(() => {
    if (selectedBuilding) {
      loadAllData();
    }
  }, [selectedBuilding, typeFilter]);

  const loadAllData = async () => {
    if (!selectedBuilding) return;

    try {
      setLoading(true);
      const [txData, expensesData, unitsData, budgetData, financialSummaryData] = await Promise.all([
        buildingService.getTransactions(
          selectedBuilding.id,
          typeFilter === "all" || typeFilter === "expense" ? undefined : typeFilter,
          undefined
        ),
        buildingService.getExpenses(selectedBuilding.id),
        unitService.getAllByBuilding(selectedBuilding.id),
        buildingService.getBudget(selectedBuilding.id),
        buildingService.getFinancialSummary(selectedBuilding.id),
      ]);

      setTransactions(txData);
      setExpenses(expensesData);
      setUnits(unitsData);
      setBudget(budgetData);
      setFinancialSummary(financialSummaryData);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Грешка при зареждане на данните");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId: number) => {
    if (!confirm("Потвърдете одобрението на това плащане")) return;

    try {
      await paymentService.approveTransaction(transactionId);
      toast.success("Плащането е одобрено успешно");
      loadAllData();
    } catch (err) {
      console.error("Error approving transaction:", err);
      toast.error("Грешка при одобрение на плащането");
    }
  };

  const handleReject = async (transactionId: number) => {
    if (!confirm("Сигурни ли сте, че искате да отхвърлите това плащане?"))
      return;

    try {
      await paymentService.rejectTransaction(transactionId);
      toast.success("Плащането е отхвърлено");
      loadAllData();
    } catch (err) {
      console.error("Error rejecting transaction:", err);
      toast.error("Грешка при отхвърляне на плащането");
    }
  };

  const handleCashPaymentSubmit = async (data: {
    unitId: number;
    amount: number;
    fundType: FundType;
    note: string;
  }) => {
    try {
      await paymentService.createCashPayment(data.unitId, {
        amount: data.amount,
        fundType: data.fundType,
        note: data.note,
      });
      toast.success("Плащането е регистрирано успешно");
      loadAllData();
    } catch (err) {
      console.error("Error creating cash payment:", err);
      toast.error("Грешка при регистриране на плащането");
      throw err;
    }
  };

  const handleExpenseSubmit = async (data: CreateExpenseRequest) => {
    if (!selectedBuilding) return;

    try {
      await buildingService.createExpense(selectedBuilding.id, data);
      toast.success("Разходът е регистриран успешно");
      loadAllData();
    } catch (err) {
      console.error("Error creating expense:", err);
      toast.error("Грешка при регистриране на разхода");
      throw err;
    }
  };

  const handleBudgetSubmit = async (data: {
    maintenanceBudget: number;
    repairBudget: number;
  }) => {
    if (!selectedBuilding) return;

    try {
      await buildingService.updateBudget(selectedBuilding.id, {
        maintenanceBudget: data.maintenanceBudget,
        repairBudget: data.repairBudget,
        protocolFileUrl: budget?.protocolFileUrl || null,
      });
      toast.success("Месечният бюджет е обновен успешно");
      loadAllData();
    } catch (err) {
      console.error("Error updating budget:", err);
      toast.error("Грешка при актуализиране на бюджета");
      throw err;
    }
  };

  const handleGenerateFees = async () => {
    if (!selectedBuilding) return;
    if (!confirm("Сигурни ли сте, че искате да генерирате месечни такси за всички апартаменти?")) return;

    try {
      await buildingService.triggerMonthlyFees(selectedBuilding.id);
      toast.success("Месечните такси са генерирани успешно");
      loadAllData();
    } catch (err) {
      console.error("Error generating fees:", err);
      toast.error("Грешка при генериране на таксите");
    }
  };

  if (!selectedBuilding) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">
          Моля, изберете вход за преглед на плащанията
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане...</p>
      </div>
    );
  }

  // Комбинирай транзакции и разходи (без Stripe Fee)
  const combinedItems: CombinedItem[] = [
    ...transactions
      .filter((tx) => !(tx.type === TransactionType.FEE && tx.description.includes("Stripe Fee")))
      .map((tx) => ({
        id: tx.id,
        type: "transaction" as const,
        transactionType: tx.type,
        description: tx.description,
        fundType: tx.fundType,
        amount: tx.amount,
        transactionStatus: tx.transactionStatus,
        paymentMethod: tx.paymentMethod,
        createdAt: tx.createdAt,
        documentUrl: tx.documentUrl,
        externalDocumentUrl: tx.externalDocumentUrl,
        unitId: tx.unitId,
        unitNumber: tx.unitNumber,
      })),
    ...expenses.map((exp) => ({
      id: exp.id,
      type: "expense" as const,
      description: exp.description,
      fundType: exp.fundType,
      amount: exp.amount,
      createdAt: exp.expenseDate,
      documentUrl: exp.documentUrl,
      expenseDate: exp.expenseDate,
      createdBy: exp.createdBy,
    })),
  ];

  // Сортирай по дата
  combinedItems.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Филтрирай по статус и тип
  const filteredItems = combinedItems.filter((item) => {
    // Разходите са имплицитно потвърдени и се показват при "all", "confirmed" и "expense"
    if (item.type === "expense") {
      // При филтър "pending" не показвай разходи
      if (filter === "pending") return false;
      // При typeFilter проверяваме дали показваме разходи
      return typeFilter === "all" || typeFilter === "expense";
    }
    
    // За транзакции проверяваме типа
    if (typeFilter === "expense") return false; // Не показвай транзакции при филтър "Разходи"
    if (typeFilter !== "all" && item.transactionType !== typeFilter) return false;
    
    // За транзакции проверяваме статуса
    if (!item.transactionStatus) return false;

    // Филтър по статус (pending/confirmed/all)
    if (filter === "pending")
      return item.transactionStatus === TransactionStatus.PENDING;
    if (filter === "confirmed")
      return item.transactionStatus === TransactionStatus.CONFIRMED;
    return true;
  });

  // Статистики
  const transactionItems = filteredItems.filter((i) => i.type === "transaction");
  
  // Статистики независими от филтрите - броят всички от оригиналните данни
  const confirmedPayments = transactions.filter(
    (tx) => tx.transactionStatus === TransactionStatus.CONFIRMED && tx.type === TransactionType.PAYMENT
  );
  const pendingPayments = transactions.filter(
    (tx) => tx.transactionStatus === TransactionStatus.PENDING && tx.type === TransactionType.PAYMENT
  );
  const expenseItems = expenses; // Всички разходи

  // Статистики по фондове от API (Real-time данни от backend)
  const maintenanceIncome = financialSummary?.maintenanceFund.income ?? 0;
  const maintenanceExpenses = financialSummary?.maintenanceFund.expense ?? 0;
  const maintenanceBalance = financialSummary?.maintenanceFund.balance ?? 0;

  const repairIncome = financialSummary?.repairFund.income ?? 0;
  const repairExpenses = financialSummary?.repairFund.expense ?? 0;
  const repairBalance = financialSummary?.repairFund.balance ?? 0;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Управление на плащания</h1>
            <p className="text-gray-600">
              Преглед и одобрение на плащания и разходи
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCashPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Banknote className="w-5 h-5" />
              Кеш плащане
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Разход
            </button>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Бюджет
            </button>
            <button
              onClick={() => handleGenerateFees()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Clock className="w-5 h-5" />
              Генерирай такси
            </button>
            <button 
              onClick={() => navigate('/admin/dashboard/finances')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Графики
            </button>
          </div>
        </div>

        {/* Месечен бюджет */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8" />
                <h2 className="text-white text-2xl">Месечен бюджет</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="text-blue-100 text-sm mb-1">
                    Фонд Поддръжка
                  </div>
                  <div className="text-3xl font-bold">
                    {(budget?.maintenanceBudget ?? 0).toFixed(2)} EUR
                  </div>
                </div>
                <div>
                  <div className="text-purple-100 text-sm mb-1">
                    Фонд Ремонти
                  </div>
                  <div className="text-3xl font-bold">
                    {(budget?.repairBudget ?? 0).toFixed(2)} EUR
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Receipt className="w-16 h-16" />
            </div>
          </div>
        </div>

        {/* Статистики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-gray-600">Потвърдени</div>
            </div>
            <div className="text-gray-900 mb-1">
              {confirmedPayments.length} плащания
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-gray-600">Чакащи одобрение</div>
            </div>
            <div className="text-gray-900 mb-1">
              {pendingPayments.length} плащания
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-gray-600">Разходи</div>
            </div>
            <div className="text-gray-900 mb-1">
              {expenseItems.length} разхода
            </div>
          </div>
        </div>

        {/* Статистики по фондове */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-gray-900 font-medium">Фонд Поддръжка</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Постъпления:</span>
                <span className="text-green-600 font-medium">+{maintenanceIncome.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Разходи:</span>
                <span className="text-red-600 font-medium">-{maintenanceExpenses.toFixed(2)} EUR</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Баланс:</span>
                  <span className={`font-bold text-lg ${maintenanceBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {maintenanceBalance >= 0 ? '+' : ''}{maintenanceBalance.toFixed(2)} EUR
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-gray-900 font-medium">Фонд Ремонти</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Постъпления:</span>
                <span className="text-green-600 font-medium">+{repairIncome.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Разходи:</span>
                <span className="text-red-600 font-medium">-{repairExpenses.toFixed(2)} EUR</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Баланс:</span>
                  <span className={`font-bold text-lg ${repairBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {repairBalance >= 0 ? '+' : ''}{repairBalance.toFixed(2)} EUR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Филтри */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Всички
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "pending"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                За одобрение {pendingPayments.length > 0 && `(${pendingPayments.length})`}
              </button>
              <button
                onClick={() => setFilter("confirmed")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "confirmed"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Потвърдени
              </button>
            </div>

            <div className="border-l border-gray-300 mx-2"></div>

            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  typeFilter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Всички типове
              </button>
              <button
                onClick={() => setTypeFilter("PAYMENT" as TransactionType)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  typeFilter === "PAYMENT"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Плащания
              </button>
              <button
                onClick={() => setTypeFilter("FEE" as TransactionType)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  typeFilter === "FEE"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Такси
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  typeFilter === "expense"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Разходи
              </button>
            </div>
          </div>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Тип</th>
                  <th className="px-6 py-3 text-left text-gray-700">Описание</th>
                  <th className="px-6 py-3 text-center text-gray-700">Апартамент</th>
                  <th className="px-6 py-3 text-left text-gray-700">Фонд</th>
                  <th className="px-6 py-3 text-left text-gray-700">Метод</th>
                  <th className="px-6 py-3 text-left text-gray-700">Сума</th>
                  <th className="px-6 py-3 text-left text-gray-700">Статус</th>
                  <th className="px-6 py-3 text-left text-gray-700">Дата</th>
                  <th className="px-6 py-3 text-left text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-600"
                    >
                      Няма налични транзакции
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    if (item.type === "transaction" && item.transactionStatus) {
                      const StatusIcon =
                        item.transactionStatus === TransactionStatus.CONFIRMED
                          ? CheckCircle
                          : item.transactionStatus === TransactionStatus.PENDING
                          ? Clock
                          : XCircle;

                      const statusColor =
                        item.transactionStatus === TransactionStatus.CONFIRMED
                          ? "text-green-700 bg-green-100"
                          : item.transactionStatus === TransactionStatus.PENDING
                          ? "text-orange-700 bg-orange-100"
                          : "text-red-700 bg-red-100";

                      const statusText =
                        item.transactionStatus === TransactionStatus.CONFIRMED
                          ? "Потвърдено"
                          : item.transactionStatus === TransactionStatus.PENDING
                          ? "За одобрение"
                          : "Отхвърлено";

                      const isPending =
                        item.transactionStatus === TransactionStatus.PENDING;
                      const isConfirmed =
                        item.transactionStatus === TransactionStatus.CONFIRMED;

                      // Type badge - само 2 цвята
                      const typeBadge =
                        item.transactionType === TransactionType.FEE ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            Такса
                          </span>
                        ) : item.transactionType === TransactionType.PAYMENT ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Плащане
                          </span>
                        ) : null;

                      // Fund badge - само 2 цвята
                      const fundBadge =
                        item.fundType === FundType.REPAIR || item.fundType === 'REPAIR' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Ремонти
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Поддръжка
                          </span>
                        );

                      // Payment method text
                      let paymentMethodText = "";
                      if (item.paymentMethod === PaymentMethod.CASH || item.paymentMethod === "CASH") {
                        paymentMethodText = "Кеш";
                      } else if (item.paymentMethod === PaymentMethod.STRIPE || item.paymentMethod === "STRIPE") {
                        paymentMethodText = "Stripe";
                      } else if (item.paymentMethod === PaymentMethod.SYSTEM || item.paymentMethod === "SYSTEM") {
                        paymentMethodText = "Система";
                      } else if (item.paymentMethod === PaymentMethod.BANK || item.paymentMethod === PaymentMethod.BANK_TRANSFER || item.paymentMethod === "BANK" || item.paymentMethod === "BANK_TRANSFER") {
                        paymentMethodText = "Банков превод";
                      } else {
                        paymentMethodText = "-";
                      }

                      // За PENDING показваме само качения от потребителя документ (externalDocumentUrl)
                      const showPendingDocument = isPending && item.externalDocumentUrl;
                      // За CONFIRMED показваме г��нерираната разписка (documentUrl)
                      const showConfirmedDocument = isConfirmed && item.documentUrl;
                      // За CONFIRMED + Stripe показваме и Stripe receipt линк
                      const showStripeReceipt = isConfirmed && item.externalDocumentUrl && 
                        (item.paymentMethod === PaymentMethod.STRIPE || item.paymentMethod === "STRIPE");

                      // Проверка дали е плащане (постъпване на пари)
                      const isPayment = item.transactionType === TransactionType.PAYMENT;

                      return (
                        <tr key={`tx-${item.id}`} className={isPayment ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4">{typeBadge}</td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900">{item.description}</div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">
                            {item.unitNumber ? `${item.unitNumber}` : '-'}
                          </td>
                          <td className="px-6 py-4">{fundBadge}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-sm">
                                {paymentMethodText}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium">
                              {item.amount.toFixed(2)} EUR
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(item.createdAt).toLocaleDateString("bg-BG")}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApprove(item.id)}
                                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors font-medium"
                                  >
                                    Одобри
                                  </button>
                                  <button
                                    onClick={() => handleReject(item.id)}
                                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors font-medium"
                                  >
                                    Отхвърли
                                  </button>
                                </>
                              )}
                              {showPendingDocument && (
                                <a
                                  href={item.externalDocumentUrl!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Документ
                                </a>
                              )}
                              {showConfirmedDocument && (
                                <a
                                  href={item.documentUrl!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Документ
                                </a>
                              )}
                              {showStripeReceipt && (
                                <a
                                  href={item.externalDocumentUrl!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Stripe
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    } else if (item.type === "expense") {
                      const fundBadge =
                        item.fundType === FundType.REPAIR || item.fundType === 'REPAIR' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Ремонти
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Поддръжка
                          </span>
                        );

                      // Payment method text за разходи
                      let expensePaymentMethodText = "-";
                      if (item.paymentMethod === PaymentMethod.CASH || item.paymentMethod === "CASH") {
                        expensePaymentMethodText = "Кеш";
                      } else if (item.paymentMethod === PaymentMethod.BANK || item.paymentMethod === PaymentMethod.BANK_TRANSFER || item.paymentMethod === "BANK" || item.paymentMethod === "BANK_TRANSFER") {
                        expensePaymentMethodText = "Банков превод";
                      } else if (item.paymentMethod === PaymentMethod.SYSTEM || item.paymentMethod === "SYSTEM") {
                        expensePaymentMethodText = "Система";
                      }

                      return (
                        <tr
                          key={`expense-${item.id}`}
                          className="hover:bg-gray-50 bg-red-50/30"
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Разход
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900">{item.description}</div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">
                            {item.unitNumber ? `${item.unitNumber}` : '-'}
                          </td>
                          <td className="px-6 py-4">{fundBadge}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-sm">
                                {expensePaymentMethodText}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-red-700 font-medium">
                              -{item.amount.toFixed(2)} EUR
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              Потвърдено
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(item.createdAt).toLocaleDateString("bg-BG")}
                          </td>
                          <td className="px-6 py-4">
                            {item.documentUrl && (
                              <a
                                href={item.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Документ
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модали */}
      <CashPaymentModal
        isOpen={showCashPaymentModal}
        onClose={() => setShowCashPaymentModal(false)}
        onSubmit={handleCashPaymentSubmit}
        units={units}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleExpenseSubmit}
      />

      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        budget={budget}
        onSubmit={handleBudgetSubmit}
      />
    </>
  );
}