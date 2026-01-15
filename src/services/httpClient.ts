import axios, { AxiosError } from 'axios';
import { API_CONFIG, DEFAULT_HTTP_HEADERS } from '../constants/config';
import { store } from '../store';
import { clearUser } from '../store/slices/userSlice';

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

// Fallback to config if env variable is not loaded
const getBaseURL = () => {
  if (API_CONFIG.baseURL && API_CONFIG.baseURL.trim() !== '') {
    console.log(API_CONFIG.baseURL);
    return API_CONFIG.baseURL;
  }
  console.warn(
    '[HTTP] API_CONFIG.baseURL from config is not available, using fallback from config',
  );
  return API_CONFIG.baseURL;
};

const httpClient = axios.create({
  baseURL: getBaseURL(),
  timeout: API_CONFIG.timeout,
  headers: DEFAULT_HTTP_HEADERS,
});

// httpClient.interceptors.request.use((config) => {
//   const token = store.getState().user.token;

//   // Log the full URL for debugging
//   const fullUrl = `${config.baseURL}${config.url}`;
//   console.log('[HTTP] Request:', config.method?.toUpperCase(), fullUrl);

//   // Only add Authorization header if token exists and is not empty
//   if (token && token.trim() !== '' && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//     console.log('[HTTP] Request with auth token');
//   } else {
//     console.log('[HTTP] Request without auth token');
//   }

//   return config;
// });

const normalizeError = (error: AxiosError): ApiError => {
  const status = error.response?.status;

  // Handle network errors (no internet, connection refused, etc.)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        message:
          'Request timeout. Please check your internet connection and try again.',
        status: 408,
        details: error.message,
      };
    }
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      return {
        message:
          'Network error. Please check your internet connection and try again.',
        status: 0,
        details: error.message,
      };
    }
    return {
      message:
        error.message ||
        'Network error. Please check your internet connection.',
      status: 0,
      details: error.message,
    };
  }

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

// httpClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     const normalizedError = normalizeError(error);

//     if (normalizedError.status === 401) {
//       store.dispatch(clearUser());
//     }

//     return Promise.reject(normalizedError);
//   }
// );

export default httpClient;
