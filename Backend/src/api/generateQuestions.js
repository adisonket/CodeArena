import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ============================
// OPENROUTER CLIENT
// ============================

const openrouter = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// ============================
// CODING DOMAINS (7)
// ============================

const CODING_DOMAINS = [
  "python",
  "javascript",
  "java",
  "c++",
  "c",
  "sql",
  "dsa",
];

export const isCodingDomain = (domain = "") => {
  const lower = domain.trim().toLowerCase();
  return CODING_DOMAINS.some((d) => lower === d || lower.includes(d));
};

// ============================
// LANGUAGE DETECTION
// ============================

const detectLanguage = (domain = "") => {
  const text = domain.toLowerCase();

  if (text.includes("sql")) return "SQL";
  if (text.includes("dsa") || text.includes("data structure")) return "Python";
  if (
    text.includes("javascript") ||
    text.includes("js") ||
    text.includes("node") ||
    text.includes("frontend") ||
    text.includes("react")
  )
    return "JavaScript";
  if (text.includes("typescript") || text.includes("ts")) return "TypeScript";
  if (text.includes("python") || text.includes("ml") || text.includes("ai"))
    return "Python";
  if (text.includes("java") && !text.includes("javascript")) return "Java";
  if (text.includes("c++") || text.includes("cpp")) return "C++";
  if (text.includes("c#") || text.includes(".net")) return "C#";
  if (text.includes("php") || text.includes("laravel")) return "PHP";
  if (text.includes("golang") || text.includes("go developer")) return "Go";
  if (
    text.includes("backend") ||
    text.includes("full stack") ||
    text.includes("software engineer")
  )
    return "JavaScript";

  return "Python";
};

// ============================
// STARTER CODE
// ============================

const getStarterCode = (language) => {
  switch (language) {
    case "Java":
      return `class Solution {\n    public static void main(String[] args) {\n\n    }\n}`;
    case "JavaScript":
      return `function solution() {\n\n}`;
    case "TypeScript":
      return `function solution(): void {\n\n}`;
    case "C++":
      return `#include <iostream>\nusing namespace std;\n\nint main() {\n\n    return 0;\n}`;
    case "C#":
      return `using System;\n\nclass Solution\n{\n    static void Main()\n    {\n\n    }\n}`;
    case "PHP":
      return `<?php\n\nfunction solution() {\n\n}\n\n?>`;
    case "Go":
      return `package main\n\nimport "fmt"\n\nfunc main() {\n\n}`;
    case "SQL":
      return `-- Write your SQL query here\nSELECT * FROM table_name;`;
    default:
      return `# Write your Python solution here`;
  }
};

// ============================
// REMOVE DUPLICATES
// ============================

const removeDuplicateQuestions = (questions = []) => {
  return questions.filter((question, index, self) => {
    const normalized = question.question?.trim().toLowerCase();
    return (
      index ===
      self.findIndex(
        (q) => q.question?.trim().toLowerCase() === normalized
      )
    );
  });
};

// ============================
// CREATE PROMPT
// ============================

const createPrompt = ({
  domain,
  difficulty,
  type,
  count,
  language,
  starterCode,
}) => {
  if (type === "CODING") {
    return `
Generate ${count} unique ${difficulty} coding interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Questions must be different from each other
- Use ${language}

Format:
[
  {
    "question": "",
    "starterCode": "${starterCode.replace(/\n/g, "\\n")}",
    "language": "${language}",
    "type": "CODING"
  }
]
`;
  }

  return `
Generate ${count} unique ${difficulty} MCQ interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Every question must have exactly 4 options

Format:
[
  {
    "question": "",
    "options": [],
    "answer": "",
    "type": "MCQ"
  }
]
`;
};

// ============================
// CALL AI
// ============================

const generateBatch = async ({ prompt }) => {
  const response = await openrouter.post("/chat/completions", {
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content:
          "Return ONLY valid JSON array. No markdown, no backticks, no explanation.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    top_p: 0.8,
    max_tokens: 1200,
  });

  const raw =
    response.data?.choices?.[0]?.message?.content || "[]";

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.log("INVALID JSON:", raw);
    return [];
  }
};

// ============================
// GENERATE QUESTIONS
// Always returns 10 questions:
//   Coding domains  → 7 CODING + 3 MCQ
//   Other domains   → 10 MCQ
// ============================

export const generateQuestions = async ({ domain, difficulty }) => {
  try {
    const coding = isCodingDomain(domain);
    const language = detectLanguage(domain);
    const starterCode = getStarterCode(language);

    let allQuestions = [];

    if (coding) {
      // ── 7 CODING + 3 MCQ ────────────────────────────────────────────────
      const [codingResults, mcqResults] = await Promise.all([

        // 7 coding questions in batches: 2 + 2 + 2 + 1
        (async () => {
          const batches = [2, 2, 2, 1];
          const results = await Promise.all(
            batches.map((count) =>
              generateBatch({
                prompt: createPrompt({
                  domain,
                  difficulty,
                  type: "CODING",
                  count,
                  language,
                  starterCode,
                }),
              })
            )
          );
          return results.flat();
        })(),

        // 3 MCQ questions in one batch
        generateBatch({
          prompt: createPrompt({
            domain,
            difficulty,
            type: "MCQ",
            count: 3,
            language,
            starterCode,
          }),
        }),
      ]);

      // Tag types, cap at target counts
      const codingTagged = codingResults
        .map((q) => ({ ...q, type: "CODING", language, starterCode }))
        .slice(0, 7);

      const mcqTagged = mcqResults
        .map((q) => ({ ...q, type: "MCQ" }))
        .slice(0, 3);

      // Layout: Q1–Q7 = CODING, Q8–Q10 = MCQ
      allQuestions = [...codingTagged, ...mcqTagged];

    } else {
      // ── 10 MCQ only ─────────────────────────────────────────────────────
      const batches = [2, 2, 2, 2, 2];
      const results = await Promise.all(
        batches.map((count) =>
          generateBatch({
            prompt: createPrompt({
              domain,
              difficulty,
              type: "MCQ",
              count,
              language,
              starterCode,
            }),
          })
        )
      );
      allQuestions = results.flat().map((q) => ({ ...q, type: "MCQ" }));
    }

    const unique = removeDuplicateQuestions(allQuestions);
    return unique.slice(0, 10);

  } catch (error) {
    console.log(error.response?.data || error.message);
    throw new Error("Question generation failed");
  }
};