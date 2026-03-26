import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  currentSkills: [String],
  dreamJob: String,
  dreamCompany: String,
  experienceLevel: String,
  readinessScore: Number,
  matchingSkills: [String],
  missingSkills: [{
    skill: String,
    priority: String,
    reason: String
  }],
  skillsToImprove: [{
    skill: String,
    currentLevel: String,
    targetLevel: String,
    tip: String
  }],
  learningPlan: {
    week1: [{ topic: String, resource: String, hours: Number }],
    week2: [{ topic: String, resource: String, hours: Number }],
    week3: [{ topic: String, resource: String, hours: Number }],
    week4: [{ topic: String, resource: String, hours: Number }]
  },
  companyInsights: {
    interviewProcess: String,
    focusTopics: [String],
    difficulty: String,
    tips: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const SkillGap = mongoose.model('SkillGap', skillGapSchema);
