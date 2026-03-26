import mongoose from 'mongoose';

const roastSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  overallScore: Number,
  overallVerdict: String,
  categories: {
    firstImpression: { score: Number, roast: String },
    skills: { score: Number, roast: String },
    experience: { score: Number, roast: String },
    projects: { score: Number, roast: String },
    formatting: { score: Number, roast: String },
    impact: { score: Number, roast: String }
  },
  brutalPoints: [String],
  fixes: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Roast = mongoose.model('Roast', roastSchema);
