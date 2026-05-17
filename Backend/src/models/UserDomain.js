import mongoose from "mongoose";

const userDomainSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    category: {
      type: String,
      required: true, // e.g., "Web Development"
    },
    topic: {
      type: String,
      required: true, // e.g., "React", "Node.js"
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    selectedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0, // 0-100
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent same user picking same topic+difficulty twice
userDomainSchema.index(
  { userId: 1, domainId: 1, topic: 1, difficulty: 1 },
  { unique: true }
);

export default mongoose.model("UserDomain", userDomainSchema);