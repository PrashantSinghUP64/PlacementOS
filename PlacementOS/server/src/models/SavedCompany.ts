import mongoose from 'mongoose';

const savedCompanySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyName: { type: String, required: true },
  researchData: {
    type: String, // Stored as stringified JSON from AI
    required: true,
  },
  savedAt: { type: Date, default: Date.now }
});

// Ensure a user can only save a specific company once (optional, but good practice)
savedCompanySchema.index({ userId: 1, companyName: 1 }, { unique: true });

export default mongoose.model('SavedCompany', savedCompanySchema);
