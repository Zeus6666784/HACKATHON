"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { get } from "@/lib/api";

export type SessionUser = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  locale: string;
  facilityId: string | null;
};

interface AuthContextType {
  session: SessionUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshSession() {
    try {
      const data = await get("/auth/me");
      setSession(data);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSession();
  }, []);

  async function logout() {
    try {
      await get("/auth/logout"); // Using GET for simplicity or just clear cookie
    } catch {}
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, loading, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
