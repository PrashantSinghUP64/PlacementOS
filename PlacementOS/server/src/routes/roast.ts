import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Roast } from '../models/Roast.js';

const router = express.Router();

// Save new roast
router.post('/save', requireAuth, async (req: any, res) => {
  try {
    const roast = new Roast({
      ...req.body,
      userId: req.user._id
    });
    const saved = await roast.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Save roast error:', error);
    res.status(500).json({ message: 'Server error saving roast' });
  }
});

// Get user's roasts
router.get('/history', requireAuth, async (req: any, res) => {
  try {
    const history = await Roast.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

export const roastRoutes = router;
