import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft, Banknote, Building2, Upload, FileText, X } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useSelection } from '../contexts/SelectionContext';
import { FundType } from '../types/database';
import { StripePaymentForm } from './StripePaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY || '');

type PaymentMethod = 'stripe' | 'cash' | 'bank';

export function PaymentCheckout() {
  const navigate = useNavigate();
  const { selectedUnit } = useSelection();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [amount, setAmount] = useState('');
  const [fundType, setFundType] = useState<FundType>(FundType.GENERAL);
  const [note, setNote] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);

  if (!selectedUnit) {
    navigate('/dashboard/payments');
    return null;
  }

  const handleStripePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Моля, въведете валидна сума');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Създаване на Stripe Payment Intent
      const { clientSecret } = await paymentService.createStripePayment(
        selectedUnit.unitId,
        parseFloat(amount)
      );

      setStripeClientSecret(clientSecret);
      setShowStripeForm(true);
      setIsProcessing(false);
      
    } catch (err: any) {
      setError(err.message || 'Грешка при създаване на плащане');
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = () => {
    alert('Плащането е успешно обработено! ✓');
    navigate('/dashboard/payments');
  };

  const handleStripeCancel = () => {
    setShowStripeForm(false);
    setStripeClientSecret(null);
    setIsProcessing(false);
  };

  const handleCashPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Моля, въведете валидна сума');
      return;
    }

    if (!note.trim()) {
      setError('Моля, добавете бележка за плащането');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await paymentService.createCashPayment(selectedUnit.unitId, {
        amount: parseFloat(amount),
        fundType,
        note
      });

      setIsProcessing(false);
      alert('Кеш плащането е регистрирано и чака одобрение от мениджъра');
      navigate('/dashboard/payments');
      
    } catch (err: any) {
      setError(err.message || 'Грешка при регистриране на плащане');
      setIsProcessing(false);
    }
  };

  const handleBankPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Моля, въведете валидна сума');
      return;
    }

    if (!bankProofFile) {
      setError('Моля, качете PDF файл с платежното нареждане');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('Creating bank payment with file:', bankProofFile.name);
      
      // Метод 1: Опитваме да изпратим файла директно към /units/${unitId}/payments/bank
      try {
        await paymentService.createBankPaymentWithFile(
          selectedUnit.unitId,
          parseFloat(amount),
          bankReference,
          bankProofFile
        );
        console.log('Bank payment created successfully (direct file upload)');
      } catch (directError: any) {
        console.warn('Direct file upload failed, trying two-step approach:', directError);
        
        // Метод 2: Ако не работи, качваме файла първо и после изпращаме URL-a
        const proofUrl = await paymentService.uploadPaymentProof(bankProofFile);
        console.log('Proof file uploaded successfully. URL:', proofUrl);
        
        await paymentService.createBankPayment(selectedUnit.unitId, {
          amount: parseFloat(amount),
          transactionReference: bankReference,
          proofUrl: proofUrl
        });
        console.log('Bank payment created successfully (two-step approach)');
      }

      setIsProcessing(false);
      alert('Банковото плащане е регистрирано и чака одобрение от мениджъра');
      navigate('/dashboard/payments');
      
    } catch (err: any) {
      console.error('Error creating bank payment:', err);
      setError(err.message || 'Грешка при регистриране на плащане');
      setIsProcessing(false);
    }
  };

  const handleBankProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Проверка дали файлът е PDF
      if (file.type !== 'application/pdf') {
        setError('Моля, изберете само PDF файл');
        e.target.value = ''; // Изчистваме избора
        return;
      }
      
      setBankProofFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'stripe') {
      await handleStripePayment();
    } else if (paymentMethod === 'cash') {
      await handleCashPayment();
    } else if (paymentMethod === 'bank') {
      await handleBankPayment();
    }
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
          <h1 className="text-gray-900 mb-2">Добавяне на средства</h1>
          <p className="text-gray-600">Изберете метод на плащане и въведете сума</p>
        </div>

        {/* Stripe Form Overlay */}
        {showStripeForm && stripeClientSecret && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-4 py-8">
              <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                <StripePaymentForm
                  clientSecret={stripeClientSecret}
                  amount={parseFloat(amount)}
                  unitId={selectedUnit.unitId}
                  onSuccess={handleStripeSuccess}
                  onCancel={handleStripeCancel}
                />
              </Elements>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Форма за плащане */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-6">Детайли на плащането</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Метод на плащане */}
                <div>
                  <label className="block text-gray-700 mb-3">
                    Метод на плащане *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'stripe'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === 'stripe' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className="text-sm text-gray-700">Карта</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className="text-sm text-gray-700">Банка</p>
                    </button>
                  </div>
                </div>

                {/* Сума */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Сума *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">EUR</span>
                  </div>
                </div>

                {/* Допълнителна информация според метода */}
                {paymentMethod === 'stripe' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <Lock className="w-4 h-4 inline mr-1" />
                      След натискане на бутона ще бъдете пренасочени към защитена страница за въвеждане на данни на картата
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    {/* Upload на PDF файл с платежното */}
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Платежно нареждане (PDF) *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          onChange={handleBankProofFileChange}
                          className="hidden"
                          id="bank-proof-upload"
                          accept=".pdf,application/pdf"
                        />
                        <label htmlFor="bank-proof-upload" className="cursor-pointer">
                          {bankProofFile ? (
                            <div className="flex items-center justify-center gap-3">
                              <FileText className="w-8 h-8 text-red-500" />
                              <div className="text-left">
                                <p className="text-gray-900">{bankProofFile.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(bankProofFile.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setBankProofFile(null);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <X className="w-5 h-5 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 mb-1">
                                Кликнете за избор на PDF файл
                              </p>
                              <p className="text-gray-400 text-sm">
                                Качете скан или снимка на платежното нареждане
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Плащането ще чака одобрение от мениджъра след преглед на документа
                      </p>
                    </div>
                  </div>
                )}

                {/* Съобщение за грешка */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

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
                      {paymentMethod === 'stripe' && <CreditCard className="w-5 h-5" />}
                      {paymentMethod === 'cash' && <Banknote className="w-5 h-5" />}
                      {paymentMethod === 'bank' && <Building2 className="w-5 h-5" />}
                      {paymentMethod === 'stripe' ? 'Продължи към плащане' : 'Регистрирай плащане'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Обобщение */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-gray-900 mb-4">Обобщение</h3>
              
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Апартамент:</span>
                  <span>№ {selectedUnit.unitNumber}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Вход:</span>
                  <span className="text-right text-sm">{selectedUnit.buildingName}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Метод:</span>
                  <span>
                    {paymentMethod === 'stripe' ? 'Карта' : 'Банков превод'}
                  </span>
                </div>
                {paymentMethod === 'bank' && bankProofFile && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    <span className="text-gray-600 text-sm">Платежно нареждане:</span>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate">{bankProofFile.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900">Сума:</span>
                <span className="text-blue-600">
                  {amount ? parseFloat(amount).toFixed(2) : '0.00'} EUR
                </span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Сигурно плащане
                </p>
                <p className="text-green-700 text-xs mt-1">
                  {paymentMethod === 'stripe' 
                    ? 'Данните на вашата карта са напълно защитени'
                    : 'Плащането ще бъде потвърдено от мениджъра'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}