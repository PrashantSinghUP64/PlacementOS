import express from 'express';
import Roadmap from '../models/Roadmap.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth as any);

// Save generated roadmap
router.post('/save', async (req: any, res: any) => {
  try {
    const { targetRole, targetCompany, targetPackage, currentSkills, duration, dailyHours, roadmapData } = req.body;
    
    // Check if user already has a roadmap, update it or create new
    let roadmap = await Roadmap.findOne({ userId: req.user.userId });
    
    if (roadmap) {
      roadmap.targetRole = targetRole;
      roadmap.targetCompany = targetCompany;
      roadmap.targetPackage = targetPackage;
      roadmap.currentSkills = currentSkills;
      roadmap.duration = duration;
      roadmap.dailyHours = dailyHours;
      roadmap.title = roadmapData.title;
      roadmap.totalWeeks = roadmapData.totalWeeks;
      roadmap.keyMilestones = roadmapData.keyMilestones;
      roadmap.phases = roadmapData.phases;
      roadmap.overallProgress = 0;
      roadmap.updatedAt = new Date();
      await roadmap.save();
    } else {
      roadmap = new Roadmap({
        userId: req.user.userId,
        targetRole,
        targetCompany,
        targetPackage,
        currentSkills,
        duration,
        dailyHours,
        title: roadmapData.title,
        totalWeeks: roadmapData.totalWeeks,
        keyMilestones: roadmapData.keyMilestones,
        phases: roadmapData.phases
      });
      await roadmap.save();
    }
    
    res.status(200).json(roadmap);
  } catch (error) {
    console.error("Save roadmap error:", error);
    res.status(500).json({ message: 'Server error saving roadmap' });
  }
});

// Get user's active roadmap
router.get('/', async (req: any, res: any) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user.userId });
    res.status(200).json(roadmap);
  } catch (error) {
    console.error("Get roadmap error:", error);
    res.status(500).json({ message: 'Server error retrieving roadmap' });
  }
});

// Update topic completion status
router.put('/progress', async (req: any, res: any) => {
  try {
    const { phaseIndex, weekIndex, topicIndex, completed } = req.body;
    
    const roadmap = await Roadmap.findOne({ userId: req.user.userId });
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });

    // Update the specific topic's completion status
    if (roadmap.phases[phaseIndex]?.weeks[weekIndex]?.topics[topicIndex]) {
       roadmap.phases[phaseIndex].weeks[weekIndex].topics[topicIndex].completed = completed;
    }

    // Recalculate total progress
    let totalTopics = 0;
    let completedTopics = 0;
    
    roadmap.phases.forEach((p: any) => {
      p.weeks.forEach((w: any) => {
        w.topics.forEach((t: any) => {
          totalTopics++;
          if (t.completed) completedTopics++;
        });
      });
    });

    roadmap.overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    roadmap.updatedAt = new Date();
    
    await roadmap.save();
    res.status(200).json(roadmap);
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: 'Server error updating progress' });
  }
});

export default router;
