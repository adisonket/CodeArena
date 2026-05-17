import express from 'express';
import { protect } from '../middleware/auth.js';
import PracticeSubmission from '../models/PracticeSubmission.js';
import axios from 'axios';

const router = express.Router();

// ─── Shared Gemini helper ──────────────────────────────────────────────────────

const callGemini = async (prompt) => {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return (
    res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No response generated.'
  );
};

// =====================================
// POST /api/practice/analyze
// Per-question AI hint — NOT saved to DB.
// Works for both CODING and MCQ.
// =====================================
router.post('/analyze', protect, async (req, res) => {
  try {
    const {
      type,           // "CODING" | "MCQ"
      question,
      options,        // MCQ only
      correctAnswer,  // MCQ only
      selectedAnswer, // MCQ only
      code,           // CODING only
      output,         // CODING only
      language,       // CODING only
    } = req.body;

    let prompt = '';

    if (type === 'CODING') {
      prompt = `
You are a helpful coding mentor. A student is working on a coding problem.
Do NOT give the full solution — give clear, encouraging hints that guide them.

# Question
${question}

# Language
${language || 'Unknown'}

# Code written so far
${code || '(nothing written yet)'}

# Program output
${output || '(no output)'}

Give hints in this format:

## What you've done right
(acknowledge anything correct in their approach)

## Hints to move forward
(2-4 bullet-point hints — no full solution)

## Edge cases to consider
(1-2 things they might be missing)

Keep it beginner-friendly and concise.
      `.trim();
    } else {
      // MCQ
      prompt = `
You are a helpful tutor. A student answered an MCQ question.

# Question
${question}

# Options
${(options || []).join('\n')}

# Student's selected answer
${selectedAnswer || '(no answer selected yet)'}

Give hints in this format:

## What this question tests
(briefly explain the concept)

## Hint
(guide them toward the correct answer WITHOUT revealing it directly)

## Common misconception
(what trap or confusion to watch out for)

Keep it beginner-friendly and concise.
      `.trim();
    }

    const hint = await callGemini(prompt);

    res.json({ success: true, hint });
  } catch (err) {
    console.error('Analyze error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'AI analysis failed.' });
  }
});

// =====================================
// POST /api/practice/submit
// Final submission of all 10 questions.
// Saves to DB + generates overall AI review.
// =====================================
router.post('/submit', protect, async (req, res) => {
  try {
    const {
      domain,
      difficulty,
      attempts, // Array of 10 question attempt objects
    } = req.body;

    if (!Array.isArray(attempts) || attempts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No attempts provided.',
      });
    }

    // ── Quick stats ────────────────────────────────────────────────────────
    const correctMCQ = attempts.filter(
      (a) => a.type === 'MCQ' && a.selectedAnswer === a.correctAnswer
    ).length;

    const attemptedCoding = attempts.filter(
      (a) => a.type === 'CODING' && a.code && a.code.trim().length > 0
    ).length;

    // ── Build summary for overall AI review ───────────────────────────────
    const summaryLines = attempts.map((a, i) => {
      if (a.type === 'MCQ') {
        const correct = a.selectedAnswer === a.correctAnswer;
        return `Q${i + 1} [MCQ]: "${a.question}" — Selected: "${a.selectedAnswer || 'none'}" — ${correct ? '✓ Correct' : '✗ Wrong (correct: ' + a.correctAnswer + ')'}`;
      } else {
        const hasCode = a.code && a.code.trim().length > 0;
        return `Q${i + 1} [CODING]: "${a.question}" — ${hasCode ? 'Code submitted (' + (a.language || 'unknown') + ')' : 'No code submitted'}`;
      }
    });

    const overallPrompt = `
You are an expert technical interviewer. A student just completed a 10-question practice session.

# Domain: ${domain}
# Difficulty: ${difficulty}

# Session Summary
${summaryLines.join('\n')}

# Stats
- MCQ correct: ${correctMCQ} / ${attempts.filter((a) => a.type === 'MCQ').length}
- Coding questions attempted: ${attemptedCoding} / ${attempts.filter((a) => a.type === 'CODING').length}

Give an overall review in this format:

## Overall Performance
(2-3 sentences summarising how they did)

## Strengths
(what they did well)

## Areas to Improve
(specific topics or skills to work on)

## Score
X / 10

## Verdict
Choose one: Excellent | Good | Needs Improvement

Keep it encouraging and actionable.
    `.trim();

    let aiReview = '';
    try {
      aiReview = await callGemini(overallPrompt);
    } catch (aiErr) {
      console.error('Overall AI review failed:', aiErr.message);
      aiReview = 'AI review unavailable right now.';
    }

    // ── Save to DB ─────────────────────────────────────────────────────────
    const submission = await PracticeSubmission.create({
      user: req.user._id,
      domain,
      difficulty,
      attempts,
      aiReview,
      totalQuestions: attempts.length,
      correctMCQ,
      attemptedCoding,
    });

    res.status(201).json({
      success: true,
      submission,
      stats: { correctMCQ, attemptedCoding, total: attempts.length },
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================
// GET /api/practice/submissions
// =====================================
router.get('/submissions', protect, async (req, res) => {
  try {
    const submissions = await PracticeSubmission.find({ user: req.user._id })
      .sort({ submittedAt: -1 });

    res.json({ success: true, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;