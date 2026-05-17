import { generatePracticeQuestions } from "../api/practiceOpenrouter.js";

export const generatePracticeController = async (req, res) => {
  try {
    const { domain, difficulty = 'medium' } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "domain is required",
      });
    }

    const questions = await generatePracticeQuestions({ domain, difficulty });

    return res.status(200).json({
      success: true,
      questions,
    });

  } catch (error) {
    console.log(error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Question generation failed",
    });
  }
};