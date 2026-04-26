import { apiClient } from "./client";

export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: "admin" | "customer";
  notes?: string;
  createdAt: string;
  birthDate?: string;
}

interface RawUser {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: "admin" | "customer";
  notes: string | null;
  created_at: string;
  birth_date: string | null;
}

const mapUser = (raw: RawUser): AdminUser => ({
  id: raw.id,
  fullName: raw.full_name,
  phone: raw.phone,
  email: raw.email,
  role: raw.role,
  notes: raw.notes ?? undefined,
  createdAt: raw.created_at,
  birthDate: raw.birth_date ?? undefined,
});

export const usersApi = {
  getAll: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<RawUser[]>("/users");
    return data.map(mapUser);
  },
};
