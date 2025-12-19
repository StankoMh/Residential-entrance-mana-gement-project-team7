import { api } from '../config/api';
import type { Unit } from '../types/database';

export interface JoinUnitRequest {
  accessCode: string;
  residentsCount: number;
  area: number;
}

export interface BuildingInfo {
  id: number;
  name: string;
  address: string;
}

export interface OwnerInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UnitResponseFromAPI {
  id: number;
  unitNumber: number;
  area: number;
  residents: number;
  accessCode: string;
  isVerified: boolean; // Потвърдени ли са данните от мениджъра
  buildingInfo: BuildingInfo;
  ownerInfo: OwnerInfo;
}

export interface JoinUnitResponse {
  id: number;
  unitNumber: number;
  area: number;
  residents: number;
  buildingName: string;
  buildingAddress: string;
  isOccupied: boolean;
}

export interface UpdateUnitRequest {
  area: number;
  residentsCount: number;
}

// Mock данни за демонстрация - генерирани кодове за всеки апартамент
const generateMockUnits = (totalUnits: number): Unit[] => {
  const units: Unit[] = [];
  for (let i = 1; i <= totalUnits; i++) {
    // Генерираме 8-цифрен код за всеки апартамент
    const accessCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    units.push({
      id: i,
      buildingId: 1,
      unitNumber: i.toString(),
      area: 50 + Math.floor(Math.random() * 50), // 50-100 кв.м
      residents: 0,
      floor: Math.floor((i - 1) / 4) + 1, // 4 апартамента на етаж
      accessCode: accessCode,
      isVerified: i > 3 ? true : false, // Първите 3 са непотвърдени за демонстрация
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return units;
};

const MOCK_UNITS = generateMockUnits(24);

export const unitService = {
  // Присъедини се към апартамент
  join: async (data: JoinUnitRequest): Promise<JoinUnitResponse> => {
    try {
      return await api.post<JoinUnitResponse>('/units/join', data);
    } catch (error) {
      // Mock данни за тестване без backend
      return {
        id: Math.floor(Math.random() * 100) + 1,
        unitNumber: Math.floor(Math.random() * 50) + 1,
        area: 50 + Math.floor(Math.random() * 50), // 50-100 кв.м
        residents: data.residentsCount,
        buildingName: 'Тестова сграда',
        buildingAddress: 'Тестов адрес 1',
        isOccupied: true,
      };
    }
  },

  // Получи моите апартаменти (с buildingInfo)
  getMyUnits: async (): Promise<UnitResponseFromAPI[]> => {
    try {
      return await api.get<UnitResponseFromAPI[]>('/units/my');
    } catch (error) {
      console.error('Error fetching my units:', error);
      return [];
    }
  },

  // Получи всички апартаменти за конкретна сграда
  getAllByBuilding: async (buildingId: number): Promise<UnitResponseFromAPI[]> => {
    try {
      return await api.get<UnitResponseFromAPI[]>(`/units/buildings/${buildingId}/units`);
    } catch (error) {
      console.error('Error fetching units for building:', error);
      return [];
    }
  },

  // Получи информация за конкретен апартамент
  getById: async (id: number): Promise<Unit> => {
    try {
      return await api.get<Unit>(`/units/${id}`);
    } catch (error) {
      const unit = MOCK_UNITS.find(u => u.id === id);
      if (!unit) throw new Error('Апартаментът не е намерен');
      return unit;
    }
  },

  // Редактирай апартамент (от домоуправител)
  update: async (id: number, data: UpdateUnitRequest): Promise<UnitResponseFromAPI> => {
    try {
      return await api.put<UnitResponseFromAPI>(`/units/units/${id}`, data);
    } catch (error) {
      throw new Error('Апартаментът не може да бъде редактиран в момента');
    }
  },

  // Потвърди апартамент (verify)
  verify: async (id: number): Promise<void> => {
    try {
      await api.patch(`/units/units/${id}/verify`, {});
    } catch (error) {
      throw new Error('Грешка при потвърждаване на апартамент');
    }
  },

  // Изтрий апартамент
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/units/${id}`);
    } catch (error) {
      throw new Error('Апартаментът не може да бъде изтрит в момента');
    }
  },
};