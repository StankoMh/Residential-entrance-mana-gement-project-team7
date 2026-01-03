import { useState, useEffect } from "react";
import { useSelection } from "../contexts/SelectionContext";
import { buildingService } from "../services/buildingService";
import { paymentService } from "../services/paymentService";
import { unitService } from "../services/unitService";
import type { Transaction } from "../types/database";
import {
  TransactionType,
  TransactionStatus,
  FundType,
} from "../types/database";
import type { BudgetData } from "../services/buildingService";
import type { UnitResponseFromAPI } from "../services/unitService";
import { Banknote, CheckCircle, Clock, DollarSign, Download, Save, XCircle, Zap } from "lucide-react";

export function PaymentsManagement() {
  const { selectedBuilding } = useSelection();
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    repairBudget: "",
    maintenanceBudget: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [triggeringFees, setTriggeringFees] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | TransactionType
  >("all");
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [units, setUnits] = useState<UnitResponseFromAPI[]>([]);
  const [cashPaymentForm, setCashPaymentForm] = useState({
    unitId: "",
    amount: "",
    fundType: "GENERAL" as FundType,
    note: "",
  });
  const [submittingCashPayment, setSubmittingCashPayment] = useState(false);

  useEffect(() => {
    if (selectedBuilding) {
      loadData();
      loadUnits();
    }
  }, [selectedBuilding, typeFilter]);

  const loadData = async () => {
    if (!selectedBuilding) return;

    try {
      setLoading(true);
      const [txData, budgetData] = await Promise.all([
        buildingService.getTransactions(
          selectedBuilding.id,
          typeFilter === "all" ? undefined : typeFilter,
          undefined,
        ),
        buildingService.getBudget(selectedBuilding.id),
      ]);
      setTransactions(txData);
      setBudget(budgetData);
      if (budgetData) {
        setBudgetForm({
          repairBudget: budgetData.repairBudget.toString(),
          maintenanceBudget:
            budgetData.maintenanceBudget.toString(),
        });
      }
    } catch (err) {
      console.error("Error loading data:", err);
      // Set default budget if loading fails
      setBudget({
        repairBudget: 0,
        maintenanceBudget: 0,
        protocolFileUrl: null,
      });
      setBudgetForm({
        repairBudget: "0",
        maintenanceBudget: "0",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!selectedBuilding) return;

    try {
      const data = await buildingService.getTransactions(
        selectedBuilding.id,
        typeFilter === "all" ? undefined : typeFilter,
        undefined,
      );
      setTransactions(data);
    } catch (err) {
      console.error("Error loading transactions:", err);
    }
  };

  const loadUnits = async () => {
    if (!selectedBuilding) return;

    try {
      const data = await unitService.getAllByBuilding(selectedBuilding.id);
      setUnits(data);
    } catch (err) {
      console.error("Error loading units:", err);
    }
  };

  const handleSaveBudget = async () => {
    if (!selectedBuilding) return;

    const repairBudget = parseFloat(budgetForm.repairBudget);
    const maintenanceBudget = parseFloat(
      budgetForm.maintenanceBudget,
    );

    if (isNaN(repairBudget) || isNaN(maintenanceBudget)) {
      alert("Моля, въведете валидни числа");
      return;
    }

    if (repairBudget < 0 || maintenanceBudget < 0) {
      alert("Бюджетът не може да бъде отрицателен");
      return;
    }

    setSavingBudget(true);

    try {
      await buildingService.updateBudget(selectedBuilding.id, {
        repairBudget,
        maintenanceBudget,
        protocolFileUrl: budget?.protocolFileUrl || null,
      });

      alert("Месечният бюджет е обновен успешно!");
      setShowBudgetForm(false);
      loadData();
    } catch (err: any) {
      console.error("Error saving budget:", err);
      alert("Грешка при запазване на бюджета");
    } finally {
      setSavingBudget(false);
    }
  };

  const handleTriggerFees = async () => {
    if (!selectedBuilding) return;

    if (
      !confirm(
        "Сигурни ли сте, че искате да генерирате месечни такси за всички апартаменти? Това обикновено се случва автоматично всеки месец.",
      )
    ) {
      return;
    }

    setTriggeringFees(true);

    try {
      const response = await buildingService.triggerMonthlyFees(
        selectedBuilding.id,
      );
      alert(
        response || "Месечните такси са генерирани успешно!",
      );
      loadTransactions();
    } catch (err: any) {
      console.error("Error triggering fees:", err);
      alert("Грешка при генериране на такси");
    } finally {
      setTriggeringFees(false);
    }
  };

  const handleApprove = async (transactionId: number) => {
    if (!confirm("Потвърдете одобрението на това плащане"))
      return;

    try {
      await paymentService.approveTransaction(transactionId);
      loadTransactions();
    } catch (err) {
      console.error("Error approving transaction:", err);
      alert("Грешка при одобрение на плащането");
    }
  };

  const handleReject = async (transactionId: number) => {
    if (
      !confirm(
        "Сигурни ли сте, че искате да отхвърлите това плащане?",
      )
    )
      return;

    try {
      await paymentService.rejectTransaction(transactionId);
      loadTransactions();
    } catch (err) {
      console.error("Error rejecting transaction:", err);
      alert("Грешка при отхвърляне на плащането");
    }
  };

  const handleCashPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;

    const unitId = parseInt(cashPaymentForm.unitId);
    const amount = parseFloat(cashPaymentForm.amount);

    if (!unitId || isNaN(unitId)) {
      alert("Моля, изберете апартамент");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Моля, въведете валидна сума");
      return;
    }

    setSubmittingCashPayment(true);

    try {
      await paymentService.createCashPayment(unitId, {
        amount,
        fundType: cashPaymentForm.fundType,
        note: cashPaymentForm.note,
      });

      alert("Плащането е регистрирано успешно!");
      setShowCashPaymentModal(false);
      setCashPaymentForm({
        unitId: "",
        amount: "",
        fundType: "GENERAL" as FundType,
        note: "",
      });
      loadTransactions();
    } catch (err: any) {
      console.error("Error creating cash payment:", err);
      alert("Грешка при регистриране на плащането");
    } finally {
      setSubmittingCashPayment(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return tx.transactionStatus === TransactionStatus.PENDING;
    if (filter === "confirmed")
      return (
        tx.transactionStatus === TransactionStatus.CONFIRMED
      );
    return true;
  });

  // Статистики
  const payments = transactions.filter(
    (tx) => tx.type === "PAYMENT",
  );
  const confirmedPayments = payments.filter(
    (p) => p.transactionStatus === TransactionStatus.CONFIRMED,
  );
  const pendingPayments = payments.filter(
    (p) => p.transactionStatus === TransactionStatus.PENDING,
  );
  const rejectedPayments = payments.filter(
    (p) => p.transactionStatus === TransactionStatus.REJECTED,
  );

  const totalConfirmed = confirmedPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const totalPending = pendingPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const totalRejected = rejectedPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  const statusConfig = {
    [TransactionStatus.CONFIRMED]: {
      label: "Потвърдено",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    [TransactionStatus.PENDING]: {
      label: "Чакащо",
      color: "bg-orange-100 text-orange-700",
      icon: Clock,
    },
    [TransactionStatus.REJECTED]: {
      label: "Отхвърлено",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  if (!selectedBuilding) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">
          Моля, изберете вход за управление на плащания
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">
          Зареждане...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">
            Управление на плащания
          </h1>
          <p className="text-gray-600">
            Преглед и одобрение на плащания
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCashPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Banknote className="w-5 h-5" />
            Регистрирай кеш плащане
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            Експорт
          </button>
        </div>
      </div>

      {/* Месечен бюджет */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Месечен бюджет</h3>
              <p className="text-sm text-gray-600">
                Настройки за автоматично генериране на такси
              </p>
            </div>
          </div>
          {!showBudgetForm && (
            <button
              onClick={() => setShowBudgetForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Редактирай
            </button>
          )}
        </div>

        {showBudgetForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Фонд Поддръжка (лв/м²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetForm.maintenanceBudget}
                  onChange={(e) =>
                    setBudgetForm((prev) => ({
                      ...prev,
                      maintenanceBudget: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Фонд Ремонти (лв/м²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetForm.repairBudget}
                  onChange={(e) =>
                    setBudgetForm((prev) => ({
                      ...prev,
                      repairBudget: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveBudget}
                disabled={savingBudget}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {savingBudget ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Запазване...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Запази
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowBudgetForm(false);
                  setBudgetForm({
                    repairBudget:
                      budget?.repairBudget.toString() || "",
                    maintenanceBudget:
                      budget?.maintenanceBudget.toString() ||
                      "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отказ
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                Фонд Поддръжка
              </div>
              <div className="text-blue-600">
                {(budget?.maintenanceBudget ?? 0).toFixed(2)}{" "}
                лв/м²
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">
                Фонд Ремонти
              </div>
              <div className="text-purple-600">
                {(budget?.repairBudget ?? 0).toFixed(2)} лв/м²
              </div>
            </div>
            <div>
              <button
                onClick={handleTriggerFees}
                disabled={triggeringFees}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 text-sm"
              >
                {triggeringFees ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Генериране...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Генерирай такси (Debug)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-3">
          💡 Месечните такси се изчисляват автоматично според
          квадратурата на всеки апартамент
        </p>
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
          <div className="text-green-600">
            {totalConfirmed.toFixed(2)} лв
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-gray-600">
              Чакащи одобрение
            </div>
          </div>
          <div className="text-gray-900 mb-1">
            {pendingPayments.length} плащания
          </div>
          <div className="text-orange-600">
            {totalPending.toFixed(2)} лв
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-gray-600">Отхвърлени</div>
          </div>
          <div className="text-gray-900 mb-1">
            {rejectedPayments.length} плащания
          </div>
          <div className="text-red-600">
            {totalRejected.toFixed(2)} лв
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
              Чакащи
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
              onClick={() =>
                setTypeFilter("PAYMENT" as TransactionType)
              }
              className={`px-4 py-2 rounded-lg transition-colors ${
                typeFilter === "PAYMENT"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Само плащания
            </button>
            <button
              onClick={() =>
                setTypeFilter("FEE" as TransactionType)
              }
              className={`px-4 py-2 rounded-lg transition-colors ${
                typeFilter === "FEE"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Само такси
            </button>
          </div>
        </div>
      </div>

      {/* Таблица с транзакции */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Описание
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Фонд
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Метод
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Сума
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-600"
                  >
                    Няма налични транзакции
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const StatusIcon =
                    statusConfig[tx.transactionStatus].icon;
                  const isPending =
                    tx.transactionStatus ===
                    TransactionStatus.PENDING;
                  const isPayment = tx.type === "PAYMENT";

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            isPayment
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isPayment ? "Плащане" : "Такса"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {tx.description ||
                          (isPayment ? "Плащане" : "Такса")}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {tx.fundType === "REPAIR"
                          ? "Ремонти"
                          : "Поддръжка"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {tx.paymentMethod === "STRIPE"
                          ? "Карта"
                          : tx.paymentMethod === "CASH"
                            ? "Кеш"
                            : tx.paymentMethod === "BANK"
                              ? "Банка"
                              : "Система"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            isPayment
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {isPayment ? "+" : "-"}
                          {Math.abs(tx.amount).toFixed(2)} лв
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm w-fit ${statusConfig[tx.transactionStatus].color}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {
                            statusConfig[tx.transactionStatus]
                              .label
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(
                          tx.createdAt,
                        ).toLocaleDateString("bg-BG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {isPending && isPayment && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleApprove(tx.id)
                              }
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Одобри
                            </button>
                            <button
                              onClick={() =>
                                handleReject(tx.id)
                              }
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              Отхвърли
                            </button>
                          </div>
                        )}
                        {tx.documentUrl && (
                          <a
                            href={tx.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Документ
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модал за кеш плащане */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center ${
          showCashPaymentModal ? "block" : "hidden"
        }`}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <h2 className="text-gray-900 text-xl font-bold mb-4">
            Добавяне на кеш плащане
          </h2>
          <form onSubmit={handleCashPaymentSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Апартамент
                </label>
                <select
                  value={cashPaymentForm.unitId}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      unitId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Изберете апартамент</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Апартамент № {unit.unitNumber}{unit.ownerInfo ? ` - ${unit.ownerInfo.firstName} ${unit.ownerInfo.lastName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Сума (лв)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashPaymentForm.amount}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Фонд
                </label>
                <select
                  value={cashPaymentForm.fundType}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      fundType: e.target.value as FundType,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GENERAL">Общ</option>
                  <option value="REPAIR">Ремонти</option>
                  <option value="MAINTENANCE">Поддръжка</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Забележка
                </label>
                <input
                  type="text"
                  value={cashPaymentForm.note}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={submittingCashPayment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {submittingCashPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Запазване...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Запази
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCashPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отказ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}