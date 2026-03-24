import mongoose, { Document, Schema } from "mongoose";

interface Question {
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  jobRole: string;
  resumeText: string;
  questions: {
    technical: Question[];
    behavioral: Question[];
    projectBased: Question[];
    hr: Question[];
  };
  createdAt: Date;
}

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
});

const InterviewSchema = new Schema<IInterview>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  jobRole: { type: String, required: true },
  resumeText: { type: String, required: true },
  questions: {
    technical: [QuestionSchema],
    behavioral: [QuestionSchema],
    projectBased: [QuestionSchema],
    hr: [QuestionSchema],
  },
  createdAt: { type: Date, default: Date.now },
});

export const Interview = mongoose.model<IInterview>("Interview", InterviewSchema);
