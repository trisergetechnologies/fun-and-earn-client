import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthTokens,
  getRefreshToken,
  getToken,
  saveAuthTokens,
} from '@/helpers/authStorage';
import { authLog, authLogToken } from '@/helpers/authLogger';

const EXPO_PUBLIC_BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

type SessionExpiredHandler = () => void | Promise<void>;

let onSessionExpired: SessionExpiredHandler | null = null;
let refreshPromise: Promise<string | null> | null = null;
let interceptorsAttached = false;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  onSessionExpired = handler;
}

function isAuthRefreshUrl(url?: string) {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  );
}

function requestLabel(config?: InternalAxiosRequestConfig) {
  const method = (config?.method || 'get').toUpperCase();
  const url = config?.url || '(unknown)';
  return `${method} ${url}`;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    authLog('warn', 'refresh.skipped', {
      reason: 'no_refresh_token_in_storage',
      hint: 'Legacy session or user needs to log in again after app update',
    });
    return null;
  }

  authLog('info', 'refresh.start', {
    ...authLogToken('refreshToken', refreshToken),
  });

  try {
    const res = await axios.post(
      `${EXPO_PUBLIC_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = res.data?.data;
    if (!res.data?.success || !data) {
      authLog('error', 'refresh.failed', {
        reason: 'unsuccessful_response',
        success: res.data?.success,
        message: res.data?.message,
      });
      return null;
    }

    const accessToken = data.accessToken || data.token;
    if (!accessToken) {
      authLog('error', 'refresh.failed', {
        reason: 'missing_access_token_in_response',
      });
      return null;
    }

    const nextRefresh = data.refreshToken || refreshToken;
    await saveAuthTokens({
      accessToken,
      refreshToken: nextRefresh,
    });

    authLog('success', 'refresh.ok', {
      expiresIn: data.expiresIn,
      rotatedRefresh: Boolean(data.refreshToken),
      ...authLogToken('newAccessToken', accessToken),
      ...authLogToken('newRefreshToken', nextRefresh),
    });

    return accessToken;
  } catch (err) {
    const ax = err as AxiosError<{ message?: string }>;
    authLog('error', 'refresh.failed', {
      reason: 'request_error',
      status: ax.response?.status,
      message: ax.response?.data?.message || ax.message,
    });
    return null;
  }
}

/** Single-flight refresh so concurrent 401s share one request. */
export async function ensureFreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    authLog('info', 'refresh.single_flight_start');
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
      authLog('info', 'refresh.single_flight_end');
    });
  } else {
    authLog('info', 'refresh.single_flight_join', {
      hint: 'Another 401 is already refreshing; waiting on same promise',
    });
  }
  return refreshPromise;
}

function attachInterceptors(client: AxiosInstance, clientName: string) {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (isAuthRefreshUrl(config.url)) return config;

    const token = await getToken();
    if (token) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const status = error.response?.status;
      const label = requestLabel(original);

      if (!original || status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      if (isAuthRefreshUrl(original.url)) {
        authLog('warn', '401.on_auth_route', {
          client: clientName,
          request: label,
          hint: 'Not attempting refresh for login/register/refresh itself',
        });
        return Promise.reject(error);
      }

      const storedRefresh = await getRefreshToken();
      if (!storedRefresh) {
        authLog('warn', '401.no_refresh_available', {
          client: clientName,
          request: label,
          hint: 'Will not auto-refresh; caller sees 401 (legacy install?)',
        });
        return Promise.reject(error);
      }

      authLog('info', '401.will_refresh', {
        client: clientName,
        request: label,
        serverMessage: (error.response?.data as { message?: string } | undefined)?.message,
      });

      original._retry = true;

      const newAccess = await ensureFreshAccessToken();
      if (!newAccess) {
        authLog('error', 'session.expired', {
          client: clientName,
          request: label,
          action: 'clear_tokens_and_logout',
        });
        await clearAuthTokens();
        try {
          await onSessionExpired?.();
        } catch {
          // never throw from session expiry handler
        }
        return Promise.reject(error);
      }

      authLog('success', '401.retry_with_new_access', {
        client: clientName,
        request: label,
        ...authLogToken('accessToken', newAccess),
      });

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return client(original);
    }
  );
}

/** Install global axios interceptors once (covers existing axios.* call sites). */
export function setupApiClient() {
  if (interceptorsAttached) return;
  interceptorsAttached = true;
  authLog('info', 'api_client.setup', {
    baseURL: EXPO_PUBLIC_BASE_URL,
    hint: 'Filter console by "DreamMart Auth"',
  });
  attachInterceptors(axios, 'axios');
  attachInterceptors(api, 'api');
}

export const api = axios.create({
  baseURL: EXPO_PUBLIC_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** Attach Authorization from SecureStore for one-off axios calls. */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export { EXPO_PUBLIC_BASE_URL };
