import { apiClient } from "./client";
import type { AuthResponse, LoginDto, RegisterDto, User } from "../types";

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", dto, {
      skipAuth: true,
      skipUnauthorizedHandler: true,
    });
    return data;
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", dto, {
      skipAuth: true,
      skipUnauthorizedHandler: true,
    });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  },
};
