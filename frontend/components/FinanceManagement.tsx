import { useState, useEffect } from "react";
import { useSelection } from "../contexts/SelectionContext";
import { buildingService, type FinancialSummary } from "../services/buildingService";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Banknote,
  DollarSign,
  PieChart,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function FinanceManagement() {
  const { selectedBuilding, selectedUnit } = useSelection();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Получи building ID - от selectedBuilding или от selectedUnit
  const buildingId = selectedBuilding?.id || selectedUnit?.buildingId;

  useEffect(() => {
    if (buildingId) {
      loadFinancialSummary();
    }
  }, [buildingId]);

  const loadFinancialSummary = async () => {
    if (!buildingId) return;

    try {
      setLoading(true);
      const data = await buildingService.getFinancialSummary(buildingId);
      setSummary(data);
    } catch (err) {
      console.error("Error loading financial summary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!buildingId) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">
          Моля, изберете вход/апартамент за преглед на финансите
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

  if (!summary) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">
          Няма налична финансова информация
        </p>
      </div>
    );
  }

  // Данни за pie chart - разпределение на фондовете
  const fundDistribution = [
    {
      name: "Фонд Ремонти",
      value: summary.repairFund.balance,
      color: "#8b5cf6",
    },
    {
      name: "Фонд Поддръжка",
      value: summary.maintenanceFund.balance,
      color: "#3b82f6",
    },
  ];

  // Данни за bar chart - приходи vs разходи
  const incomeExpenseData = [
    {
      name: "Ремонти",
      Приходи: summary.repairFund.income,
      Разходи: summary.repairFund.expense,
    },
    {
      name: "Поддръжка",
      Приходи: summary.maintenanceFund.income,
      Разходи: summary.maintenanceFund.expense,
    },
  ];

  // Данни за pie chart - кеш vs банка
  const cashBankData = [
    {
      name: "Кеш",
      value: summary.cashOnHands,
      color: "#10b981",
    },
    {
      name: "Банкови сметки",
      value: summary.bankAccounts,
      color: "#6366f1",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Финансово управление</h1>
        <p className="text-gray-600">
          Детайлен преглед на финансовото състояние на входа
        </p>
      </div>

      {/* Общ баланс - Hero секция */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8" />
              <h2 className="text-white text-2xl">Общ баланс</h2>
            </div>
            <div className="text-5xl font-bold mb-2">
              {summary.totalBalance.toFixed(2)} EUR
            </div>
            <p className="text-blue-100">
              Сума на всички налични средства в входа
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <Wallet className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Статистики карти */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Фонд Ремонти */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 text-2xl mb-1">
            {summary.repairFund.balance.toFixed(2)} EUR
          </div>
          <div className="text-gray-600 text-sm mb-3">Фонд Ремонти</div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600">
              ↑ {summary.repairFund.income.toFixed(2)} EUR
            </span>
            <span className="text-red-600">
              ↓ {summary.repairFund.expense.toFixed(2)} EUR
            </span>
          </div>
        </div>

        {/* Фонд Поддръжка */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 text-2xl mb-1">
            {summary.maintenanceFund.balance.toFixed(2)} EUR
          </div>
          <div className="text-gray-600 text-sm mb-3">Фонд Поддръжка</div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600">
              ↑ {summary.maintenanceFund.income.toFixed(2)} EUR
            </span>
            <span className="text-red-600">
              ↓ {summary.maintenanceFund.expense.toFixed(2)} EUR
            </span>
          </div>
        </div>

        {/* Кеш в ръка */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 text-2xl mb-1">
            {summary.cashOnHands.toFixed(2)} EUR
          </div>
          <div className="text-gray-600 text-sm mb-3">Кеш в ръка</div>
          <div className="text-xs text-gray-500">
            {((summary.cashOnHands / summary.totalBalance) * 100).toFixed(1)}% от
            общия баланс
          </div>
        </div>

        {/* Банкови сметки */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 text-2xl mb-1">
            {summary.bankAccounts.toFixed(2)} EUR
          </div>
          <div className="text-gray-600 text-sm mb-3">Банкови сметки</div>
          <div className="text-xs text-gray-500">
            {((summary.bankAccounts / summary.totalBalance) * 100).toFixed(1)}% от
            общия баланс
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Приходи vs Разходи */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Приходи vs Разходи</h3>
              <p className="text-sm text-gray-600">По тип фонд</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Приходи" fill="#10b981" />
              <Bar dataKey="Разходи" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Разпределение на фондовете */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Разпределение на фондовете</h3>
              <p className="text-sm text-gray-600">Баланс по тип</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={fundDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {fundDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Кеш vs Банка */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Средства</h3>
              <p className="text-sm text-gray-600">Кеш vs Банка</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={cashBankData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cashBankData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Детайлна таблица */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Детайлна разбивка</h3>
              <p className="text-sm text-gray-600">Всички фондове</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Фонд Ремонти */}
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="text-sm text-gray-600 mb-1">Фонд Ремонти</div>
              <div className="text-purple-600 text-xl mb-2">
                {summary.repairFund.balance.toFixed(2)} EUR
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Приходи:</span>
                  <span className="text-green-600 ml-2">
                    +{summary.repairFund.income.toFixed(2)} EUR
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Разходи:</span>
                  <span className="text-red-600 ml-2">
                    -{summary.repairFund.expense.toFixed(2)} EUR
                  </span>
                </div>
              </div>
            </div>

            {/* Фонд Поддръжка */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="text-sm text-gray-600 mb-1">Фонд Поддръжка</div>
              <div className="text-blue-600 text-xl mb-2">
                {summary.maintenanceFund.balance.toFixed(2)} EUR
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Приходи:</span>
                  <span className="text-green-600 ml-2">
                    +{summary.maintenanceFund.income.toFixed(2)} EUR
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Разходи:</span>
                  <span className="text-red-600 ml-2">
                    -{summary.maintenanceFund.expense.toFixed(2)} EUR
                  </span>
                </div>
              </div>
            </div>

            {/* Дивидер */}
            <hr className="my-4" />

            {/* Средства */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="text-sm text-gray-600 mb-1">Средства</div>
              <div className="text-green-600 text-xl mb-2">
                {summary.totalBalance.toFixed(2)} EUR
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Кеш:</span>
                  <span className="text-green-600 ml-2">
                    {summary.cashOnHands.toFixed(2)} EUR
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Банка:</span>
                  <span className="text-indigo-600 ml-2">
                    {summary.bankAccounts.toFixed(2)} EUR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Информационни бележки 
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-blue-600 mt-0.5">ℹ️</div>
          <div className="text-sm text-gray-700">
            <p className="mb-2">
              <strong>Общ баланс</strong> показва сумата на всички средства в
              Фонд Ремонти и Фонд Поддръжка.
            </p>
            <p className="mb-2">
              <strong>Средства</strong> показва как тези средства са
              разпределени между кеш в ръка и банкови сметки.
            </p>
            <p>
              <strong>Приходи</strong> включват всички плащания от жители, докато{" "}
              <strong>Разходи</strong> включват всички регистрирани разходи за
              входа.
            </p>
          </div>
        </div>
      </div>
      */}
    </div>
  );
}