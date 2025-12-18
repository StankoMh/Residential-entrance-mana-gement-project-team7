// API configuration and HTTP client for Java backend integration
import axios, { AxiosInstance, AxiosError } from 'axios';

// Backend URL - променете това с вашия реален Java backend URL
const API_BASE_URL = 'http://localhost:8080/api';

// HTTP error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно: изпраща cookies автоматично
});

// Response interceptor за обработка на грешки
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status || 500;
    const errorData = error.response?.data as any;
    const message = errorData?.message || errorData?.error || error.message || `HTTP Error: ${status}`;
    
    throw new ApiError(message, status, errorData);
  }
);

// HTTP Client wrapper
class ApiClient {
  private axios: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axios = axiosInstance;
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const response = await this.axios.get<T>(endpoint, { params });
    return response.data;
  }

  // POST request
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.axios.post<T>(endpoint, body);
    return response.data;
  }

  // PUT request
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.axios.put<T>(endpoint, body);
    return response.data;
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await this.axios.patch<T>(endpoint, body);
    return response.data;
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axios.delete<T>(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient(axiosInstance);

// Export axios instance for direct use if needed
export { axiosInstance };

// Export base URL for reference
export { API_BASE_URL };