import { useState } from "react";
import { X, Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { uploadService } from "../services/uploadService";
import { toast } from "sonner";
import { CreateExpenseRequest } from "../services/buildingService";
import { PaymentMethod } from "../types/database";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
}: ExpenseModalProps) {
  const [form, setForm] = useState({
    amount: "",
    description: "",
    fundType: "GENERAL" as "REPAIR" | "GENERAL",
    paymentMethod: PaymentMethod.BANK_TRANSFER,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadService.uploadFile(file);
      setDocumentUrl(response.url);
      setUploadedFileName(file.name);
      toast.success("Файлът беше успешно качен!");
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error("Грешка при качване на файла!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setDocumentUrl("");
    setUploadedFileName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Моля, въведете валидна сума");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Моля, въведете описание");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        amount,
        description: form.description,
        fundType: form.fundType,
        documentUrl: documentUrl,
        paymentMethod: form.paymentMethod,
      });

      // Reset form
      setForm({
        amount: "",
        description: "",
        fundType: "GENERAL" as "REPAIR" | "GENERAL",
        paymentMethod: PaymentMethod.BANK_TRANSFER,
      });
      setDocumentUrl("");
      setUploadedFileName("");
      onClose();
      toast.success("Разходът беше успешно регистриран!");
    } catch (err) {
      console.error("Error submitting expense:", err);
      toast.error("Грешка при регистриране на разход!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-gray-900 text-xl">Регистрирай разход</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Описание <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Опишете разхода..."
                required
              />
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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
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
                    fundType: e.target.value as "REPAIR" | "GENERAL",
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GENERAL">Поддръжка</option>
                <option value="REPAIR">Ремонти</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Метод на плащане</label>
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as PaymentMethod,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={PaymentMethod.BANK_TRANSFER}>Банков превод</option>
                <option value={PaymentMethod.CASH}>Кеш</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Качване на документ (опционално)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="document-upload"
                  disabled={uploading}
                />
                
                {!uploadedFileName ? (
                  <label
                    htmlFor="document-upload"
                    className={`w-full border-2 border-dashed border-blue-400 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-3" />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    )}
                    <p className="text-gray-700 mb-1">
                      {uploading ? 'Качване...' : 'Кликнете за избор на PDF файл'}
                    </p>
                    <p className="text-sm text-gray-500">Само PDF документи</p>
                  </label>
                ) : (
                  <div className="w-full border-2 border-green-400 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{uploadedFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              💡 Разходът ще бъде видим за всички жители и ще се отрази във финансовите отчети.
            </p>
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
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? "Запазване..." : "Регистрирай разход"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}