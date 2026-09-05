import { Router } from "express";
import { z } from "zod";
import { AuthRequest, requireAuth, requireRoles } from "../middleware/auth";
import { createConversation, getConversation, listConversations } from "../services/memory.service";
import { ingestRAGDocument, retrieveRAG } from "../services/rag.service";
import { runAssistant } from "../services/ai.service";

const router = Router();
router.use(requireAuth);

router.get("/conversations", async (req: AuthRequest, res, next) => {
  try { res.json({ success: true, data: await listConversations(req.user!.id) }); } catch (error) { next(error); }
});

router.post("/conversations", async (req: AuthRequest, res, next) => {
  try {
    const body = z.object({ patientId: z.string().optional(), referralId: z.string().optional() }).parse(req.body);
    const conversation = await createConversation(req.user!.id, body.patientId, body.referralId);
    res.status(201).json({ success: true, data: { conversationId: conversation.id } });
  } catch (error) { next(error); }
});

router.get("/conversations/:id", async (req: AuthRequest, res, next) => {
  try {
    const conversation = await getConversation(req.user!.id, String(req.params.id));
    if (!conversation) return res.status(404).json({ success: false, error: "Conversation not found" });
    res.json({ success: true, data: conversation });
  } catch (error) { next(error); }
});

router.post("/chat", requireRoles("HEALTH_WORKER", "DOCTOR"), async (req: AuthRequest, res, next) => {
  try {
    const body = z.object({ message: z.string().min(1).max(6000), conversationId: z.string().optional(), patientId: z.string().optional(), referralId: z.string().optional() }).parse(req.body);
    res.json({ success: true, data: await runAssistant({ ...body, userId: req.user!.id }) });
  } catch (error) { next(error); }
});

router.post("/rag/ingest", requireRoles("ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const body = z.object({ source: z.string().min(1), content: z.string().min(1), approved: z.boolean().default(false) }).parse(req.body);
    const document = await ingestRAGDocument(body.source, body.content, body.approved);
    res.status(201).json({ success: true, data: { documentId: document.id } });
  } catch (error) { next(error); }
});

router.post("/rag/retrieve", requireRoles("HEALTH_WORKER", "DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const body = z.object({ query: z.string().min(1), limit: z.number().int().positive().max(10).default(4) }).parse(req.body);
    res.json({ success: true, data: await retrieveRAG(body.query, body.limit) });
  } catch (error) { next(error); }
});

export default router;