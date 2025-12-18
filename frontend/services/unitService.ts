import { api } from '../config/api';
import type { Unit } from '../types/database';

export interface JoinUnitRequest {
  accessCode: string;
  residentsCount: number;
  area: number;
}

export interface JoinUnitResponse {
  unitId: number;
  unitNumber: number;
  buildingName: string;
  buildingAddress: string;
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
        unitId: Math.floor(Math.random() * 100) + 1,
        unitNumber: Math.floor(Math.random() * 50) + 1,
        buildingName: 'Тестова сграда',
        buildingAddress: 'Тестов адрес 1',
      };
    }
  },

  // Получи всички апартаменти за текущата сграда
  getAll: async (): Promise<Unit[]> => {
    try {
      // Backend endpoint би трябвало да върне всички units за сградата на текущия manager
      return await api.get<Unit[]>('/units');
    } catch (error) {
      console.log('Using mock units data');
      return MOCK_UNITS;
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

  // Редактирай апартамент
  update: async (id: number, data: Partial<Unit>): Promise<Unit> => {
    try {
      return await api.put<Unit>(`/units/${id}`, data);
    } catch (error) {
      throw new Error('Апартаментът не може да бъде редактиран в момента');
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