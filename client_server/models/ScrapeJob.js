import mongoose from 'mongoose';

const ScrapeJobSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  jobCount: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  metadata: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// Add index for faster queries
ScrapeJobSchema.index({ createdAt: -1 });
ScrapeJobSchema.index({ status: 1 });

export default mongoose.models.ScrapeJob || mongoose.model('ScrapeJob', ScrapeJobSchema);
