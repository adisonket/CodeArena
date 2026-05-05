import express from 'express';
import { protect } from '../middleware/auth.js';
import PracticeSubmission from '../models/PracticeSubmission.js';
import axios from 'axios';

const router = express.Router();

// POST /api/practice/submit
router.post('/submit', protect, async (req, res) => {
  try {
    const { questionId, questionTitle, code, output } = req.body;

    // --- CodeRabbit-style AI review via Gemini (FREE) ---
    let aiReview = '';
    try {
      const prompt = `You are CodeRabbit, an expert code reviewer. A student submitted the following Python code for a practice question.

Question: "${questionTitle}"

Code:
\`\`\`python
${code}
\`\`\`

Output produced:
${output || '(no output)'}

Provide a concise code review covering:
1. **Correctness** – Does it solve the problem correctly?
2. **Code Quality** – Style, naming, readability
3. **Optimizations** – Any improvements?
4. **Verdict** – Pass / Needs Improvement

Keep the review under 200 words. Be direct and helpful.`;

      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      aiReview =
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No review generated.';

    } catch (aiErr) {
      console.error('Gemini review failed:', aiErr.response?.data || aiErr.message);
      aiReview = 'AI review unavailable right now.';
    }

    const submission = await PracticeSubmission.create({
      user: req.user._id,
      questionId,
      questionTitle,
      code,
      output,
      aiReview
    });

    res.status(201).json({ success: true, submission });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/practice/submissions
router.get('/submissions', protect, async (req, res) => {
  try {
    const submissions = await PracticeSubmission
      .find({ user: req.user._id })
      .sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;