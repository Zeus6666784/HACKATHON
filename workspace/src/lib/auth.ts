import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { COOKIE_NAME, SESSION_HOURS, type Role } from "./constants";
import { writeAudit } from "./audit";

export type SessionUser = {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  locale: string;
  facilityId: string | null;
};

function secret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short");
  }
  return new TextEncoder().encode(raw);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    uid: user.id,
    role: user.role,
    name: user.fullName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const uid = String(payload.uid ?? "");
    if (!uid) return null;
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as Role,
      locale: user.locale,
      facilityId: user.facilityId,
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    const err = new Error("UNAUTHENTICATED");
    throw err;
  }
  return session;
}

export function canRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const session: SessionUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role as Role,
    locale: user.locale,
    facilityId: user.facilityId,
  };
  await createSession(session);
  await writeAudit({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    detail: username,
  });
  return session;
}
