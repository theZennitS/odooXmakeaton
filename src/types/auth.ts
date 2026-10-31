import { Role } from "./index";

export type { Role };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatar?: string;
  mfaEnabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UserSession {
  token: string;
  userId: string;
  user: AuthUser;
  ipAddress: string;
  userAgent: string;
  device: string;
  location: string;
  issuedAt: string;
  expiresAt: string;
  isValid: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  role: Role;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  currentSession: UserSession | null;
}

export type PermissionKey =
  | "subscriptions:read"
  | "subscriptions:write"
  | "subscriptions:delete"
  | "billing:read"
  | "billing:record_payment"
  | "billing:trigger_cron"
  | "discounts:manage"
  | "analytics:view"
  | "portal:access"
  | "system:admin";
