import { Receipt, CheckCircle, AlertCircle, Clock, Filter, Download, ChevronDown, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { useSelection } from '../contexts/SelectionContext';
import type { Transaction } from '../types/database';
import { TransactionStatus, TransactionType, FundType, PaymentMethod } from '../types/database';

export function PaymentsPage() {
  const navigate = useNavigate();
  const { selectedUnit } = useSelection();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

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
      console.log('Loaded transactions:', txData);
      setTransactions(txData);
      setBalance(balanceData);
    } catch (err) {
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFundName = (fundType: FundType) => {
    if (fundType === FundType.MAINTENANCE || fundType === FundType.GENERAL) {
      return 'Фонд Поддръжка';
    }
    return 'Фонд Ремонти';
  };

  const handlePayClick = () => {
    // Navigate to payment checkout page
    navigate('/payment/checkout');
  };

  const handleDownloadReceipt = async (transactionId: number, documentUrl?: string) => {
    try {
      // Ако има директно documentUrl, използваме го
      if (documentUrl) {
        window.open(documentUrl, '_blank');
        return;
      }
      
      // Иначе опитваме да го вземем от receipt details (за стари версии)
      const details = await paymentService.getReceiptDetails(transactionId);
      if (details.documentUrl) {
        window.open(details.documentUrl, '_blank');
      }
    } catch (err) {
      console.error('Error downloading receipt:', err);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tx.transactionStatus === TransactionStatus.PENDING;
    if (filter === 'confirmed') return tx.transactionStatus === TransactionStatus.CONFIRMED;
    return true;
  });

  // Статистики
  const payments = transactions.filter(tx => tx.type === TransactionType.PAYMENT);
  const fees = transactions.filter(tx => tx.type === TransactionType.FEE);
  
  const totalPaid = payments
    .filter(p => p.transactionStatus === TransactionStatus.CONFIRMED)
    .reduce((sum, p) => sum + p.amount, 0);
    
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const pendingPayments = payments.filter(p => p.transactionStatus === TransactionStatus.PENDING).length;

  // Групиране по фонд
  const maintenanceTransactions = transactions.filter(
    t => t.fundType === FundType.MAINTENANCE || t.fundType === FundType.GENERAL
  );
  const repairTransactions = transactions.filter(t => t.fundType === FundType.REPAIR);
  
  const maintenancePaid = maintenanceTransactions
    .filter(t => t.type === TransactionType.PAYMENT && t.transactionStatus === TransactionStatus.CONFIRMED)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const repairPaid = repairTransactions
    .filter(t => t.type === TransactionType.PAYMENT && t.transactionStatus === TransactionStatus.CONFIRMED)
    .reduce((sum, t) => sum + t.amount, 0);

  if (!selectedUnit) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Моля, изберете апартамент за да видите плащания</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане на плащания...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Плащания</h1>
        <p className="text-gray-600">Преглед на всички такси и плащания</p>
      </div>

      {/* Статистик */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">{balance.toFixed(2)} EUR</div>
          <div className="text-gray-600 text-sm mb-1">Текущ баланс</div>
          <div className="text-gray-500 text-xs">
            {balance < 0 ? 'Дължима сума' : 'Предплатена сума'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">{totalPaid.toFixed(2)} EUR</div>
          <div className="text-gray-600 text-sm mb-1">Потвърдени плащания</div>
          <div className="text-gray-500 text-xs">
            {payments.filter(p => p.transactionStatus === TransactionStatus.CONFIRMED).length} плащания
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">{pendingPayments}</div>
          <div className="text-gray-600 text-sm mb-1">Чакащи одобрение</div>
          <div className="text-gray-500 text-xs">Плащания</div>
        </div>
      </div>

      {/* Бутон за плащане */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 mb-1">Извърши плащане</h3>
            <p className="text-gray-600 text-sm">Платете дължими такси или направете депозит</p>
          </div>
          <button
            onClick={handlePayClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Добави средства
          </button>
        </div>
      </div>

      {/* Филтри */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Всички
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Чакащи
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'confirmed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Потвърдени
          </button>
        </div>
      </div>

      {/* Списък с транзакции */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              Няма налични транзакции
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isPayment = tx.type === TransactionType.PAYMENT;
              const isConfirmed = tx.transactionStatus === TransactionStatus.CONFIRMED;
              const isPending = tx.transactionStatus === TransactionStatus.PENDING;
              const isRejected = tx.transactionStatus === TransactionStatus.REJECTED;
              
              // Backend връща 'BANK_TRANSFER', не 'BANK'
              const isBankPayment = tx.paymentMethod === PaymentMethod.BANK_TRANSFER || tx.paymentMethod === PaymentMethod.BANK;
              const showDocument = (tx.documentUrl && isConfirmed) || (tx.externalDocumentUrl && isPending && isBankPayment);
              const documentUrl = tx.externalDocumentUrl || tx.documentUrl;

              console.log(`PaymentsPage - Transaction ${tx.id}:`, {
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
                <div key={tx.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-900">
                          {isPayment ? 'Плащане' : 'Такса'} - {getFundName(tx.fundType)}
                        </h3>
                        {isConfirmed && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {isPending && (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                        {isRejected && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {tx.description || (isPayment ? 'Плащане по сметка' : 'Месечна такса')}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          {new Date(tx.createdAt).toLocaleDateString('bg-BG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        {/* Показваме статус само за плащания, не за такси */}
                        {isPayment && (
                          <span className={`${
                            isConfirmed ? 'text-green-600' :
                            isPending ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {isConfirmed ? 'Потвърдено' :
                             isPending ? 'Чака одобрение' :
                             'Отхвърлено'}
                          </span>
                        )}
                        {tx.paymentMethod && tx.paymentMethod !== 'SYSTEM' && (
                          <span className="text-gray-500">
                            {tx.paymentMethod === 'STRIPE' ? 'Карта' :
                             tx.paymentMethod === 'CASH' ? 'Кеш' :
                             tx.paymentMethod === 'BANK' ? 'Банка' : tx.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl mb-2 ${
                        isPayment ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPayment ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} EUR
                      </div>
                      {/* Показваме документ за банкови плащания (pending с externalDocumentUrl) или разписка за потвърдени (documentUrl) */}
                      {showDocument && (
                        <button
                          onClick={() => handleDownloadReceipt(tx.id, documentUrl || undefined)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-4 h-4" />
                          {isPending && isBankPayment ? 'Платежно' : 'Разписка'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}