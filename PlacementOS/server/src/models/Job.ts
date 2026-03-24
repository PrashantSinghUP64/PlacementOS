import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  companyName: string;
  roleType: string;
  deadline: Date | null;
  skills: string[];
  location: string;
  description?: string;
  url: string;
  salary?: string;
  source: string; // e.g., 'LinkedIn', 'Unstop', 'Internshala'
  category: "SDE" | "Analyst" | "Design" | "Marketing" | "Other";
  jobType: "On-Campus" | "Off-Campus" | "Internship";
  bookmarkedBy: mongoose.Types.ObjectId[];
  appliedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    companyName: { type: String, required: true },
    roleType: { type: String, required: true },
    deadline: { type: Date, default: null },
    skills: { type: [String], default: [] },
    location: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    salary: { type: String },
    source: { type: String, required: true },
    category: {
      type: String,
      enum: ["SDE", "Analyst", "Design", "Marketing", "Other"],
      default: "Other",
    },
    jobType: {
      type: String,
      enum: ["On-Campus", "Off-Campus", "Internship"],
      required: true,
    },
    bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    appliedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Optional: Index for faster search and filtering
JobSchema.index({ companyName: "text", roleType: "text", skills: "text" });

export default mongoose.model<IJob>("Job", JobSchema);
