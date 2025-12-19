import { api } from '../config/api';
import type { DashboardData, MyHome } from '../types/database';
import { buildingService } from './buildingService';
import { unitService, type UnitResponseFromAPI } from './unitService';

export const dashboardService = {
  // Вземи dashboard данни чрез 2 отделни заявки
  getDashboard: async (): Promise<DashboardData> => {
    try {
      // Заявка 1: GET /api/buildings/managed - управлявани входове
      const managedBuildings = await buildingService.getManagedBuildings();
      
      // Заявка 2: GET /api/units/my - моите апартаменти
      const myUnits = await unitService.getMyUnits();
      
      // Преобразуваме UnitResponseFromAPI[] в MyHome[]
      const myHomes: MyHome[] = myUnits.map((unit: UnitResponseFromAPI) => ({
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        buildingId: unit.buildingInfo.id,
        buildingName: unit.buildingInfo.name,
        buildingAddress: unit.buildingInfo.address,
      }));
      
      return {
        managedBuildings,
        myHomes,
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Ако има грешка, връщаме празни масиви
      return {
        managedBuildings: [],
        myHomes: []
      };
    }
  },
};