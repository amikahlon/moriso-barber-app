import axios from "axios";

import { triggerUnauthorizedHandler } from "../features/auth/lib/unauthorized-handler";
import { supabase } from "../lib/supabase";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

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
      } catch {
      }

      await supabase.auth.signOut();
      await triggerUnauthorizedHandler();
    }

    return Promise.reject(error);
  },
);
