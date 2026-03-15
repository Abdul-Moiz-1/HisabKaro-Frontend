/**
 * Environment Configuration
 *
 * This file contains environment-specific configuration for the app.
 * Toggle USE_MOCK_DATA to switch between mock data and real API endpoints.
 */

export const ENV_CONFIG = {
  /**
   * Enable/Disable Mock Data
   *
   * When true: All API calls return mock data for development and testing
   * When false: All API calls hit real backend endpoints
   *
   * Set to false when you have a working backend API
   */
  USE_MOCK_DATA: false,

  /**
   * API Configuration
   */
  API: {
    BASE_URL: 'http://146.190.142.109:3000/api/v1',
    TIMEOUT: 15000,
  },

  /**
   * Feature Flags
   */
  FEATURES: {
    ENABLE_BIOMETRIC_AUTH: true,
    ENABLE_AI_ASSISTANT: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
  },

  /**
   * App Configuration
   */
  APP: {
    NAME: 'HisabKaro',
    VERSION: '1.0.0',
    BUILD: '1',
  },

  /**
   * Debug Configuration
   */
  DEBUG: {
    ENABLE_LOGS: __DEV__,
    ENABLE_REDUX_LOGGER: __DEV__,
    ENABLE_API_LOGS: __DEV__,
  },
} as const;

// Type exports
export type EnvConfig = typeof ENV_CONFIG;
