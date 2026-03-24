import mongoose, { Schema } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  targetRole?: string;
  skills?: string[];
  totalAnalyses?: number;
  // OTP fields for password reset
  resetOtpHash?: string;
  resetOtpExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    targetRole: { type: String, default: "" },
    skills: { type: [String], default: [] },
    totalAnalyses: { type: Number, default: 0 },
    resetOtpHash: { type: String, select: false }, // excluded from normal queries for security
    resetOtpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
