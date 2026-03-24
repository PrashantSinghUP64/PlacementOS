import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/", requireAuth, async (_req, res) => {
    return res.json([
        {
            id: "job-1",
            title: "Frontend Developer (React)",
            company: "Acme Labs",
            location: "Remote",
            matchScore: 82,
        },
        {
            id: "job-2",
            title: "Full Stack Engineer (Node + React)",
            company: "Nova Systems",
            location: "Bengaluru",
            matchScore: 79,
        },
    ]);
});
export default router;
