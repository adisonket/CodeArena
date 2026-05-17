import axios from "axios";

export const generateDrivePrompt =
async (req, res) => {

    try {

        const {
            title,
            tag,
            type,
            difficulty,
            duration,
            mcqCount,
            codeCount,
            marksPerMcq,
            marksPerCode,
        } = req.body;

        const isAssessment =
            type === "Assessment";

        const systemPrompt = `
You are an expert AI hiring assessment architect.

Your task is ONLY to generate a reusable AI instruction prompt.

DO NOT generate:
- questions
- answers
- MCQs
- coding problems
- explanations

Return ONLY a concise professional instruction prompt.
`;

        const userPrompt = `
Create ONLY a SHORT professional instruction prompt
for an AI question generator.

Drive Details:

Role: ${title}
Category: ${tag}
Assessment Type: ${type}
Difficulty: ${difficulty}
Duration: ${duration} minutes

MCQ Count: ${mcqCount}
Marks Per MCQ: ${marksPerMcq}

${
    isAssessment
        ? `
Coding Questions Count: ${codeCount}
Marks Per Coding Question: ${marksPerCode}
`
        : ""
}

Requirements for the generated prompt:

- concise and professional
- maximum 120 words
- clearly mention:
  - role
  - difficulty
  - question types
  - evaluation style
  - real-world focus
  - practical scenarios
  - no duplicate questions
  - industry-level assessment quality

${
    isAssessment
        ? `
The prompt should instruct AI to generate:
- MCQs
- coding problems
- debugging questions
- implementation-based questions
- practical coding scenarios
- problem-solving questions
`
        : `
The prompt should instruct AI to generate:
- aptitude questions
- logical reasoning
- quantitative aptitude
- analytical thinking
- verbal ability
- pattern recognition
`
}

IMPORTANT:
- Return ONLY the final reusable instruction prompt
- Do NOT generate actual questions
- Do NOT use markdown
- Do NOT explain anything
`;

        const response =
            await axios.post(

                "https://openrouter.ai/api/v1/chat/completions",

                {
                    model:
                        "openrouter/free",


                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: userPrompt,
                        },
                    ],

                    temperature: 0.5,

                    max_tokens: 250,
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.OPENROUTER_API_KEY}`,

                        "Content-Type":
                            "application/json",
                    },
                }
            );

        const generatedPrompt =
            response.data?.choices?.[0]
                ?.message?.content
                ?.trim() || "";

        return res.json({
            success: true,
            prompt: generatedPrompt,
        });

    } catch (error) {

        console.log(
            error.response?.data ||
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "AI prompt generation failed",
        });
    }
};