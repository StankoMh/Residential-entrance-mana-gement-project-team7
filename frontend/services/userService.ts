import { api } from '../config/api';
import type { User } from '../types/database';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Вземи всички потребители (admin)
  getAllUsers: () => api.get<User[]>('/users'),

  // Вземи потребител по ID (admin)
  getUserById: (id: number) => api.get<User>(`/users/${id}`),

  // Вземи текущия профил
  getMyProfile: () => api.get<User>('/users/me'),

  // Обнови профил
  updateProfile: (data: UpdateProfileRequest) =>
    api.put<User>('/users/profile', data),

  // Промени парола
  changePassword: (data: ChangePasswordRequest) =>
    api.post<void>('/users/change-password', data),

  // Изтрий потребител (admin)
  deleteUser: (id: number) => api.delete<void>(`/users/${id}`),
};