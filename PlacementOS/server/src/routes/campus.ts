import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { CampusRecord } from '../models/CampusRecord.js';

const router = express.Router();

// Add new campus record
router.post('/add', requireAuth, async (req: any, res) => {
  try {
    const record = new CampusRecord({
      ...req.body,
      userId: req.user._id
    });
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Add campus record error:', error);
    res.status(500).json({ message: 'Server error adding record' });
  }
});

// Get all records for a specific college (Public/Protected info sharing)
router.get('/:college', requireAuth, async (req: any, res) => {
  try {
    const records = await CampusRecord.find({ 
      college: new RegExp(req.params.college, 'i') 
    }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching records' });
  }
});

// Edit a campus record (only author can edit)
router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const record = await CampusRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found or unauthorized' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating record' });
  }
});

// Delete a campus record (only author can delete)
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const record = await CampusRecord.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ message: 'Record not found or unauthorized' });
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting record' });
  }
});

export const campusRoutes = router;
