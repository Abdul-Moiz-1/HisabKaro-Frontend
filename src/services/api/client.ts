import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/config';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token and logging
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log('API Req:', {
          url: config.url,
          method: config.method,
          data: config.data,
          headers: config.headers,
        });

        const token = await AsyncStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        console.error('API Req Error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor - handle logging, errors and token refresh
    this.client.interceptors.response.use(
      response => {
        console.log('API Res:', {
          url: response.config.url,
          status: response.status,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        console.error('API Res Error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise(resolve => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(
                `${API_CONFIG.baseURL}/auth/refresh`,
                {
                  refresh_token: refreshToken,
                },
              );

              const { access_token, refresh_token } = response.data;
              await AsyncStorage.setItem('access_token', access_token);
              await AsyncStorage.setItem('refresh_token', refresh_token);

              this.refreshSubscribers.forEach(callback =>
                callback(access_token),
              );
              this.refreshSubscribers = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Clear tokens and redirect to login
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            this.refreshSubscribers = [];
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  private normalizeError(error: AxiosError): ApiError {
    const response = error.response;
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        return {
          message: 'Request timeout. Please check your internet connection.',
          statusCode: 408,
        };
      }
      return {
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
      };
    }

    const data = response.data as
      | { message?: string; error?: string }
      | undefined;
    return {
      message: data?.message || error.message || 'An error occurred',
      statusCode: response.status,
      error: data?.error,
      details: data,
    };
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  // HTTP Methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
