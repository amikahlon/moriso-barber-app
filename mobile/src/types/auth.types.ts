export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  birthDate?: string | null;
  birth_date?: string | null;
}

export interface AuthResponse {
  user?: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  birthDate?: string;
}
