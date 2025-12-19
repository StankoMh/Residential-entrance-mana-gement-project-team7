import { api } from '../config/api';

export interface CreateBuildingRequest {
  address: string;
  googlePlaceId: string;
  entrance: string;
  name: string;
  totalUnits: number;
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

class BuildingService {
  // Създаване на нова сграда (POST /api/buildings)
  async create(data: CreateBuildingRequest): Promise<BuildingResponse> {
    return await api.post<BuildingResponse>('/buildings', data);
  }

  // Получаване на всички сгради които управлявам (GET /api/buildings/managed)
  async getManagedBuildings(): Promise<BuildingResponse[]> {
    return await api.get<BuildingResponse[]>('/buildings/managed');
  }
}

export const buildingService = new BuildingService();