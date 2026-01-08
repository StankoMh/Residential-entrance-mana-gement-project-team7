import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    maintenanceBudget: number;
    repairBudget: number;
  }) => Promise<void>;
  budget: {
    maintenanceBudget: number;
    repairBudget: number;
  } | null;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  budget,
}: BudgetModalProps) {
  const [form, setForm] = useState({
    maintenanceBudget: "",
    repairBudget: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Актуализирай формата когато се зареди budget
  useEffect(() => {
    if (budget) {
      setForm({
        maintenanceBudget: budget.maintenanceBudget?.toString() ?? "0",
        repairBudget: budget.repairBudget?.toString() ?? "0",
      });
    }
  }, [budget]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const maintenanceBudget = parseFloat(form.maintenanceBudget);
    const repairBudget = parseFloat(form.repairBudget);

    if (isNaN(maintenanceBudget) || isNaN(repairBudget)) {
      alert("Моля, въведете валидни числа");
      return;
    }

    if (maintenanceBudget < 0 || repairBudget < 0) {
      alert("Бюджетът не може да бъде отрицателен");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        maintenanceBudget,
        repairBudget,
      });
      onClose();
    } catch (err) {
      console.error("Error submitting budget:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-gray-900 text-xl">Редактирай месечен бюджет</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Фонд Поддръжка (EUR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.maintenanceBudget}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maintenanceBudget: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Месечна такса за общи разходи и поддръжка
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Фонд Ремонти (EUR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.repairBudget}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, repairBudget: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Месечна такса за ремонти и подобрения
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {submitting ? "Запазване..." : "Запази бюджет"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}