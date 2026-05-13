import { generateQuestions }
from "../api/openrouter.js";

export const
generateQuestionsController =
async (req, res) => {

  try {

    const {
      domain,
      difficulty,
      type,
      count,
    } = req.body;

    // ============================
    // VALIDATION
    // ============================

    if (
      !domain ||
      !difficulty ||
      !type ||
      !count
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Missing required fields",
      });
    }

    // ============================
    // GENERATE QUESTIONS
    // ============================

    const questions =
      await generateQuestions({
        domain,
        difficulty,
        type,
        count:
          Number(count),
      });

    return res.status(200).json({
      success: true,
      questions,
    });

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Question generation failed",
    });
  }
};