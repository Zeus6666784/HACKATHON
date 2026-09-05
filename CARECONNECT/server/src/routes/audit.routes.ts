import { Router } from "express";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { AuditLog } from "../models/AuditLog";

const router = Router();
router.use(requireAuth, requireRoles("ADMIN"));

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "fullName role");
    res.json({ success: true, data: logs });
  } catch (e) { next(e); }
});

export default router;
