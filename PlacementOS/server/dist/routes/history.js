import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Analysis } from "../models/Analysis.js";
const router = Router();
router.get("/", requireAuth, async (req, res) => {
    const history = await Analysis.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .select("atsScore dimensions recommendations createdAt")
        .limit(50);
    return res.json(history);
});
export default router;
