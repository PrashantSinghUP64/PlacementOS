import mongoose, { Schema, Types } from "mongoose";

export interface IDimensions {
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keywordsMatch: number;
  toneStyle: number;
}

export interface IAnalysis {
  userId: string;
  resumeText: string;
  jobDescription: string;
  jobTitle?: string;
  atsScore: number;
  dimensions: IDimensions;
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  recommendations: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    resumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },
    jobTitle: { type: String, default: "" },
    atsScore: { type: Number, required: true },
    dimensions: {
      skillsMatch: { type: Number, required: true },
      experienceMatch: { type: Number, required: true },
      educationMatch: { type: Number, required: true },
      keywordsMatch: { type: Number, required: true },
      toneStyle: { type: Number, required: true },
    },
    missingKeywords: [{ type: String }],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    suggestions: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

export const Analysis = mongoose.model<IAnalysis>("Analysis", analysisSchema);
