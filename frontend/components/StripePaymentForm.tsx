import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../config/stripe';
import { paymentService } from '../services/paymentService';
import { Lock, AlertCircle } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  unitId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ 
  amount, 
  unitId, 
  onSuccess, 
  onCancel 
}: { 
  amount: number; 
  unitId: number;
  onSuccess: () => void; 
  onCancel: () => void 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe все още се зарежда. Моля, опитайте отново.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Потвърждаване на плащането чрез Stripe без редирект
      // Backend автоматично ще обнови транзакцията чрез webhook при успешно плащане
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      console.log('Stripe confirmPayment result:', result);

      if (result.error) {
        // По-добри съобщения за грешки
        let errorMessage = result.error.message || 'Грешка при обработка на плащането';
        
        console.error('Stripe error:', result.error);
        
        // Специфични съобщения за често срещани грешки
        if (result.error.type === 'card_error') {
          switch (result.error.code) {
            case 'card_declined':
              errorMessage = 'Картата беше отхвърлена. Моля, опитайте с друга карта.';
              break;
            case 'insufficient_funds':
              errorMessage = 'Недостатъчно средства по картата.';
              break;
            case 'incorrect_cvc':
              errorMessage = 'Невалиден CVC код.';
              break;
            case 'expired_card':
              errorMessage = 'Картата е изтекла.';
              break;
            case 'processing_error':
              errorMessage = 'Възникна грешка при обработка. Моля, опитайте отново.';
              break;
          }
        } else if (result.error.type === 'validation_error') {
          errorMessage = 'Моля, попълнете всички задължителни полета правилно.';
        }
        
        setError(errorMessage);
        setProcessing(false);
        return;
      }

      // Проверка дали плащането е успешно
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', result.paymentIntent);
        // Успешно плащане - backend ще обнови транзакцията автоматично чрез webhook
        onSuccess();
      } else {
        console.log('Payment not succeeded. Status:', result.paymentIntent?.status);
        setError('Плащането не бе завършено успешно. Моля, опитайте отново.');
        setProcessing(false);
      }
    } catch (err: any) {
      console.error('Exception during payment:', err);
      setError(err.message || 'Грешка при обработка на плащането');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-blue-800 text-sm flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Плащане на {amount.toFixed(2)} EUR чрез Stripe
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div className="border border-gray-300 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Съобщение за грешка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      {/* Бутони */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Обработка...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Платете {amount.toFixed(2)} EUR
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Отказ
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Защитено плащане чрез Stripe. Данните на вашата карта са напълно криптирани.
        </p>
      </div>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, amount, unitId, onSuccess, onCancel }: StripePaymentFormProps) {
  const [stripePromise] = useState(() => getStripe());

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-gray-900 mb-6">Данни за плащане</h2>
      
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm amount={amount} unitId={unitId} onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
}