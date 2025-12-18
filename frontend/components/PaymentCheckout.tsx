import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft, Calendar, User } from 'lucide-react';
import type { UnitFeeWithDetails } from '../types/database';

export function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const fee = location.state?.fee as UnitFeeWithDetails | undefined;

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Ако няма fee данни, връщаме към dashboard
  if (!fee) {
    navigate('/dashboard/payments');
    return null;
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    }

    if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.replace(/\D/g, '').length > 4) return;
    }

    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 3) return;
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: ''
    };

    let isValid = true;

    // Валидация на номер на картата
    const cardDigits = formData.cardNumber.replace(/\s/g, '');
    if (!cardDigits) {
      newErrors.cardNumber = 'Моля, въведете номер на картата';
      isValid = false;
    } else if (cardDigits.length !== 16) {
      newErrors.cardNumber = 'Номерът трябва да съдържа 16 цифри';
      isValid = false;
    }

    // Валидация на име на картодържателя
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Моля, въведете име на картодържателя';
      isValid = false;
    } else if (formData.cardHolder.trim().length < 3) {
      newErrors.cardHolder = 'Името трябва да съдържа поне 3 символа';
      isValid = false;
    }

    // Валидация на срок на валидност
    const expiryDigits = formData.expiryDate.replace(/\D/g, '');
    if (!expiryDigits) {
      newErrors.expiryDate = 'Моля, въведете срок на валидност';
      isValid = false;
    } else if (expiryDigits.length !== 4) {
      newErrors.expiryDate = 'Формат: MM/YY';
      isValid = false;
    } else {
      const month = parseInt(expiryDigits.slice(0, 2));
      const year = parseInt('20' + expiryDigits.slice(2, 4));
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Невалиден месец';
        isValid = false;
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = 'Картата е изтекла';
        isValid = false;
      }
    }

    // Валидация на CVV
    if (!formData.cvv) {
      newErrors.cvv = 'Моля, въведете CVV код';
      isValid = false;
    } else if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV трябва да съдържа 3 цифри';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Симулация на плащане (тук ще се добави интеграция с backend)
    setTimeout(() => {
      setIsProcessing(false);
      alert('Плащането е успешно! (Демо режим)');
      navigate('/dashboard/payments');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/payments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад към плащания
          </button>
          <h1 className="text-gray-900 mb-2">Плащане на такса</h1>
          <p className="text-gray-600">Попълнете данните за вашата карта</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Форма за плащане */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-gray-900">Данни на картата</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Номер на картата */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Номер на картата *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.cardNumber
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Име на картодържателя */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Име на картодържателя *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cardHolder}
                      onChange={(e) => handleInputChange('cardHolder', e.target.value.toUpperCase())}
                      placeholder="IVAN PETROV"
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 uppercase ${
                        errors.cardHolder
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.cardHolder && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
                  )}
                </div>

                {/* Срок на валидност и CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Срок на валидност *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.expiryDate
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      CVV *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.cvv
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Бутон за плащане */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Плати {fee.amount.toFixed(2)} лв
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Плащането е защитено със SSL криптиране
                </p>
              </form>
            </div>
          </div>

          {/* Обобщение на поръчката */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-gray-900 mb-4">Обобщение</h3>
              
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Такса:</span>
                  <span>
                    {fee.fundType === 'MAINTENANCE' ? 'Фонд Поддръжка' : 'Фонд Ремонти'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Период:</span>
                  <span>
                    {new Date(fee.month).toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Падеж:</span>
                  <span>{new Date(fee.dueTo).toLocaleDateString('bg-BG')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900">Обща сума:</span>
                <span className="text-blue-600">{fee.amount.toFixed(2)} лв</span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Сигурно плащане
                </p>
                <p className="text-green-700 text-xs mt-1">
                  Данните на вашата карта са напълно защитени
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
