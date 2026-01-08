import { Receipt, CheckCircle, AlertCircle, Clock, FileText, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { useSelection } from '../contexts/SelectionContext';
import type { Transaction } from '../types/database';
import { TransactionStatus, PaymentMethod } from '../types/database';

interface PaymentsPanelProps {
  expanded?: boolean;
}

export function PaymentsPanel({ expanded = false }: PaymentsPanelProps) {
  const navigate = useNavigate();
  const { selectedUnit } = useSelection();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedUnit) {
      loadData();
    }
  }, [selectedUnit]);

  const loadData = async () => {
    if (!selectedUnit) return;
    
    try {
      setLoading(true);
      const [txData, balanceData] = await Promise.all([
        paymentService.getUnitTransactions(selectedUnit.unitId),
        paymentService.getUnitBalance(selectedUnit.unitId)
      ]);
      console.log('PaymentsPanel - Loaded transactions:', txData);
      setTransactions(txData.slice(0, 3)); // Показваме само последните 3
      setBalance(balanceData);
    } catch (err) {
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank');
  };

  if (!selectedUnit) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Receipt className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-900">Плащания</h3>
            <p className="text-sm text-gray-600">Баланс: {balance.toFixed(2)} EUR</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard/payments')}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Всички →
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm py-4 text-center">Зареждане...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-600 text-sm py-4 text-center">Няма транзакции</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isPayment = tx.type === 'PAYMENT';
            const isConfirmed = tx.transactionStatus === TransactionStatus.CONFIRMED;
            const isPending = tx.transactionStatus === TransactionStatus.PENDING;
            const isBankPayment = tx.paymentMethod === PaymentMethod.BANK_TRANSFER || tx.paymentMethod === PaymentMethod.BANK;
            const showDocument = (tx.documentUrl && isConfirmed) || (tx.externalDocumentUrl && isPending && isBankPayment);
            const documentUrl = tx.externalDocumentUrl || tx.documentUrl;
            
            console.log(`Transaction ${tx.id}:`, {
              type: tx.type,
              status: tx.transactionStatus,
              paymentMethod: tx.paymentMethod,
              documentUrl: tx.documentUrl,
              externalDocumentUrl: tx.externalDocumentUrl,
              isBankPayment,
              showDocument,
              finalUrl: documentUrl
            });

            return (
              <div key={tx.id} className="py-2 border-b last:border-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 text-sm">
                        {isPayment ? 'Плащане' : 'Такса'}
                      </span>
                      {/* Показваме статус икони само за плащания, не за такси */}
                      {isPayment && isConfirmed && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {isPayment && isPending && <Clock className="w-4 h-4 text-orange-500" />}
                    </div>
                    <p className="text-gray-600 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                  <span className={`${isPayment ? 'text-green-600' : 'text-red-600'}`}>
                    {isPayment ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} EUR
                  </span>
                </div>
                {/* Бутон за документ */}
                {showDocument && documentUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadDocument(documentUrl);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    <Download className="w-3 h-3" />
                    {isPending && isBankPayment ? 'Платежно' : 'Разписка'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {balance < 0 && (
        <button
          onClick={() => navigate('/payment/checkout')}
          className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Платете сега
        </button>
      )}
    </div>
  );
}