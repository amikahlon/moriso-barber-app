import axios from "axios";

import { triggerUnauthorizedHandler } from "../features/auth/lib/unauthorized-handler";
import { isInvalidRefreshTokenError } from "../features/auth/utils/sessionErrors";
import { clearStoredSupabaseSession, supabase } from "../lib/supabase";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipUnauthorizedHandler?: boolean;
  }
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const API_TIMEOUT_MS = 12000;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const getCurrentSessionSafely = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearStoredSupabaseSession();
      }

      return { session: null };
    }

    return { session: data.session };
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearStoredSupabaseSession();
      return { session: null };
    }

    throw error;
  }
};

apiClient.interceptors.request.use(async (config) => {
  if (config.skipAuth) {
    return config;
  }

  const { session } = await getCurrentSessionSafely();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (error.config?.skipUnauthorizedHandler) {
        return Promise.reject(error);
      }

      try {
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (!refreshError && session && error.config) {
          error.config.headers = error.config.headers ?? {};
          error.config.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient.request(error.config);
        }

        if (refreshError && isInvalidRefreshTokenError(refreshError)) {
          await clearStoredSupabaseSession();
        }
      } catch (refreshError) {
        if (isInvalidRefreshTokenError(refreshError)) {
          await clearStoredSupabaseSession();
        }
      }

      await clearStoredSupabaseSession();
      await triggerUnauthorizedHandler();
    }

    return Promise.reject(error);
  },
);
