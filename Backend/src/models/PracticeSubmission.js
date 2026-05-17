import mongoose from 'mongoose';

// =====================================
// Sub-schema: one attempt per question
// =====================================
const questionAttemptSchema = new mongoose.Schema(
  {
    // Index 0-9 within the session
    questionIndex: { type: Number, required: true },

    // Full question text
    question: { type: String, required: true },

    // "CODING" | "MCQ"
    type: { type: String, enum: ['CODING', 'MCQ'], required: true },

    // MCQ fields
    options: [{ type: String }],
    correctAnswer: { type: String },
    selectedAnswer: { type: String },

    // Coding fields — only populated for CODING questions
    code: { type: String, default: '' },
    language: { type: String, default: 'python3' },
    output: { type: String, default: '' },
  },
  { _id: false }
);

// =====================================
// Main schema
// =====================================
const practiceSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Domain the user practised (e.g. "Python", "React Basics")
    domain: { type: String, required: true },

    // Difficulty chosen on the domain selector
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },

    // All 10 question attempts
    attempts: {
      type: [questionAttemptSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A session can have at most 10 attempts.',
      },
    },

    // Overall AI review for the whole session (generated on final submit)
    aiReview: { type: String, default: '' },

    // Quick stats — computed before saving
    totalQuestions: { type: Number, default: 10 },
    correctMCQ: { type: Number, default: 0 },
    attemptedCoding: { type: Number, default: 0 },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('PracticeSubmission', practiceSubmissionSchema);