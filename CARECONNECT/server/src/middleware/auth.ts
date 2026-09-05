import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type Role = "ADMIN" | "DOCTOR" | "HEALTH_WORKER" | "FACILITY_STAFF";

export interface AuthRequest extends Request {
  user?: { id: string; role: Role; facilityId?: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ success: false, error: "Authentication required" });

  try {
    console.log("Verifying token:", token);
    req.user = jwt.verify(token, env.jwtSecret) as AuthRequest["user"];
    next();
  } catch (e) {
    console.error("JWT Verify Error:", e);
    return res.status(401).json({ success: false, error: "Invalid or expired session" });
  }
}

export function requireRoles(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "You are not authorized for this action" });
    }
    next();
  };
}
