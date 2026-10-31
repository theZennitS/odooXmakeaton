"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser, UserSession, Role, AuthState } from "@/types/auth";

const STORAGE_KEY = "brightloop_auth_session";

export const DEMO_USERS: Record<Role, AuthUser> = {
  Admin: {
    id: "usr_admin_01",
    name: "NITHEESH R",
    email: "nitheesh@brightloop.io",
    role: "Admin",
    department: "System Manager & Core Architecture",
    avatar: "NR",
    mfaEnabled: true,
    createdAt: "2026-01-15T08:00:00Z",
    lastLoginAt: "2026-10-31T09:30:00Z",
  },
  Staff: {
    id: "usr_staff_02",
    name: "Sarah Jenkins",
    email: "sarah.j@brightloop.io",
    role: "Staff",
    department: "Sales & Billing Operations",
    avatar: "SJ",
    mfaEnabled: true,
    createdAt: "2026-03-20T10:15:00Z",
    lastLoginAt: "2026-10-31T08:15:00Z",
  },
  Customer: {
    id: "usr_cust_03",
    name: "Brooklyn Zoe",
    email: "brooklyn@zoe.design",
    role: "Customer",
    department: "Zoe Design Studios (Client)",
    avatar: "BZ",
    mfaEnabled: false,
    createdAt: "2026-06-10T14:40:00Z",
    lastLoginAt: "2026-10-30T17:22:00Z",
  },
};

export const DEFAULT_ADMIN_SESSION: UserSession = {
  token: "bl_live_sess_89f02c9a1d4e7b8",
  userId: "usr_admin_01",
  user: DEMO_USERS.Admin,
  ipAddress: "192.168.1.142 (Internal Gateway)",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Brightloop Enterprise Client v2.4",
  device: "Windows Workstation (DevDesk Pro)",
  location: "Bangalore, India",
  issuedAt: "2026-10-31T08:00:00Z",
  expiresAt: "2026-11-07T08:00:00Z",
  isValid: true,
};

export interface DeviceSession {
  id: string;
  token: string;
  device: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, role: Role, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
  quickLogin: (role: Role) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: string;
  setAuthModalTab: (tab: string) => void;
  toggleMfa: () => void;
  deviceSessions: DeviceSession[];
  terminateSession: (sessionId: string) => void;
  terminateOtherSessions: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USERS.Admin);
  const [session, setSession] = useState<UserSession | null>(DEFAULT_ADMIN_SESSION);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("signin");
  
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([
    {
      id: "sess_curr",
      token: "bl_live_sess_89f02c9a1d4e7b8",
      device: "Windows Workstation (Active Session)",
      ipAddress: "192.168.1.142 (Internal Gateway)",
      location: "Bangalore, India",
      lastActive: "Just now",
      isCurrent: true,
    },
    {
      id: "sess_mobile",
      token: "bl_mob_sess_491a27e02b7c",
      device: "iPhone 15 Pro — Safari Mobile",
      ipAddress: "49.37.198.54 (Cellular Carrier)",
      location: "Bangalore, India",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "sess_mac",
      token: "bl_desk_sess_c09d31f24e",
      device: "MacBook Pro 16\" — Enterprise Desk",
      ipAddress: "14.139.182.10 (Corporate VPN)",
      location: "Mumbai, India",
      lastActive: "Yesterday at 18:42",
      isCurrent: false,
    },
  ]);

  // Load persisted session on initial mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserSession;
          if (parsed && parsed.user && parsed.isValid) {
            setSession(parsed);
            setUser(parsed.user);
          } else {
            // Re-seed default demo admin session
            setSession(DEFAULT_ADMIN_SESSION);
            setUser(DEMO_USERS.Admin);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_SESSION));
          }
        } else {
          // Initialize default admin session
          setSession(DEFAULT_ADMIN_SESSION);
          setUser(DEMO_USERS.Admin);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_SESSION));
        }
      }
    } catch (e) {
      console.warn("Could not load auth session from localStorage", e);
      setSession(DEFAULT_ADMIN_SESSION);
      setUser(DEMO_USERS.Admin);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistSession = useCallback((newSession: UserSession | null) => {
    try {
      if (typeof window !== "undefined") {
        if (newSession) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn("Failed to persist session to localStorage", e);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = true) => {
      // Validate inputs
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return { success: false, error: "Please enter your email address." };
      }
      if (!password) {
        return { success: false, error: "Please enter your password." };
      }

      // Check demo accounts matching email or role
      let matchedUser: AuthUser | undefined;
      for (const roleKey of Object.keys(DEMO_USERS) as Role[]) {
        const demo = DEMO_USERS[roleKey];
        if (demo.email.toLowerCase() === trimmedEmail) {
          matchedUser = demo;
          break;
        }
      }

      // If not matching default demo emails, create custom authenticated user
      if (!matchedUser) {
        const detectedRole: Role = trimmedEmail.includes("admin")
          ? "Admin"
          : trimmedEmail.includes("staff")
          ? "Staff"
          : "Customer";

        matchedUser = {
          id: `usr_${Date.now()}`,
          name: email.split("@")[0].replace(/[\._]/g, " ").toUpperCase(),
          email: trimmedEmail,
          role: detectedRole,
          department: detectedRole === "Admin" ? "System Manager" : detectedRole === "Staff" ? "Sales & Billing" : "Client Account",
          avatar: email.substring(0, 2).toUpperCase(),
          mfaEnabled: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
      } else {
        matchedUser = {
          ...matchedUser,
          lastLoginAt: new Date().toISOString(),
        };
      }

      const newSession: UserSession = {
        token: `bl_live_sess_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`,
        userId: matchedUser.id,
        user: matchedUser,
        ipAddress: "192.168.1.142 (Internal Gateway)",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Brightloop Enterprise Client",
        device: "Windows Workstation (DevDesk Pro)",
        location: "Bangalore, India",
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString(),
        isValid: true,
      };

      setUser(matchedUser);
      setSession(newSession);
      persistSession(newSession);

      // Update current device session
      setDeviceSessions((prev) => [
        {
          id: "sess_curr",
          token: newSession.token,
          device: "Windows Workstation (Active Session)",
          ipAddress: newSession.ipAddress,
          location: newSession.location,
          lastActive: "Just now",
          isCurrent: true,
        },
        ...prev.filter((s) => !s.isCurrent),
      ]);

      return { success: true };
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, role: Role, password: string) => {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedName) {
        return { success: false, error: "Full name is required." };
      }
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        return { success: false, error: "A valid email address is required." };
      }
      if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters." };
      }

      const initials = trimmedName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

      const newUser: AuthUser = {
        id: `usr_${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        role: role,
        department:
          role === "Admin"
            ? "Platform Administration"
            : role === "Staff"
            ? "Billing & Commercial Ops"
            : "Client Portal User",
        avatar: initials,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const newSession: UserSession = {
        token: `bl_live_sess_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`,
        userId: newUser.id,
        user: newUser,
        ipAddress: "192.168.1.142 (Internal Gateway)",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Brightloop Enterprise Client",
        device: "Windows Workstation (DevDesk Pro)",
        location: "Bangalore, India",
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: true,
      };

      setUser(newUser);
      setSession(newSession);
      persistSession(newSession);

      return { success: true };
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setUser(null);
    setSession(null);
    persistSession(null);
  }, [persistSession]);

  const switchRole = useCallback(
    (role: Role) => {
      const targetUser = DEMO_USERS[role];
      const updatedUser: AuthUser = {
        ...targetUser,
        lastLoginAt: new Date().toISOString(),
      };

      const newSession: UserSession = {
        token: `bl_live_sess_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`,
        userId: updatedUser.id,
        user: updatedUser,
        ipAddress: "192.168.1.142 (Internal Gateway)",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Brightloop Enterprise Client",
        device: "Windows Workstation (DevDesk Pro)",
        location: "Bangalore, India",
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: true,
      };

      setUser(updatedUser);
      setSession(newSession);
      persistSession(newSession);
    },
    [persistSession]
  );

  const quickLogin = useCallback(
    (role: Role) => {
      switchRole(role);
      setAuthModalOpen(false);
    },
    [switchRole]
  );

  const toggleMfa = useCallback(() => {
    if (!user || !session) return;
    const updatedUser = { ...user, mfaEnabled: !user.mfaEnabled };
    const updatedSession = { ...session, user: updatedUser };
    setUser(updatedUser);
    setSession(updatedSession);
    persistSession(updatedSession);
  }, [user, session, persistSession]);

  const terminateSession = useCallback((sessionId: string) => {
    setDeviceSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const terminateOtherSessions = useCallback(() => {
    setDeviceSessions((prev) => prev.filter((s) => s.isCurrent));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session?.isValid,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        quickLogin,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        toggleMfa,
        deviceSessions,
        terminateSession,
        terminateOtherSessions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
