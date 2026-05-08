import mongoose from 'mongoose';

const practiceSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  questionId: Number,

  questionTitle: { type: String },
  code: { type: String, required: true },
  language: { type: String, default: 'python' },
  output: { type: String },
  aiReview: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('PracticeSubmission', practiceSubmissionSchema);