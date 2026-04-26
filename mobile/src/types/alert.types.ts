export interface Alert {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}
