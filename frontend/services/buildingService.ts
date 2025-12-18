import { api } from '../config/api';

export interface CreateBuildingRequest {
  address: string;
  googlePlaceId: string;
  entrance: string;
  name: string;
  totalUnits: number;
}

export interface CreateBuildingResponse {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  accessCode: string;
}

export const buildingService = {
  // Създай нов вход
  create: async (data: CreateBuildingRequest): Promise<CreateBuildingResponse> => {
    try {
      return await api.post<CreateBuildingResponse>('/buildings/create', data);
    } catch (error) {
      // Mock данни за тестване без backend
      const accessCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        name: data.name,
        address: data.address,
        totalUnits: data.totalUnits,
        accessCode,
      };
    }
  },
};
