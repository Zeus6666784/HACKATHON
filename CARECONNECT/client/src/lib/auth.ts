import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export type SessionUser = {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  locale: string;
  facilityId: string | null;
};

export type Role = "ADMIN" | "DOCTOR" | "HEALTH_WORKER" | "FACILITY_STAFF" | "PATIENT";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "default-secret-for-dev");

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function login(username: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  const sessionUser: SessionUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    locale: user.locale,
    facilityId: user.facilityId,
  };

  const token = await new SignJWT(sessionUser)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return sessionUser;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
