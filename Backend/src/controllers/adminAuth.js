import Admin from "../models/Admin.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail, otpEmailHTML } from "../utils/sendEmail.js";// reuse your existing util

// ── Step 1: Verify email + password → send OTP ────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    const match = await admin.comparePassword(password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = await bcrypt.hash(otp, 10);

    // Remove old OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP (expires in 10 min)
    await OTP.create({
      email,
      otp: hashed,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP email — reuse your existing sendEmail util
    await sendEmail({
        to: email,
        subject: "CodeArena Admin OTP",
        html: otpEmailHTML(otp),
    });

    return res.json({
      success: true,
      message: "OTP sent to your email.",
      otpSent: true,
    });

  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── Step 2: Verify OTP → return admin JWT ────────────────────────────────────
export const adminVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required." });

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord)
      return res.status(400).json({ success: false, message: "OTP not found. Please login again." });

    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "OTP expired. Please login again." });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid OTP." });

    const admin = await Admin.findOne({ email }).select("-password");
    if (!admin)
      return res.status(400).json({ success: false, message: "Admin not found." });

    await OTP.deleteMany({ email });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.json({
      success: true,
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name },
    });

  } catch (err) {
    console.error("ADMIN VERIFY OTP ERROR:", err);
    res.status(500).json({ success: false, message: "Verification failed." });
  }
};