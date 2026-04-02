import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmailProvider = 'gmail' | 'outlook';

export type EmailAccountStatus = 'active' | 'expired' | 'error';

export type LogStatus = 'success' | 'failed' | 'pending';

export interface EmailAccount {
  id: number;
  provider: EmailProvider;
  email: string;
  status: EmailAccountStatus;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailAccountStats {
  totalEmails: number;
  parsedCount: number;
  pendingCount: number;
  failedCount: number;
  transactionsPending: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  successRate: string;
  lastPolledAt?: string;
}

export interface EmailProcessingLog {
  id: number;
  emailAccountId: number;
  status: LogStatus;
  message: string;
  emailSubject?: string;
  createdAt: string;
}

export interface OAuthUrlResponse {
  data: {
    success: boolean;
    authUrl: string;
    provider: EmailProvider;
  };
}

export interface GetOAuthUrlPayload {
  provider: EmailProvider;
}

export interface GetLogsParams {
  status?: LogStatus;
  limit?: number;
}

// ─── API Service ──────────────────────────────────────────────────────────────

export const emailAccountsApi = {
  /**
   * GET /api/v1/email-accounts
   * List all Gmail/Outlook accounts connected to this company.
   */
  getAll: (): Promise<{ data: EmailAccount[] }> =>
    apiClient.get<{ data: EmailAccount[] }>('/email-accounts'),

  /**
   * GET /api/v1/email-accounts/{id}
   * Get details of a single connected email account.
   */
  getById: (id: number): Promise<{ data: EmailAccount }> =>
    apiClient.get<{ data: EmailAccount }>(`/email-accounts/${id}`),

  /**
   * DELETE /api/v1/email-accounts/{id}
   * Disconnect a connected Gmail/Outlook account.
   * Existing transactions are preserved.
   */
  disconnect: (id: number): Promise<void> =>
    apiClient.delete<void>(`/email-accounts/${id}`),

  /**
   * POST /api/v1/email-accounts/oauth-url
   * Get provider OAuth authorization URL.
   * Open the returned `authUrl` in an in-app browser.
   * Body: { "provider": "gmail" | "outlook" }
   */
  getOAuthUrl: (provider: EmailProvider): Promise<OAuthUrlResponse> =>
    apiClient.post<OAuthUrlResponse>('/email-accounts/oauth-url', {
      provider,
    } as GetOAuthUrlPayload),

  /**
   * POST /api/v1/email-accounts/{id}/poll
   * Trigger an immediate email poll for the connected account.
   */
  poll: (id: number): Promise<void> =>
    apiClient.post<void>(`/email-accounts/${id}/poll`),

  /**
   * POST /api/v1/email-accounts/{id}/refresh-token
   * Refresh the OAuth access token for the connected account.
   */
  refreshToken: (id: number): Promise<void> =>
    apiClient.post<void>(`/email-accounts/${id}/refresh-token`),

  /**
   * GET /api/v1/email-accounts/{id}/logs
   * Get email processing logs for bank transaction emails.
   * Optional: filter by status, limit (default 50).
   */
  getLogs: (
    id: number,
    params?: GetLogsParams,
  ): Promise<{ data: EmailProcessingLog[] }> =>
    apiClient.get<{ data: EmailProcessingLog[] }>(
      `/email-accounts/${id}/logs`,
      {
        status: params?.status,
        limit: params?.limit ?? 50,
      },
    ),

  /**
   * GET /api/v1/email-accounts/{id}/stats
   * Get statistics including matched/unmatched transactions.
   */
  getStats: (id: number): Promise<{ data: EmailAccountStats }> =>
    apiClient.get<{ data: EmailAccountStats }>(
      `/email-accounts/${id}/stats`,
    ),
};

export default emailAccountsApi;
