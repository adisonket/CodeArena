import express from "express";
import mongoose from "mongoose";
import UserDomain from "../models/UserDomain.js";
import Domain from "../models/Domain.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════
// GET all user's selected topics
// GET /api/user-domain/my
// ═══════════════════════════════════════════════════════
router.get("/my", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const selected = await UserDomain.find({ userId })
      .populate("domainId")
      .sort({ selectedAt: -1 });

    return res.json({
      success: true,
      data: selected,
    });
  } catch (err) {
    console.error("Get user domains error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// SELECT a topic with difficulty
// POST /api/user-domain/select
// Body: { domainId, category, topic, difficulty }
// ═══════════════════════════════════════════════════════
router.post("/select", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { domainId, category, topic, difficulty } = req.body;

    if (!domainId || !topic || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "domainId, topic, and difficulty are required",
      });
    }

    // Verify domain exists
    const domain = await Domain.findById(domainId);
    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    // Check if already exists (same user + topic + difficulty)
    const existing = await UserDomain.findOne({
      userId,
      domainId,
      topic,
      difficulty,
    });

    if (existing) {
      // Just increment attempt count, don't error
      existing.attemptCount += 1;
      await existing.save();
      return res.json({
        success: true,
        message: "Selection updated",
        data: existing,
        alreadyExisted: true,
      });
    }

    const userDomain = await UserDomain.create({
      userId,
      domainId,
      category: category || domain.category,
      topic,
      difficulty,
      attemptCount: 1,
    });

    return res.status(201).json({
      success: true,
      message: "Topic added to your learning path",
      data: userDomain,
    });
  } catch (err) {
    console.error("Select domain error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// REMOVE a selected topic
// DELETE /api/user-domain/:id
// ═══════════════════════════════════════════════════════
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const result = await UserDomain.findOneAndDelete({ _id: id, userId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Selection not found",
      });
    }

    return res.json({
      success: true,
      message: "Topic removed from your selection",
    });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// UPDATE progress for a selected topic
// PATCH /api/user-domain/:id/progress
// Body: { progress: 75 }
// ═══════════════════════════════════════════════════════
router.patch("/:id/progress", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { progress } = req.body;

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be a number between 0-100",
      });
    }

    const updated = await UserDomain.findOneAndUpdate(
      { _id: id, userId },
      { progress },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Selection not found",
      });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update progress error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;