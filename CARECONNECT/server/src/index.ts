import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";
import facilityRoutes from "./routes/facility.routes";
import triageRoutes from "./routes/triage.routes";
import referralRoutes from "./routes/referral.routes";
import auditRoutes from "./routes/audit.routes";
import { notFound, errorHandler } from "./middleware/error";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => res.json({ success: true, data: { service: "careconnect-server", status: "ok" } }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/facilities", facilityRoutes);
app.use("/api/v1/triage", triageRoutes);
app.use("/api/v1/referrals", referralRoutes);
app.use("/api/v1/audit", auditRoutes);

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));

app.use(notFound);
app.use(errorHandler);

mongoose.connect(env.mongoUri)
  .then(() => {
    app.listen(env.port, () => console.log(`CareConnect API running on http://localhost:${env.port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
