import { Router } from "express";
import Job from "../models/Job.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ==========================================
// 1. GET /api/jobs
// Get all jobs (with optional filters)
// ==========================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const { category, jobType, search } = req.query;

    let query: any = {};

    if (category && category !== "All") {
      query.category = category;
    }
    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    // Sort by deadline ascending (nearest deadlines first)
    // Only show jobs where deadline is in the future or null
    const now = new Date();
    query.$or = [{ deadline: { $gte: now } }, { deadline: null }];

    const jobs = await Job.find(query).sort({ deadline: 1, createdAt: -1 }).limit(50);

    res.json(jobs);
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    res.status(500).json({ message: "Server error fetching jobs" });
  }
});

// ==========================================
// 2. GET /api/jobs/saved
// Get jobs bookmarked by the user
// ==========================================
router.get("/saved", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const savedJobs = await Job.find({ bookmarkedBy: userId }).sort({ deadline: 1 });
    res.json(savedJobs);
  } catch (error: any) {
    console.error("Fetch saved jobs error:", error);
    res.status(500).json({ message: "Server error fetching saved jobs" });
  }
});

// ==========================================
// 3. POST /api/jobs/:id/bookmark
// Toggle bookmark status for a job
// ==========================================
router.post("/:id/bookmark", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const hasBookmarked = job.bookmarkedBy.includes(userId);

    if (hasBookmarked) {
      job.bookmarkedBy = job.bookmarkedBy.filter((id) => id.toString() !== userId);
    } else {
      job.bookmarkedBy.push(userId);
    }

    await job.save();
    res.json({ message: hasBookmarked ? "Removed from saved" : "Job saved successfully", job });
  } catch (error: any) {
    console.error("Bookmark job error:", error);
    res.status(500).json({ message: "Server error bookmarking job" });
  }
});

// ==========================================
// 4. POST /api/jobs/:id/apply
// Mark a job as applied
// ==========================================
router.post("/:id/apply", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!job.appliedBy.includes(userId)) {
      job.appliedBy.push(userId);
      await job.save();
    }

    res.json({ message: "Marked as applied", job });
  } catch (error: any) {
    console.error("Apply job error:", error);
    res.status(500).json({ message: "Server error applying to job" });
  }
});

// ==========================================
// 5. POST /api/jobs
// Create a new job (For Admin/Scraper Agent to populate DB)
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { companyName, roleType, deadline, skills, location, description, url, salary, source, category, jobType } = req.body;

    const newJob = new Job({
      companyName,
      roleType,
      deadline,
      skills,
      location,
      description,
      url,
      salary,
      source,
      category: category || "Other",
      jobType: jobType || "Off-Campus",
    });

    await newJob.save();
    res.status(201).json({ message: "Job created successfully", job: newJob });
  } catch (error: any) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error creating job" });
  }
});

export default router;
