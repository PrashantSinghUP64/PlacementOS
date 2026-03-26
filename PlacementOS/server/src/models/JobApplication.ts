import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobUrl: String,
  appliedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offered', 'Rejected'],
    default: 'Applied'
  },
  salary: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
