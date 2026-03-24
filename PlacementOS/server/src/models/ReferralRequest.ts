import mongoose from 'mongoose';

const referralRequestSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReferralProvider', required: true },
  requesterName: { type: String, required: true },
  requesterEmail: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  targetRole: { type: String, required: true },
  message: { type: String, required: true, maxlength: 500 },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Declined'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Avoid spamming the same provider
referralRequestSchema.index({ fromUserId: 1, toProviderId: 1 }, { unique: true });

export default mongoose.model('ReferralRequest', referralRequestSchema);
