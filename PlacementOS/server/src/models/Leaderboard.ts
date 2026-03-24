import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  college: { type: String, required: true, index: true },
  bestScore: { type: Number, default: 0, index: -1 },
  totalAnalyses: { type: Number, default: 0 },
  badge: { type: String, default: 'Beginner' },
  isPublic: { type: Boolean, default: true },
  streak: { type: Number, default: 0 },
  lastAnalysisDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to automatically calculate badge before saving
leaderboardSchema.pre('save', function(next: any) {
  if (this.isModified('bestScore') || this.isModified('streak') || this.isModified('totalAnalyses')) {
    if (this.bestScore >= 91) this.badge = 'Expert';
    else if (this.bestScore >= 76) this.badge = 'Pro';
    else if (this.bestScore >= 61) this.badge = 'Advanced';
    else if (this.bestScore >= 41) this.badge = 'Intermediate';
    else this.badge = 'Beginner';

    // Override with diamond or fire if applicable
    if (this.streak >= 7) this.badge = '🔥 On Fire';
    else if (this.totalAnalyses >= 10 && this.bestScore >= 80) this.badge = '💎 Diamond';
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Leaderboard', leaderboardSchema);
