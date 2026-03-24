import mongoose, { Schema } from "mongoose";
const analysisSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },
    atsScore: { type: Number, required: true },
    dimensions: {
        formatting: { type: Number, required: true },
        keywords: { type: Number, required: true },
        experience: { type: Number, required: true },
        skills: { type: Number, required: true },
        impact: { type: Number, required: true },
    },
    recommendations: [{ type: String, required: true }],
}, { timestamps: true });
export const Analysis = mongoose.model("Analysis", analysisSchema);
