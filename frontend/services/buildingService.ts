import { api } from '../config/api';
import { Transaction, TransactionType, TransactionStatus, Document, PaymentMethod } from '../types/database';

export interface CreateBuildingRequest {
  address: string;
  googlePlaceId: string;
  entrance: string;
  name: string;
  totalUnits: number;
  iban?: string; // IBAN за банкови преводи
}

export interface ManagerInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface BuildingResponse {
  id: number;
  name: string;
  address: string;
  entrance: string;
  totalUnits: number;
  managerInfo: ManagerInfo;
}

// Budget types
export interface BudgetData {
  repairBudget: number;
  maintenanceBudget: number;
  protocolFileUrl: string | null;
}

export interface UpdateBudgetRequest {
  repairBudget: number;
  maintenanceBudget: number;
  protocolFileUrl: string | null;
}

// Finance types
export interface FinancialSummary {
  totalBalance: number;
  repairFund: FundBreakdown;
  maintenanceFund: FundBreakdown;
  cashOnHands: number;
  bankAccounts: number;
}

export interface FundBreakdown {
  income: number;
  expense: number;
  balance: number;
}

export interface BuildingExpense {
  id: number;
  amount: number;
  description: string;
  fundType: 'REPAIR' | 'GENERAL';
  documentUrl: string | null;
  expenseDate: string;
  createdBy: string;
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  fundType: 'REPAIR' | 'GENERAL';
  documentUrl: string | null;
  paymentMethod: PaymentMethod; // Използва PaymentMethod enum
}

class BuildingService {
  // Създаване на нова сграда (POST /api/buildings)
  async create(data: CreateBuildingRequest): Promise<BuildingResponse> {
    return await api.post<BuildingResponse>('/buildings', data);
  }

  // Получаване на всички сгради които управлявам (GET /api/buildings/managed)
  async getManagedBuildings(): Promise<BuildingResponse[]> {
    return await api.get<BuildingResponse[]>('/buildings/managed');
  }

  // Budget operations
  async getBudget(buildingId: number): Promise<BudgetData> {
    return await api.get<BudgetData>(`/buildings/${buildingId}/budget`);
  }

  async updateBudget(buildingId: number, data: UpdateBudgetRequest): Promise<void> {
    await api.put<void>(`/buildings/${buildingId}/budget`, data);
  }

  // Finance operations
  async getFinancialSummary(buildingId: number): Promise<FinancialSummary> {
    return await api.get<FinancialSummary>(`/buildings/${buildingId}/finance/summary`);
  }

  async getTransactions(
    buildingId: number, 
    type?: TransactionType, 
    status?: TransactionStatus
  ): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await api.get<Transaction[]>(`/buildings/${buildingId}/finance/transactions${query}`);
  }

  async getExpenses(buildingId: number): Promise<BuildingExpense[]> {
    return await api.get<BuildingExpense[]>(`/buildings/${buildingId}/finance/expenses`);
  }

  async createExpense(buildingId: number, data: CreateExpenseRequest): Promise<void> {
    await api.post<void>(`/buildings/${buildingId}/finance/expenses`, data);
  }

  // Document operations
  async getDocuments(buildingId: number): Promise<Document[]> {
    return await api.get<Document[]>(`/buildings/${buildingId}/documents`);
  }

  // Debug - Force trigger monthly fees
  async triggerMonthlyFees(buildingId: number): Promise<string> {
    return await api.post<string>(`/debug/fees/${buildingId}`);
  }

  // Transfer manager rights to a resident
  async transferManager(buildingId: number, userId: number): Promise<void> {
    await api.post<void>(`/buildings/${buildingId}/transfer-manager/${userId}`);
  }
}

export const buildingService = new BuildingService();