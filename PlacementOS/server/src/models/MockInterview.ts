import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobRole: String,
  difficulty: String,
  interviewType: String,
  totalQuestions: Number,
  qna: [{
    question: String,
    category: String,
    userAnswer: String,
    ideaAnswer: String,
    feedback: String,
    score: Number
  }],
  finalScore: Number,
  performance: {
    communication: Number,
    technicalAccuracy: Number,
    confidence: Number,
    answerStructure: Number,
    problemSolving: Number
  },
  strengths: [String],
  improvements: [String],
  verdict: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
