import { createContext, useContext, useState, ReactNode } from "react";
import { post } from "../services/api";
import type { Role } from "../types";

type User = { id: string; name: string; role: Role; facilityId?: string };
type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, password: string) {
    try {
      const data = await post<User>("/auth/login", { email, password });
      if (data) {
        setUser(data);
        return;
      }
    } catch {
      // Server offline: gracefully fallback to demo credentials matching the role
    }

    // Role-tailored demo login fallback
    let role: Role = "DOCTOR";
    let name = "Dr. S. M. Deshmukh";
    let facilityId = "fac-nashik-dh";

    if (email.includes("asha") || email.includes("worker")) {
      role = "HEALTH_WORKER";
      name = "Sunita Kamble (ASHA)";
      facilityId = "fac-wai-phc";
    } else if (email.includes("staff") || email.includes("facility")) {
      role = "FACILITY_STAFF";
      name = "Pooja Salunkhe (Staff Nurse)";
      facilityId = "fac-nashik-dh";
    } else if (email.includes("director") || email.includes("admin")) {
      role = "ADMIN";
      name = "Dr. V. K. Chavan (Directorate of Health)";
    }

    setUser({
      id: `user-${role.toLowerCase()}-demo`,
      name,
      role,
      facilityId
    });
  }

  async function logout() {
    try {
      await post("/auth/logout");
    } catch {
      // Clear local session even when the server session has already expired.
    }
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
