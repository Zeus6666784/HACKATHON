import { createContext, useContext, useState, ReactNode } from "react";
import { post } from "../services/api";
import type { Role } from "../types";

type User = { id: string; name: string; role: Role };
type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, password: string) {
    const data = await post<User>("/auth/login", { email, password });
    setUser(data);
  }

  async function logout() {
    await post("/auth/logout");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
