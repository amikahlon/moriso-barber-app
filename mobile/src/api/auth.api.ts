import { apiClient } from "./client";
import type { AuthResponse, LoginDto, RegisterDto, User } from "../types";

type RawUser = Partial<User> & {
  fullName?: unknown;
  full_name?: unknown;
  birthDate?: unknown;
  birth_date?: unknown;
};

type RawAuthResponse = Partial<AuthResponse> & {
  access_token?: unknown;
  refresh_token?: unknown;
  session?: {
    accessToken?: unknown;
    refreshToken?: unknown;
    access_token?: unknown;
    refresh_token?: unknown;
  };
  user?: RawUser | null;
};

const readString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

const normalizeUser = (user: RawUser | null | undefined): User | undefined => {
  if (!user || typeof user !== "object") {
    return undefined;
  }

  const id = readString(user.id);
  const role =
    user.role === "admin" || user.role === "customer" ? user.role : undefined;

  if (!id || !role) {
    return undefined;
  }

  return {
    id,
    full_name:
      readString(user.full_name) ?? readString(user.fullName) ?? "",
    email: readString(user.email) ?? "",
    phone: readString(user.phone) ?? "",
    role,
    birthDate: readString(user.birthDate) ?? null,
    birth_date: readString(user.birth_date) ?? null,
  };
};

const normalizeAuthResponse = (
  data: RawAuthResponse | null | undefined,
): AuthResponse => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid auth response");
  }

  const accessToken =
    readString(data.accessToken) ??
    readString(data.access_token) ??
    readString(data.session?.accessToken) ??
    readString(data.session?.access_token);

  const refreshToken =
    readString(data.refreshToken) ??
    readString(data.refresh_token) ??
    readString(data.session?.refreshToken) ??
    readString(data.session?.refresh_token);

  if (!accessToken || !refreshToken) {
    throw new Error("Invalid auth response");
  }

  return {
    accessToken,
    refreshToken,
    user: normalizeUser(data.user),
  };
};

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post<RawAuthResponse>("/auth/login", dto, {
      skipAuth: true,
      skipUnauthorizedHandler: true,
    });
    return normalizeAuthResponse(data);
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post<RawAuthResponse>(
      "/auth/register",
      dto,
      {
        skipAuth: true,
        skipUnauthorizedHandler: true,
      },
    );
    return normalizeAuthResponse(data);
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  },
};
