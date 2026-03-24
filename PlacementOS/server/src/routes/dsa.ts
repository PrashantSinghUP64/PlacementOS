import express from 'express';
import DSAProblem from '../models/DSAProblem.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth as any);

// Add a solved problem
router.post('/add', async (req: any, res: any) => {
  try {
    const { name, platform, difficulty, topic, status, timeTaken, notes, date } = req.body;
    
    const problem = new DSAProblem({
      userId: req.user.userId,
      name,
      platform,
      difficulty,
      topic,
      status,
      timeTaken: Number(timeTaken) || 0,
      notes,
      date: date || new Date()
    });
    
    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    console.error("Add DSA problem error:", error);
    res.status(500).json({ message: 'Server error saving problem' });
  }
});

// Get user's problems
router.get('/', async (req: any, res: any) => {
  try {
    const problems = await DSAProblem.find({ userId: req.user.userId })
                                     .sort({ date: -1 });
    res.status(200).json(problems);
  } catch (error) {
    console.error("Get DSA problems error:", error);
    res.status(500).json({ message: 'Server error retrieving problems' });
  }
});

// Delete a problem
router.delete('/:id', async (req: any, res: any) => {
  try {
    await DSAProblem.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.status(200).json({ message: 'Problem deleted' });
  } catch (error) {
    console.error("Delete DSA problem error:", error);
    res.status(500).json({ message: 'Server error deleting problem' });
  }
});

// Get comprehensive stats for charts
router.get('/stats', async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const totalSolved = await DSAProblem.countDocuments({ userId, status: 'Solved' });
    const difficultyDistribution = await DSAProblem.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(userId), status: 'Solved' } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]);
    
    const topicDistribution = await DSAProblem.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(userId), status: 'Solved' } },
      { $group: { _id: "$topic", count: { $sum: 1 } } }
    ]);

    // Very basic streak calculation placeholder
    // In production, would require complex timezone-aware queries
    // Returning dummy streak for UI purposes until deeper logic is requested
    res.status(200).json({
      totalSolved,
      difficulties: difficultyDistribution,
      topics: topicDistribution,
      currentStreak: totalSolved > 0 ? 1 : 0, 
      bestStreak: totalSolved > 0 ? 1 : 0
    });
  } catch (error) {
    console.error("Get DSA stats error:", error);
    res.status(500).json({ message: 'Server error retrieving stats' });
  }
});

export default router;
