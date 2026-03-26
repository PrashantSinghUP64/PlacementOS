import mongoose from 'mongoose';

const referralProviderSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  company: { type: String, required: true, index: true },
  role: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  college: { type: String, required: true, index: true }, // For alumni matching
  rolesReferredFor: [String],
  maxReferralsPerMonth: { type: Number, default: 3 },
  currentReferralsThisMonth: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  totalReferralsGiven: { type: Number, default: 0 },
  responseRate: { type: Number, default: 100 }, // Percentage
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ReferralProvider', referralProviderSchema);
