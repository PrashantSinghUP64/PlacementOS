import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

const router = Router();

// GET /profile — get current user profile
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    targetRole: user.targetRole || "",
    skills: user.skills || [],
    totalAnalyses: user.totalAnalyses || 0,
  });
});

// PUT /profile — update profile
router.put("/", requireAuth, async (req: AuthRequest, res) => {
  const { name, targetRole, skills } = req.body as {
    name?: string;
    targetRole?: string;
    skills?: string[];
  };

  const update: Record<string, unknown> = {};
  if (name) update.name = name.trim();
  if (targetRole !== undefined) update.targetRole = targetRole.trim();
  if (Array.isArray(skills)) update.skills = skills.map((s) => s.trim()).filter(Boolean);

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    targetRole: user.targetRole || "",
    skills: user.skills || [],
    totalAnalyses: user.totalAnalyses || 0,
  });
});

// PUT /profile/password — change password
router.put("/password", requireAuth, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.json({ message: "Password updated successfully" });
});

export default router;
