import express from 'express';
import { protect } from '../middleware/auth.js';
import PracticeSubmission from '../models/PracticeSubmission.js';
import axios from 'axios';

const router = express.Router();


// =====================================
// POST /api/practice/submit
// =====================================
router.post('/submit', protect, async (req, res) => {

  try {

    // =====================================
    // Extract Request Data
    // =====================================
    const {
      questionId,
      questionTitle,
      question,
      type,
      options,
      correctAnswer,
      selectedAnswer,
      code,
      output,
      language
    } = req.body;

    // =====================================
    // MCQ Evaluation
    // =====================================
    const isCorrectMCQ =
      selectedAnswer === correctAnswer;

    // =====================================
    // Gemini AI Review
    // =====================================
    let aiReview = '';

    try {

      let prompt = '';

      // =====================================
      // MCQ QUESTIONS
      // =====================================
      if ((type || 'MCQ') === 'MCQ') {

        prompt = `
          You are an expert technical interviewer.

          Evaluate this MCQ assessment submission.

          # Question
          ${question || questionTitle || 'Practice Question'}

          # Options
          ${options?.join('\n') || 'No options provided'}

          # Correct Answer
          ${correctAnswer || 'Not provided'}

          # User Selected Answer
          ${selectedAnswer || 'No answer selected'}

          # MCQ Result
          ${isCorrectMCQ ? 'Correct' : 'Incorrect'}

          Analyze the submission in this exact format:

          # MCQ Evaluation

          - Was the selected answer correct?
          - Explain the correct answer briefly.

          # Knowledge Assessment

          - What concept does this question test?
          - What mistake did the candidate make (if any)?

          # Final Score

          Give a score out of 10.

          # Verdict

          Choose one:
          - Excellent
          - Good
          - Needs Improvement

          IMPORTANT:
          - Return valid Markdown
          - Keep response concise
          - Be beginner friendly
        `;

      }

      // =====================================
      // CODING QUESTIONS
      // =====================================
      else {

        prompt = `
          You are an expert coding interviewer and technical evaluator.

          Evaluate the following coding submission.

          # Question
          ${question || questionTitle || 'Coding Question'}

          # Submitted Code
          ${code || 'No code submitted'}

          # Program Output
          ${output || '(no output)'}

          # Programming Language
          ${language || 'Unknown'}

          Analyze the submission in this exact format:

          # Code Correctness

          - Does the code solve the problem?
          - Does the output match expectations?

          # Code Quality

          - Readability
          - Naming
          - Best practices
          - Structure

          # Optimization

          - Better approaches if applicable
          - Time complexity
          - Space complexity

          # Final Score

          Give a score out of 10.

          # Verdict

          Choose one:
          - Excellent
          - Good
          - Needs Improvement

          IMPORTANT:
          - Return valid Markdown
          - Keep response concise
          - Be beginner friendly
        `;
      }

      // =====================================
      // Gemini API Request
      // =====================================
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      aiReview =
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No AI review generated.';

    } catch (aiErr) {

      console.error(
        'Gemini review failed:',
        JSON.stringify(aiErr.response?.data, null, 2)
      );

      aiReview = 'AI review unavailable right now.';
    }

    // =====================================
    // Save Submission
    // =====================================
    const submission = await PracticeSubmission.create({
      user: req.user._id,

      questionId,

      questionTitle:
        question || questionTitle,

      code,
      language,
      output,

      aiReview
    });

    // =====================================
    // Response
    // =====================================
    res.status(201).json({
      success: true,
      isCorrectMCQ,
      submission
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// =====================================
// GET /api/practice/submissions
// =====================================
router.get('/submissions', protect, async (req, res) => {

  try {

    const submissions = await PracticeSubmission
      .find({ user: req.user._id })
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      submissions
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;