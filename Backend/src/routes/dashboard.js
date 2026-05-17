import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Drive from "../models/Drive.js";
import InterviewResult from "../models/InterviewResult.js";
import Interview from "../models/Interview.js";
import PracticeSubmission from "../models/PracticeSubmission.js";
import Domain from "../models/Domain.js";
import UserDomain from "../models/UserDomain.js";
import { protect } from "../middleware/auth.js"; // ✅ REQUIRED for user-specific data

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// HELPER: Activity graph data (per user)
// ═══════════════════════════════════════════════════════════════
async function getActivityData(period, userId) {
  const now = new Date();
  let startDate;
  let groupFormat;
  let labels = [];

  if (period === "W") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    groupFormat = "%Y-%m-%d";
    labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return {
        key: d.toISOString().split("T")[0],
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
      };
    });
  } else if (period === "M") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 27);
    startDate.setHours(0, 0, 0, 0);
    groupFormat = "%Y-%U";
    labels = Array.from({ length: 4 }, (_, i) => ({
      key: `Week ${i + 1}`,
      day: `W${i + 1}`,
    }));
  } else {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    groupFormat = "%Y-%m";
    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ];
    labels = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(now.getMonth() - (11 - i));
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        day: monthNames[d.getMonth()],
      };
    });
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Only THIS user's results
  const results = await InterviewResult.aggregate([
    { $match: { userId: userObjectId, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Only THIS user's practice submissions
  const submissions = await PracticeSubmission.aggregate([
    { $match: { user: userObjectId, submittedAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$submittedAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  const dataMap = {};
  results.forEach((r) => { dataMap[r._id] = (dataMap[r._id] || 0) + r.count; });
  submissions.forEach((s) => { dataMap[s._id] = (dataMap[s._id] || 0) + s.count; });

  return labels.map(({ key, day }) => ({
    day,
    value: Math.min((dataMap[key] || 0) * 20, 100),
    raw: dataMap[key] || 0,
  }));
}

// ═══════════════════════════════════════════════════════════════
// ROUTE: GET /api/dashboard/summary
// All data for the LOGGED-IN user
// ═══════════════════════════════════════════════════════════════
router.get("/summary", protect, async (req, res) => {
  try {
    const { period = "W" } = req.query;
    const userId = req.user._id || req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ═══════════════════════════════════════════════════
    // 1. OVERALL STATS (USER-SPECIFIC PROGRESS)
    // ═══════════════════════════════════════════════════

    // Total drives available in the system
    const totalDrives = await Drive.countDocuments();

    // Drives THIS user has COMPLETED
    const completedDriveIds = await InterviewResult.distinct("driveId", {
      userId: userObjectId,
      status: "Completed",
    });
    const completedCount = completedDriveIds.length;

    // Drives THIS user is SCHEDULED for (but not completed yet)
    const scheduledInterviews = await Interview.find({
      userIds: userObjectId,
    }).select("driveId");
    
    const scheduledDriveIds = scheduledInterviews
      .map((i) => i.driveId.toString())
      .filter((id) => !completedDriveIds.some((cid) => cid.toString() === id));

    const inProgressCount = scheduledDriveIds.length;

    // Drives NOT STARTED = Total drives − Completed − In Progress
    const notStartedCount = Math.max(
      totalDrives - completedCount - inProgressCount,
      0
    );

    const safeTotal = totalDrives || 1;

    // Calculate percentages (will sum to ~100%)
    const completedPct = Math.round((completedCount / safeTotal) * 100);
    const inProgressPct = Math.round((inProgressCount / safeTotal) * 100);
    const notStartedPct = Math.max(100 - completedPct - inProgressPct, 0);

    // ═══════════════════════════════════════════════════
    // 2. LEARNING PROGRESS (USER'S SELECTED TOPICS)
    // ═══════════════════════════════════════════════════

    const userSelectedTopics = await UserDomain.find({
      userId: userObjectId,
    }).sort({ selectedAt: -1 });

    const categoryMap = {};

    for (const sel of userSelectedTopics) {
      const cat = sel.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          label: cat,
          topics: [],
          totalProgress: 0,
          totalAttempts: 0,
        };
      }
      categoryMap[cat].topics.push({
        topic: sel.topic,
        difficulty: sel.difficulty,
        progress: sel.progress,
      });
      categoryMap[cat].totalProgress += sel.progress;
      categoryMap[cat].totalAttempts += sel.attemptCount;
    }

    const progressData = Object.values(categoryMap).map((cat) => {
      const avgProgress =
        cat.topics.length > 0
          ? Math.round(cat.totalProgress / cat.topics.length)
          : 0;

      let level = "low";
      if (avgProgress >= 70) level = "high";
      else if (avgProgress >= 40) level = "medium";

      return {
        label: cat.label,
        value: avgProgress,
        level,
        topicsCount: cat.topics.length,
        topics: cat.topics,
      };
    });

    // ═══════════════════════════════════════════════════
    // 3. ACTIVITY GRAPH (USER-SPECIFIC)
    // ═══════════════════════════════════════════════════
    const graphData = await getActivityData(period, userId);

    // ═══════════════════════════════════════════════════
    // 4. CATEGORY CARDS (USER-SPECIFIC)
    // ═══════════════════════════════════════════════════
    
    // Drive stats — total available drives (system-wide makes sense here)
    const assessmentDrives = await Drive.countDocuments({ driveType: "Assessment" });
    const interviewDrives = await Drive.countDocuments({ driveType: "Interview" });

    // Practice stats — only THIS user's submissions
    const userSubmissions = await PracticeSubmission.countDocuments({
      user: userObjectId,
    });
    const uniqueQuestionsSolved = await PracticeSubmission.distinct("questionId", {
      user: userObjectId,
    });
    const reviewedSubmissions = await PracticeSubmission.countDocuments({
      user: userObjectId,
      aiReview: { $exists: true, $ne: null, $ne: "" },
    });
    const practiceRating = userSubmissions > 0
      ? (reviewedSubmissions / userSubmissions) * 5
      : 0;

    // Mock interview stats — only THIS user's results
    const userInterviewResults = await InterviewResult.countDocuments({
      userId: userObjectId,
    });
    const userScoreAgg = await InterviewResult.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          totalTime: { $sum: "$timeTaken" },
        },
      },
    ]);
    const avgScore = userScoreAgg[0]?.avgScore?.toFixed(1) || "0.0";
    const totalHours = Math.round((userScoreAgg[0]?.totalTime || 0) / 60);

    // ═══════════════════════════════════════════════════
    // SEND RESPONSE
    // ═══════════════════════════════════════════════════
    return res.json({
      success: true,
      data: {
        stats: {
          completed: completedPct,
          inProgress: inProgressPct,
          notStarted: notStartedPct,
          // Raw counts for debugging/display
          completedCount,
          inProgressCount,
          notStartedCount,
          totalDrives,
        },
        progressData,
        graphData,
        categories: [
          {
            id: "drive",
            title: "Drive",
            description: "Access your study materials, notes, and important documents all in one organized place.",
            badgeText: "New",
            stats: [
              { num: totalDrives, text: "Drives" },
              { num: assessmentDrives, text: "Assessments" },
              { num: interviewDrives, text: "Interviews" },
            ],
          },
          {
            id: "practice",
            title: "Practice Set",
            description: "Sharpen your skills with curated practice problems and real-world coding challenges.",
            badgeText: "Popular",
            stats: [
              { num: userSubmissions, text: "Questions" },
              { num: uniqueQuestionsSolved.length, text: "Solved" },
              { num: Number(practiceRating.toFixed(1)), text: "Rating" },
            ],
          },
          {
            id: "mock",
            title: "Mock Interview",
            description: "Prepare for real interviews with AI-powered mock sessions and detailed feedback.",
            badgeText: "Pro",
            stats: [
              { num: userInterviewResults, text: "Sessions" },
              { num: Number(avgScore), text: "Avg Score" },
              { num: totalHours, text: "Hours" },
            ],
          },
        ],
      },
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTE: GET /api/dashboard/activity
// User-specific activity graph
// ═══════════════════════════════════════════════════════════════
router.get("/activity", protect, async (req, res) => {
  try {
    const { period = "W" } = req.query;
    const userId = req.user._id || req.user.id;
    const graphData = await getActivityData(period, userId);
    return res.json({ success: true, data: graphData });
  } catch (err) {
    console.error("Activity error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;