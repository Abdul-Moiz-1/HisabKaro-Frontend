import axios, { AxiosError } from 'axios';
import { API_CONFIG, DEFAULT_HTTP_HEADERS } from '../constants/config';
import { store } from '../store';
import { clearUser } from '../store/slices/userSlice';
import { V1_API } from '@env';


export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

const httpClient = axios.create({
  baseURL: V1_API,
  timeout: API_CONFIG.timeout,
  headers: DEFAULT_HTTP_HEADERS,
});

httpClient.interceptors.request.use((config) => {
  const token = store.getState().user.token;

  // Only add Authorization header if token exists and is not empty
  if (token && token.trim() !== '' && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[HTTP] Request with auth:', config.method?.toUpperCase(), config.url);
  } else {
    console.log('[HTTP] Request without auth:', config.method?.toUpperCase(), config.url);
  }

  return config;
});

const normalizeError = (error: AxiosError): ApiError => {
  const status = error.response?.status;
  const message =
    (error.response?.data as { message?: string })?.message ||
    error.message ||
    'Something went wrong. Please try again.';

  return {
    message,
    status,
    details: error.response?.data,
  };
};

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const normalizedError = normalizeError(error);

    if (normalizedError.status === 401) {
      store.dispatch(clearUser());
    }

    return Promise.reject(normalizedError);
  }
);

export default httpClient;


