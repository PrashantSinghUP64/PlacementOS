import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { MockInterview } from '../models/MockInterview.js';

const router = express.Router();

// Save new mock interview
router.post('/save', requireAuth, async (req: any, res) => {
  try {
    const interview = new MockInterview({
      ...req.body,
      userId: req.user._id
    });
    const saved = await interview.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Save mock interview error:', error);
    res.status(500).json({ message: 'Server error saving interview' });
  }
});

// Get user's mock interviews
router.get('/history', requireAuth, async (req: any, res) => {
  try {
    const history = await MockInterview.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

export const mockInterviewRoutes = router;
