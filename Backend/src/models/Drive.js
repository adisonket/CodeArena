import mongoose from "mongoose";

const driveSchema = new mongoose.Schema({
  driveId: { type: String, required: true, unique: true },
  hiringPositionName: { type: String, required: true },
  driveDate: { type: Date, required: true },
  driveType: { type: String, enum: ["Assessment", "Interview"], required: true },
  timeDurationInMin: { type: Number, required: true },
  mcqCount: { type: Number, default: 0 },
  codeCount: { type: Number, default: 0 },
  mcqMarks: { type: Number, default: 0 },
  codeMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 }
}, { timestamps: true });

driveSchema.pre("save", async function () {
  if (this.driveType === "Assessment") {
    this.totalMarks = (this.mcqCount * this.mcqMarks) + (this.codeCount * this.codeMarks);
  } else {
    this.totalMarks = 0;
  }
});

export default mongoose.model("Drive", driveSchema);