import mongoose, { Document, Schema } from "mongoose";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  college: string;
  year: string;
  cgpa: string;
}

interface Project {
  name: string;
  description: string;
  techStack: string;
  githubUrl: string;
}

export interface IResumeBuilder extends Document {
  userId: mongoose.Types.ObjectId;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeBuilderSchema = new Schema<IResumeBuilder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    personalInfo: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    experience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
        description: { type: String },
      },
    ],
    education: [
      {
        degree: { type: String },
        college: { type: String },
        year: { type: String },
        cgpa: { type: String },
      },
    ],
    skills: [{ type: String }],
    projects: [
      {
        name: { type: String },
        description: { type: String },
        techStack: { type: String },
        githubUrl: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const ResumeBuilder = mongoose.model<IResumeBuilder>("ResumeBuilder", ResumeBuilderSchema);
