import { useState } from "react";
import type { FundType } from "../types/database";
import type { UnitResponseFromAPI } from "../services/unitService";
import { X } from "lucide-react";

interface CashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    unitId: number;
    amount: number;
    fundType: FundType;
    note: string;
  }) => Promise<void>;
  units: UnitResponseFromAPI[];
}

export function CashPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  units,
}: CashPaymentModalProps) {
  const [form, setForm] = useState({
    unitId: "",
    amount: "",
    fundType: "GENERAL" as FundType,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const unitId = parseInt(form.unitId);
    const amount = parseFloat(form.amount);

    if (!unitId || isNaN(unitId)) {
      alert("Моля, изберете апартамент");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Моля, въведете валидна сума");
      return;
    }

    if (!form.note.trim()) {
      alert("Моля, въведете описание");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        unitId,
        amount,
        fundType: form.fundType,
        note: form.note,
      });

      // Reset form
      setForm({
        unitId: "",
        amount: "",
        fundType: "GENERAL" as FundType,
        note: "",
      });
      onClose();
    } catch (err) {
      console.error("Error submitting cash payment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-gray-900 text-xl">Регистрирай кеш плащане</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Апартамент <span className="text-red-500">*</span>
              </label>
              <select
                value={form.unitId}
                onChange={(e) => setForm((prev) => ({ ...prev, unitId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Изберете апартамент</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    Апартамент № {unit.unitNumber}
                    {unit.ownerInfo
                      ? ` - ${unit.ownerInfo.firstName} ${unit.ownerInfo.lastName}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Сума (EUR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Фонд</label>
              <select
                value={form.fundType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fundType: e.target.value as FundType,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GENERAL">Поддръжка</option>
                <option value="REPAIR">Ремонти</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Описание <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Кратко описание..."
                required
              />
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? "Запазване..." : "Регистрирай плащане"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}