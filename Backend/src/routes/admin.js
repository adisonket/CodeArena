import express from "express";
import User from "../models/User.js";
import Drive from "../models/Drive.js";
import Interview from "../models/Interview.js";
import InterviewResult from "../models/InterviewResult.js";
import Domain from "../models/Domain.js";
import { adminLogin, adminVerifyOtp } from "../controllers/adminAuth.js";
import { adminProtect } from "../middleware/adminProtect.js";

const router = express.Router();

// ── Users ─────────────────────────────────────────────────────────────────────

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// ── Drives ────────────────────────────────────────────────────────────────────

router.get("/drives", async (req, res) => {
  try {
    const drives = await Drive.find().sort({ driveDate: -1 });
    res.json({ success: true, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch drives" });
  }
});

router.post("/drives", async (req, res) => {
  try {
    let isUnique = false;
    let driveId;

    while (!isUnique) {
      driveId = Math.floor(100000 + Math.random() * 900000).toString();
      const existingDrive = await Drive.findOne({ driveId });
      if (!existingDrive) isUnique = true;
    }

    const driveData = { ...req.body, driveId };
    const newDrive = await Drive.create(driveData);
    res.status(201).json({ success: true, data: newDrive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/drives/:id", async (req, res) => {
  try {
    await Drive.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Drive deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete drive" });
  }
});

// ── Interviews ────────────────────────────────────────────────────────────────

router.get("/interviews", async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("driveId", "driveId hiringPositionName driveDate")
      .populate("userIds", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch interviews" });
  }
});

router.post("/interviews", async (req, res) => {
  try {
    const { driveId, userIds } = req.body;
    if (!driveId || !userIds || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "Drive and at least one user are required." });
    }
    const newInterview = await Interview.create({ driveId, userIds });
    res.status(201).json({ success: true, data: newInterview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/interviews/:id", async (req, res) => {
  try {
    const { userIds } = req.body;
    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      { userIds },
      { new: true }
    );
    res.json({ success: true, data: updatedInterview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/interviews/:id", async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Interview assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete interview assignment" });
  }
});

// ── Results ───────────────────────────────────────────────────────────────────

router.get("/results", async (req, res) => {
  try {
    const results = await InterviewResult.find()
      .populate("userId", "firstName lastName email")
      .populate("driveId", "driveId hiringPositionName totalMarks")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch results" });
  }
});

// ── Domains ───────────────────────────────────────────────────────────────────

// GET all categories with their domains
router.get("/domains", async (req, res) => {
  try {
    const domains = await Domain.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: domains });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch domains" });
  }
});

// POST create a new category
router.post("/domains", async (req, res) => {
  try {
    const { category, domains } = req.body;
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const exists = await Domain.findOne({ category: category.trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Category already exists." });
    }

    const newCategory = await Domain.create({
      category: category.trim(),
      domains: (domains || []).map((d) => d.trim()).filter(Boolean),
    });
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update a category (rename + full domain list replace)
router.put("/domains/:id", async (req, res) => {
  try {
    const { category, domains } = req.body;
    const updated = await Domain.findByIdAndUpdate(
      req.params.id,
      {
        ...(category && { category: category.trim() }),
        ...(domains !== undefined && {
          domains: domains.map((d) => d.trim()).filter(Boolean),
        }),
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE a full category
router.delete("/domains/:id", async (req, res) => {
  try {
    await Domain.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete category." });
  }
});

// POST add a single domain to an existing category
router.post("/domains/:id/domain", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || !domain.trim()) {
      return res.status(400).json({ success: false, message: "Domain name is required." });
    }
    const updated = await Domain.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { domains: domain.trim() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE a single domain from a category
router.delete("/domains/:id/domain", async (req, res) => {
  try {
    const { domain } = req.body;
    const updated = await Domain.findByIdAndUpdate(
      req.params.id,
      { $pull: { domains: domain } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ── ADMIN LOGIN ───────────────────────────────────────────────────────────────────

router.post("/login",      adminLogin);
router.post("/verify-otp", adminVerifyOtp);

// Example protected admin route
router.get("/me", adminProtect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

export default router;