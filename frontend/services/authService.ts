import { api } from '../config/api';
import type { User } from '../types/database';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authService = {
  // Вход
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Backend приема rememberMe и генерира съответния cookie (session или persistent)
    // Ако rememberMe=true, backend генерира persistent cookie който остава на диска
    // Ако rememberMe=false, backend генерира session cookie който се изтрива при затваряне
    const user = await api.post<User>('/auth/login', credentials);
    
    // Запазваме потребителя САМО в sessionStorage за UI целите
    // Автентикацията се управлява изцяло от backend cookie
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    return { user };
  },

  // Регистрация
  register: async (data: RegisterRequest): Promise<User> => {
    // Регистрираме потребителя (JWT токенът се връща автоматично в HTTP-only cookie)
    await api.post('/auth/register', data);
    
    // След успешна регистрация, вземаме пълните user данни
    const user = await api.get<User>('/auth/me');
    
    // Запази потребителя в sessionStorage за UI
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  },

  // Изход
  logout: async () => {
    try {
      // Backend изтрива remember-me token от базата данни и изчиства cookies
      await api.post('/auth/logout', {});
    } catch (error) {
      console.warn('Backend logout failed, clearing local session');
    } finally {
      // Изчистваме само UI state
      sessionStorage.removeItem('currentUser');
      // НЕ изчистваме rememberedEmail и rememberMe - те остават за следващ вход
      // Ако потребителят иска да изчисти запомнения имейл, може да махне checkbox-а при следващ login
    }
  },

  // Вземи текущия потребител от backend
  me: async (): Promise<User> => {
    try {
      // Backend проверява JWT cookie или remember-me cookie
      // Ако има валиден cookie, връща user данните
      const user = await api.get<User>('/auth/me');
      // Актуализираме sessionStorage с актуалните данни
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      // Ако заявката не успее, изчистваме сесията
      sessionStorage.removeItem('currentUser');
      throw error;
    }
  },

  // Вземи текущия потребител от sessionStorage (за UI)
  getCurrentUser: (): User | null => {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Проверка дали има активна сесия
  // Това е само за UI - истинската проверка е чрез /auth/me endpoint
  isAuthenticated: (): boolean => {
    return sessionStorage.getItem('currentUser') !== null;
  },

  // Обнови текущия потребител в sessionStorage
  updateCurrentUser: (user: User) => {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  },
};