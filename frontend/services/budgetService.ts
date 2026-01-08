import { api } from '../config/api';
import type { Budget, MaintenanceService } from '../types/database';

export interface CreateBudgetRequest {
  year: number;
  maintenanceAmount: number;
  repairAmount: number;
}

export interface UpdateBudgetRequest {
  maintenanceAmount?: number;
  repairAmount?: number;
}

export interface CreateMaintenanceServiceRequest {
  name: string;
  provider: string;
  monthlyCost: number;
  startDate: string; // ISO date
  endDate?: string; // ISO date
}

export interface UpdateMaintenanceServiceRequest {
  name?: string;
  provider?: string;
  monthlyCost?: number;
  startDate?: string;
  endDate?: string;
}

export const budgetService = {
  // Вземи всички бюджети (admin)
  getAllBudgets: () => api.get<Budget[]>('/budgets'),

  // Вземи бюджет по година (admin)
  getBudgetByYear: (year: number) => api.get<Budget>(`/budgets/${year}`),

  // Вземи текущия бюджет
  getCurrentBudget: () => api.get<Budget>('/budgets/current'),

  // Създай нов бюджет (admin)
  createBudget: (data: CreateBudgetRequest) =>
    api.post<Budget>('/budgets', data),

  // Обнови бюджет (admin)
  updateBudget: (year: number, data: UpdateBudgetRequest) =>
    api.put<Budget>(`/budgets/${year}`, data),

  // Изтрий бюджет (admin)
  deleteBudget: (year: number) => api.delete<void>(`/budgets/${year}`),
};

export const maintenanceServiceService = {
  // Вземи всички услуги за поддръжка
  getAllServices: () => api.get<MaintenanceService[]>('/maintenance-services'),

  // Вземи активни услуги
  getActiveServices: () => api.get<MaintenanceService[]>('/maintenance-services/active'),

  // Вземи услуга по ID
  getServiceById: (id: number) => api.get<MaintenanceService>(`/maintenance-services/${id}`),

  // Създай нова услуга (admin)
  createService: (data: CreateMaintenanceServiceRequest) =>
    api.post<MaintenanceService>('/maintenance-services', data),

  // Обнови услуга (admin)
  updateService: (id: number, data: UpdateMaintenanceServiceRequest) =>
    api.put<MaintenanceService>(`/maintenance-services/${id}`, data),

  // Приключи услуга (admin)
  endService: (id: number, endDate: string) =>
    api.patch<MaintenanceService>(`/maintenance-services/${id}/end`, { endDate }),

  // Изтрий услуга (admin)
  deleteService: (id: number) => api.delete<void>(`/maintenance-services/${id}`),
};
