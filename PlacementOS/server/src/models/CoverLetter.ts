import mongoose, { Document, Schema } from "mongoose";

export interface ICoverLetter extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  jobDescription: string;
  resumeText: string;
  content: string;
  tone: string;
  wordCount: number;
  createdAt: Date;
}

const CoverLetterSchema = new Schema<ICoverLetter>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, required: true },
  jobDescription: { type: String, required: true },
  resumeText: { type: String, required: true },
  content: { type: String, required: true },
  tone: { type: String, required: true },
  wordCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const CoverLetter = mongoose.model<ICoverLetter>("CoverLetter", CoverLetterSchema);
