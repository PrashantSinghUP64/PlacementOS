import mongoose from 'mongoose';

const campusRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  college: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  role: String,
  package: Number, // in LPA
  studentsSelected: Number,
  visitDate: Date,
  companyType: {
    type: String,
    enum: ['Service', 'Product', 'Startup', 'MAANG'],
    required: true
  },
  process: String,
  eligibility: String,
  notes: String,
  year: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const CampusRecord = mongoose.model('CampusRecord', campusRecordSchema);
