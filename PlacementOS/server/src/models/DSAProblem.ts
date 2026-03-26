import mongoose from 'mongoose';

const dsaProblemSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  platform: { type: String, required: true }, // LeetCode, GFG, HackerRank
  difficulty: { type: String, required: true }, // Easy, Medium, Hard
  topic: { type: String, required: true }, // Array, String, DP, etc
  status: { type: String, required: true }, // Solved, Attempted, Revisit
  timeTaken: { type: Number, default: 0 }, // in minutes
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now, index: true }, // Solved timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('DSAProblem', dsaProblemSchema);
