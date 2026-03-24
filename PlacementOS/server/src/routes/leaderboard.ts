import express from 'express';
import Leaderboard from '../models/Leaderboard.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth as any);

// Opt-in / update leaderboard entry
router.post('/join', async (req: any, res: any) => {
  try {
    const { name, college, bestScore, totalAnalyses, isPublic } = req.body;
    
    let entry = await Leaderboard.findOne({ userId: req.user.userId });
    
    if (entry) {
      if (name) entry.name = name;
      if (college) entry.college = college;
      if (bestScore && bestScore > entry.bestScore) entry.bestScore = bestScore;
      if (totalAnalyses) entry.totalAnalyses = totalAnalyses;
      if (isPublic !== undefined) entry.isPublic = isPublic;
      await entry.save();
    } else {
      entry = new Leaderboard({
        userId: req.user.userId,
        name: name || "Anonymous User",
        college: college || "Unknown College",
        bestScore: bestScore || 0,
        totalAnalyses: totalAnalyses || 0,
        isPublic: isPublic !== undefined ? isPublic : true
      });
      await entry.save();
    }
    
    res.status(200).json(entry);
  } catch (error) {
    console.error("Leaderboard join error:", error);
    res.status(500).json({ message: 'Server error updating leaderboard status' });
  }
});

// Get leaderboard Data (Global or by College)
router.get('/', async (req: any, res: any) => {
  try {
    const { college, filter } = req.query; // filter can be 'all', 'month', 'week'
    let query: any = { isPublic: true };
    
    if (college && college !== 'All') {
      // Basic case-insensitive matching
      query.college = { $regex: new RegExp(`^${college}$`, 'i') };
    }

    if (filter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.updatedAt = { $gte: oneWeekAgo };
    } else if (filter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query.updatedAt = { $gte: oneMonthAgo };
    }

    const leaderboard = await Leaderboard.find(query)
                                         .sort({ bestScore: -1 })
                                         .limit(100)
                                         .lean();
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// Get specific user ranking
router.get('/rank', async (req: any, res: any) => {
  try {
    const userEntry = await Leaderboard.findOne({ userId: req.user.userId });
    if (!userEntry) return res.status(200).json(null);

    // Calculate rank in same college
    const collegeRank = await Leaderboard.countDocuments({
      college: userEntry.college,
      isPublic: true,
      bestScore: { $gt: userEntry.bestScore }
    });

    const totalInCollege = await Leaderboard.countDocuments({ college: userEntry.college, isPublic: true });
    
    // Average score at college
    const avgData = await Leaderboard.aggregate([
      { $match: { college: userEntry.college, isPublic: true } },
      { $group: { _id: null, avgScore: { $avg: "$bestScore" } } }
    ]);
    const avgScore = avgData.length > 0 ? Math.round(avgData[0].avgScore) : 0;

    res.status(200).json({
      entry: userEntry,
      rank: collegeRank + 1,
      totalStudents: totalInCollege,
      avgScore
    });
  } catch (error) {
    console.error("Get rank error:", error);
    res.status(500).json({ message: 'Server error calculating rank' });
  }
});

export default router;
