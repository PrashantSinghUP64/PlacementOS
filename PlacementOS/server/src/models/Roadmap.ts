import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  targetRole: String,
  targetCompany: String,
  targetPackage: String,
  currentSkills: [String],
  duration: String,
  dailyHours: Number,
  title: String,
  totalWeeks: Number,
  keyMilestones: [String],
  phases: [{
    phase: Number,
    name: String,
    duration: String,
    weeks: [{
      week: Number,
      theme: String,
      hours: Number,
      milestone: String,
      topics: [{
        name: String,
        hours: Number,
        youtubeLink: String,
        docLink: String,
        practice: String,
        completed: { type: Boolean, default: false }
      }]
    }]
  }],
  overallProgress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Roadmap', roadmapSchema);
