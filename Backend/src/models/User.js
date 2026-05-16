import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    picture: {
      type: String,
      default: "",
    },

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,
    emailVerifyExpires: Date,

    // 2FA
    twoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },

    // ── Profile fields (add these to your existing userSchema) ──
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    profilePhoto: { type: String, default: "" }, // local path or URL
    resumeUrl: { type: String, default: "" },
    resumeOriginalName: { type: String, default: "" },
    education: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        degree: { type: String, default: "" },
        institution: { type: String, default: "" },
        university: { type: String, default: "" },
        year: { type: String, default: "" },
        cgpa: { type: String, default: "" },
        current: { type: Boolean, default: false },
        docs: [
          {
            _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
            name: { type: String },
            path: { type: String },
            size: { type: String },
          }
        ],
      }
    ],
    // ── KYC / Setup form fields ──────────────────────────────────────────────────
    dob: { type: String, default: "" },
    nationality: { type: String, default: "" },
    address: {
      state: { type: String, default: "" },
      district: { type: String, default: "" },
      pin: { type: String, default: "" },
      locality: { type: String, default: "" },
      postOffice: { type: String, default: "" },
    },
    aadhaarNumber: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    aadhaarDoc: {
      name: { type: String, default: "" },
      path: { type: String, default: "" },
      size: { type: String, default: "" },
    },
    panDoc: {
      name: { type: String, default: "" },
      path: { type: String, default: "" },
      size: { type: String, default: "" },
    },
    profileComplete: { type: Boolean, default: false },

  },
  { timestamps: true }
);

// Hash password before saving
// New — return a promise, no next() needed
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerifyToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerifyToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

const User = mongoose.model("User", userSchema);
export default User;