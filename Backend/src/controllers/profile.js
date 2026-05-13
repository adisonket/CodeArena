import User from "../models/User.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// ── GET /api/profile ──────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "firstName lastName email phone location linkedin github bio skills profilePhoto resumeUrl resumeOriginalName education picture"
    );
    // console.log("education from DB:", JSON.stringify(user.education)); // ← add this
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── PUT /api/profile ──────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const allowed = ["firstName", "lastName", "phone", "location", "linkedin", "github", "bio", "skills"];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -emailVerifyToken -emailVerifyExpires -twoFactorSecret");

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/profile/photo ───────────────────────────────────────────────────
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const user = await User.findById(req.user._id);

    // Delete old photo only if it was a local upload (not a Google URL)
    if (user.picture && user.picture.startsWith("/uploads/")) {
      const oldPath = path.join("uploads", "photos", path.basename(user.picture));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photoUrl = `/uploads/photos/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { picture: photoUrl });

    res.status(200).json({ success: true, photoUrl });
  } catch (err) {
    console.error("uploadPhoto error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/profile/resume ──────────────────────────────────────────────────
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const user = await User.findById(req.user._id);

    // Delete old resume file
    if (user.resumeUrl) {
      const oldPath = path.join("uploads", "resumes", path.basename(user.resumeUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, {
      resumeUrl,
      resumeOriginalName: req.file.originalname,
    });

    res.status(200).json({
      success: true,
      resumeUrl,
      originalName: req.file.originalname,
      size: `${Math.round(req.file.size / 1024)} KB`,
    });
  } catch (err) {
    console.error("uploadResume error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── DELETE /api/profile/resume ────────────────────────────────────────────────
export const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.resumeUrl) {
      const oldPath = path.join("uploads", "resumes", path.basename(user.resumeUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await User.findByIdAndUpdate(req.user._id, { resumeUrl: "", resumeOriginalName: "" });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── PUT /api/profile/education ────────────────────────────────────────────────
// Replaces the full education array (client sends the full list)
export const updateEducation = async (req, res) => {
  try {
    const { education } = req.body;
    if (!Array.isArray(education))
      return res.status(400).json({ success: false, message: "education must be an array" });

    // Generate _id for any entry that is missing one
    const educationWithIds = education.map(edu => ({
      ...edu,
      _id: edu._id && edu._id !== "null" ? edu._id : new mongoose.Types.ObjectId(),
      docs: (edu.docs || []).map(doc => ({
        ...doc,
        _id: doc._id && doc._id !== "null" ? doc._id : new mongoose.Types.ObjectId(),
      })),
    }));

    const user = await User.findById(req.user._id);
    user.education = educationWithIds;
    await user.save();

    res.status(200).json({ success: true, education: user.education });
  } catch (err) {
    console.error("updateEducation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/profile/education/:eduId/doc ────────────────────────────────────
export const uploadEduDoc = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const { eduId } = req.params;
    const user = await User.findById(req.user._id);

    const edu = user.education.id(eduId);
    if (!edu) return res.status(404).json({ success: false, message: "Education entry not found" });

    edu.docs.push({
      name: req.file.originalname,
      path: `/uploads/edu-docs/${req.file.filename}`,
      size: `${Math.round(req.file.size / 1024)} KB`,
    });

    await user.save();

    const newDoc = edu.docs[edu.docs.length - 1];
    res.status(200).json({ success: true, doc: newDoc });
  } catch (err) {
    console.error("uploadEduDoc error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── DELETE /api/profile/education/:eduId/doc/:docId ───────────────────────────
export const deleteEduDoc = async (req, res) => {
  try {
    const { eduId, docId } = req.params;
    const user = await User.findById(req.user._id);

    const edu = user.education.id(eduId);
    if (!edu) return res.status(404).json({ success: false, message: "Education entry not found" });

    const doc = edu.docs.id(docId);
    if (doc) {
      const filePath = path.join("uploads", "edu-docs", path.basename(doc.path));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      doc.deleteOne();
    }

    await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("deleteEduDoc error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};