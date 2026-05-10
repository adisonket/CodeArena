import { generateQuestions } from "../api/openrouter.js";

export const generateQuestionsController =
async (req, res) => {

  try {

    const {
      domain,
      difficulty,
      type,
      count,
    } = req.body;

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

    const result =
      await generateQuestions({
        domain,
        difficulty,
        type,
        count,
      });

    let parsedQuestions;

    try {

      parsedQuestions =
        JSON.parse(result);

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          "AI returned invalid JSON",
        raw: result,
      });
    }

    return res.status(200).json({
      success: true,
      questions: parsedQuestions,
    });

  } catch (error) {

    console.error(
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