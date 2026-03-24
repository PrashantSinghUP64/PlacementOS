import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { JobApplication } from '../models/JobApplication.js';

const router = express.Router();

// Add new job application
router.post('/add', requireAuth, async (req: any, res) => {
  try {
    const job = new JobApplication({
      ...req.body,
      userId: req.user._id
    });
    const saved = await job.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Add job error:', error);
    res.status(500).json({ message: 'Server error adding job application' });
  }
});

// Get user's job applications
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const jobs = await JobApplication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Update a job application
router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating job' });
  }
});

// Delete a job application
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const job = await JobApplication.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting job' });
  }
});

export const jobTrackerRoutes = router;
