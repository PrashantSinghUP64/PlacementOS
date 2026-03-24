import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Analysis } from "../models/Analysis.js";
const router = Router();
router.post("/", requireAuth, async (req, res) => {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
        return res.status(400).json({ message: "resumeText and jobDescription are required" });
    }
    // Placeholder ATS logic for day-1 backend scaffold.
    const dimensions = {
        formatting: 74,
        keywords: 68,
        experience: 80,
        skills: 72,
        impact: 66,
    };
    const atsScore = Math.round((dimensions.formatting +
        dimensions.keywords +
        dimensions.experience +
        dimensions.skills +
        dimensions.impact) /
        5);
    const recommendations = [
        "Increase role-specific keyword density in summary and recent experience.",
        "Use quantified achievements in each experience bullet.",
        "Add a dedicated technical skills section tailored to target job description.",
    ];
    const analysis = await Analysis.create({
        userId: req.userId,
        resumeText,
        jobDescription,
        atsScore,
        dimensions,
        recommendations,
    });
    return res.status(201).json({
        id: analysis.id,
        atsScore,
        dimensions,
        recommendations,
        createdAt: analysis.createdAt,
    });
});
export default router;
