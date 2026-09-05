import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User";
import { env } from "../config/env";

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN", "DOCTOR", "HEALTH_WORKER", "FACILITY_STAFF"]).optional()
});

router.post("/signup", async (req, res, next) => {
  try {
    const data = authSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ success: false, error: "Email already registered" });

    const password = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      email: data.email,
      password,
      name: data.name ?? "User",
      role: data.role ?? "HEALTH_WORKER"
    });

    res.status(201).json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = authSchema.pick({ email: true, password: true }).parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, facilityId: user.facilityId }, env.jwtSecret, { expiresIn: "8h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: env.nodeEnv === "production" });
    res.json({ success: true, data: { id: user.id, name: user.name, role: user.role } });
  } catch (e) { next(e); }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ success: true, data: null });
});

export default router;
