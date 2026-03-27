import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IActivityHistory extends Document {
  userId: string;
  featureType: string;
  title: string;
  result: string;
  createdAt: Date;
  updatedAt: Date;
}

const activityHistorySchema = new Schema<IActivityHistory>(
  {
    userId: { type: String, required: true, index: true },
    featureType: { type: String, required: true },
    title: { type: String, required: true },
    result: { type: String, required: true },
  },
  { timestamps: true }
);

export const ActivityHistory = mongoose.model<IActivityHistory>("ActivityHistory", activityHistorySchema);
