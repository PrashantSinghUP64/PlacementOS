import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { SkillGap } from '../models/SkillGap.js';

const router = express.Router();

// Save new skill gap analysis
router.post('/save', requireAuth, async (req: any, res) => {
  try {
    const analysis = new SkillGap({
      ...req.body,
      userId: req.user._id
    });
    const saved = await analysis.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Save skill gap error:', error);
    res.status(500).json({ message: 'Server error saving skill gap analysis' });
  }
});

// Get user's skill gap analyses
router.get('/history', requireAuth, async (req: any, res) => {
  try {
    const history = await SkillGap.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

export const skillGapRoutes = router;
