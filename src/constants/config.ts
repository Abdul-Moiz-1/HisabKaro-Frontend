import { ENV_CONFIG } from './env';

export const API_CONFIG = {
  baseURL: ENV_CONFIG.API.BASE_URL,
  timeout: ENV_CONFIG.API.TIMEOUT,
};

export const DEFAULT_HTTP_HEADERS = {
  'Content-Type': 'application/json',
};

// Re-export for convenience
export { ENV_CONFIG };
