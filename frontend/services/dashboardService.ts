import { api } from '../config/api';
import type { DashboardData } from '../types/database';

export const dashboardService = {
  // Вземи dashboard данни (управлявани входове и жилища)
  getDashboard: async (): Promise<DashboardData> => {
    try {
      return await api.get<DashboardData>('/dashboard');
    } catch (error) {
      // Mock данни за тестване без backend
      return {
        managedBuildings: [],
        myHomes: []
      };
    }
  },
};
