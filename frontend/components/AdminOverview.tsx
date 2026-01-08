import { Users, DollarSign, TrendingUp, AlertCircle, Building2, Archive, FileText, Vote, CalendarDays } from 'lucide-react';
import { useSelection } from '../contexts/SelectionContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { buildingService, type FinancialSummary, type BuildingExpense } from '../services/buildingService';
import { unitService, type UnitResponseFromAPI } from '../services/unitService';
import { pollService, type Poll } from '../services/pollService';
import { eventService, type Notice } from '../services/eventService';
import type { Transaction, Document } from '../types/database';
import { TransactionType, TransactionStatus, DocumentType } from '../types/database';

// Тип за обединени транзакции и разходи
type CombinedItem = {
  id: number;
  type: 'payment' | 'expense';
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
  fundType?: 'REPAIR' | 'GENERAL';
};

export function AdminOverview() {
  const { selectedBuilding } = useSelection();
  const navigate = useNavigate();
  const [recentPayments, setRecentPayments] = useState<Transaction[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [expenses, setExpenses] = useState<BuildingExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [units, setUnits] = useState<UnitResponseFromAPI[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loadingFinancial, setLoadingFinancial] = useState(true);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  useEffect(() => {
    loadRecentPayments();
    loadExpenses();
    loadRecentDocuments();
    loadUnits();
    loadFinancialSummary();
    loadPolls();
    loadNotices();
  }, [selectedBuilding]);

  const loadRecentPayments = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoadingPayments(true);
      const transactions = await buildingService.getTransactions(
        selectedBuilding.id,
        TransactionType.PAYMENT,
        TransactionStatus.CONFIRMED
      );
      setRecentPayments(transactions);
    } catch (err) {
      console.error('Error loading recent payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadExpenses = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoadingExpenses(true);
      const expensesData = await buildingService.getExpenses(selectedBuilding.id);
      setExpenses(expensesData);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const loadRecentDocuments = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoadingDocuments(true);
      const documents = await buildingService.getDocuments(selectedBuilding.id);
      // Вземи последните 4 документа
      setRecentDocuments(documents.slice(0, 4));
    } catch (err) {
      console.error('Error loading recent documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadUnits = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoadingUnits(true);
      const unitsData = await unitService.getAllByBuilding(selectedBuilding.id);
      setUnits(unitsData);
    } catch (err) {
      console.error('Error loading units:', err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const loadFinancialSummary = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoadingFinancial(true);
      const summary = await buildingService.getFinancialSummary(selectedBuilding.id);
      setFinancialSummary(summary);
    } catch (err) {
      console.error('Error loading financial summary:', err);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const loadPolls = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoadingPolls(true);
      const pollsData = await pollService.getAllPolls(selectedBuilding.id, 'ALL');
      setPolls(pollsData);
    } catch (err) {
      console.error('Error loading polls:', err);
    } finally {
      setLoadingPolls(false);
    }
  };

  const loadNotices = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoadingNotices(true);
      const noticesData = await eventService.getAll(selectedBuilding.id, 'ALL');
      setNotices(noticesData);
    } catch (err) {
      console.error('Error loading notices:', err);
    } finally {
      setLoadingNotices(false);
    }
  };

  // Сметни общо жители
  const totalResidents = units.reduce((sum, unit) => sum + unit.residents, 0);

  // Сметни общо гласове от всички гласувания
  const totalVotesFromAllPolls = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);

  // Намери последното гласуване (най-новото по endAt дата)
  const latestPoll = polls.length > 0 
    ? polls.reduce((latest, poll) => {
        return new Date(poll.endAt) > new Date(latest.endAt) ? poll : latest;
      }, polls[0])
    : null;

  // Раздели събития на предстоящи и отминали
  const now = new Date();
  const upcomingNotices = notices.filter(notice => new Date(notice.noticeDateTime) > now);
  const pastNotices = notices.filter(notice => new Date(notice.noticeDateTime) <= now);

  // Комбинирай плащания и разходи и сортирай по дата
  const getCombinedTransactions = (): CombinedItem[] => {
    const combined: CombinedItem[] = [];

    // Добави плащания
    recentPayments.forEach((payment) => {
      combined.push({
        id: payment.id,
        type: 'payment',
        amount: payment.amount,
        description: payment.description || 'Плащане',
        date: payment.createdAt,
        paymentMethod: payment.paymentMethod,
      });
    });

    // Добави разходи
    expenses.forEach((expense) => {
      combined.push({
        id: expense.id,
        type: 'expense',
        amount: expense.amount,
        description: expense.description,
        date: expense.expenseDate,
        fundType: expense.fundType,
      });
    });

    // Сортирай по дата (най-новите първи)
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Вземи първите 4
    return combined.slice(0, 4);
  };

  const recentTransactions = getCombinedTransactions();
  const isLoadingTransactions = loadingPayments || loadingExpenses;

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PROTOCOL:
        return 'Протокол';
      case DocumentType.INVOICE:
        return 'Фактура';
      case DocumentType.CONTRACT:
        return 'Договор';
      case DocumentType.OTHER:
        return 'Друго';
      default:
        return 'Документ';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Преглед</h1>
        <p className="text-gray-600">Обобщена информация за входа</p>
      </div>

      {/* Статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Общо жители */}
        <div 
          onClick={() => navigate('/admin/dashboard/residents')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">
            {loadingUnits ? '...' : totalResidents}
          </div>
          <div className="text-gray-600 text-sm mb-1">Общо жители</div>
          <div className="text-gray-500 text-xs">
            {loadingUnits ? 'Зареждане...' : `${units.length} апартамента`}
          </div>
        </div>

        {/* Средства */}
        <div 
          onClick={() => navigate('/admin/dashboard/payments')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">
            {loadingFinancial ? '...' : financialSummary ? 
              `${financialSummary.totalBalance.toFixed(2)} EUR` : 
              '0.00 EUR'}
          </div>
          <div className="text-gray-600 text-sm mb-1">Общо средства</div>
          <div className="text-gray-500 text-xs">
            Поддръжка • Ремонти
          </div>
        </div>

        {/* Вотове */}
        <div 
          onClick={() => navigate('/admin/dashboard/voting')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Vote className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">
            {loadingPolls ? '...' : polls.length}
          </div>
          <div className="text-gray-600 text-sm mb-1">Общо Гласувания</div>
          <div className="text-gray-500 text-xs">
            {loadingPolls ? 'зареждане...' : 
              latestPoll ? `${latestPoll.totalVotes} гласа в последното` : 
              'няма гласувания'
            }
          </div>
        </div>

        {/* Събития */}
        <div 
          onClick={() => navigate('/admin/dashboard/events')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">
            {loadingNotices ? '...' : upcomingNotices.length}
          </div>
          <div className="text-gray-600 text-sm mb-1">Предстоящи събития</div>
          <div className="text-gray-500 text-xs">
            {loadingNotices ? 'зареждане...' : `${pastNotices.length} отминали събития`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последни плащания и разходи */}
        <div className="bg-white rounded-lg shadow flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-gray-900">Последни плащания и разходи</h2>
          </div>
          <div className="divide-y flex-1">
            {isLoadingTransactions ? (
              <div className="p-4 text-gray-500">Зареждане...</div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-900">{item.description}</div>
                      <div className="text-gray-600 text-sm">
                        {item.type === 'payment' ? (
                          item.paymentMethod === 'STRIPE' ? 'Карта' : 
                          item.paymentMethod === 'CASH' ? 'Кеш' : 
                          'Банков превод'
                        ) : (
                          item.fundType === 'REPAIR' ? 'Ремонти' : 'Поддръжка'
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${
                        item.type === 'payment' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.type === 'payment' ? '+' : '-'}{item.amount.toFixed(2)} EUR
                      </div>
                      <div className="text-gray-500 text-sm">
                        {new Date(item.date).toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">Няма последни плащания и разходи</div>
            )}
          </div>
          {!isLoadingTransactions && (
            <div className="p-4 border-t mt-auto">
              <button
                onClick={() => navigate('/admin/dashboard/payments')}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Виж всички транзакции
              </button>
            </div>
          )}
        </div>

        {/* Архив */}
        <div className="bg-white rounded-lg shadow flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-gray-900">Последни документи</h2>
          </div>
          <div className="divide-y flex-1">
            {loadingDocuments ? (
              <div className="p-4 text-gray-500">Зареждане...</div>
            ) : recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.open(doc.fileUrl, '_blank')}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 truncate">{doc.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-600 text-sm">{getDocumentTypeLabel(doc.type)}</span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(doc.createdAt).toLocaleDateString('bg-BG')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">Няма документи</div>
            )}
          </div>
          {!loadingDocuments && (
            <div className="p-4 border-t mt-auto">
              <button
                onClick={() => navigate('/admin/dashboard/archive')}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Виж всички документи
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}