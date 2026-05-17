import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const openrouter = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

const CODING_DOMAINS = ["python", "javascript", "java", "c++", "c", "sql", "dsa"];

export const isCodingDomain = (domain = "") => {
  const lower = domain.trim().toLowerCase();
  return CODING_DOMAINS.some((d) => lower === d || lower.includes(d));
};

const detectLanguage = (domain = "") => {
  const text = domain.toLowerCase();
  if (text.includes("sql")) return "SQL";
  if (text.includes("dsa") || text.includes("data structure")) return "Python";
  if (text.includes("javascript") || text.includes("js") || text.includes("node") || text.includes("frontend") || text.includes("react")) return "JavaScript";
  if (text.includes("typescript") || text.includes("ts")) return "TypeScript";
  if (text.includes("python") || text.includes("ml") || text.includes("ai")) return "Python";
  if (text.includes("java") && !text.includes("javascript")) return "Java";
  if (text.includes("c++") || text.includes("cpp")) return "C++";
  if (text.includes("c#") || text.includes(".net")) return "C#";
  if (text.includes("php") || text.includes("laravel")) return "PHP";
  if (text.includes("golang") || text.includes("go developer")) return "Go";
  if (text.includes("backend") || text.includes("full stack") || text.includes("software engineer")) return "JavaScript";
  return "Python";
};

const getStarterCode = (language) => {
  switch (language) {
    case "Java": return `class Solution {\n    public static void main(String[] args) {\n\n    }\n}`;
    case "JavaScript": return `function solution() {\n\n}`;
    case "TypeScript": return `function solution(): void {\n\n}`;
    case "C++": return `#include <iostream>\nusing namespace std;\n\nint main() {\n\n    return 0;\n}`;
    case "C#": return `using System;\n\nclass Solution\n{\n    static void Main()\n    {\n\n    }\n}`;
    case "PHP": return `<?php\n\nfunction solution() {\n\n}\n\n?>`;
    case "Go": return `package main\n\nimport "fmt"\n\nfunc main() {\n\n}`;
    case "SQL": return `-- Write your SQL query here\nSELECT * FROM table_name;`;
    default: return `# Write your Python solution here`;
  }
};

const removeDuplicateQuestions = (questions = []) => {
  return questions.filter((question, index, self) => {
    const normalized = question.question?.trim().toLowerCase();
    return index === self.findIndex((q) => q.question?.trim().toLowerCase() === normalized);
  });
};

const createPrompt = ({ domain, difficulty, type, count, language, starterCode }) => {
  if (type === "CODING") {
    return `Generate ${count} unique ${difficulty} coding interview questions for ${domain}.
Rules:
- Return ONLY valid JSON array
- No markdown, no backticks
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
]`;
  }

  return `Generate ${count} unique ${difficulty} MCQ interview questions for ${domain}.
Rules:
- Return ONLY valid JSON array
- No markdown, no backticks
- Every question must have exactly 4 options

Format:
[
  {
    "question": "",
    "options": [],
    "answer": "",
    "type": "MCQ"
  }
]`;
};

const generateBatch = async ({ prompt }) => {
  try {
    const response = await openrouter.post("/chat/completions", {
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON array. No markdown, no backticks, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      top_p: 0.8,
      max_tokens: 1200,
    });

    const raw = response.data?.choices?.[0]?.message?.content || "[]";
    console.log("RAW RESPONSE:", raw);

    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.log("OPENROUTER ERROR:", error.response?.data || error.message);
    return [];
  }
};

// generateQuestions — used by old /generate route (needs type + count)
export const generateQuestions = async ({ domain, difficulty, type, count }) => {
  try {
    const language = detectLanguage(domain);
    const starterCode = getStarterCode(language);
    const batchSize = 2;
    const totalBatches = Math.ceil(count / batchSize);
    const requests = [];

    for (let i = 0; i < totalBatches; i++) {
      const currentBatchSize = Math.min(batchSize, count - i * batchSize);
      requests.push(generateBatch({
        prompt: createPrompt({ domain, difficulty, type, count: currentBatchSize, language, starterCode }),
      }));
    }

    const results = await Promise.all(requests);
    const questions = results.flat();
    const unique = removeDuplicateQuestions(questions);
    return unique.slice(0, count);

  } catch (error) {
    console.log(error.response?.data || error.message);
    throw new Error("Question generation failed");
  }
};

// generatePracticeQuestions — used by /practice-generate route (auto 7+3 or 10 MCQ)
export const generatePracticeQuestions = async ({ domain, difficulty }) => {
  try {
    const coding = isCodingDomain(domain);
    const language = detectLanguage(domain);
    const starterCode = getStarterCode(language);
    let allQuestions = [];

    if (coding) {
      const [codingResults, mcqResults] = await Promise.all([
        Promise.all(
          [2, 2, 2, 1].map((count) =>
            generateBatch({ prompt: createPrompt({ domain, difficulty, type: "CODING", count, language, starterCode }) })
          )
        ).then(r => r.flat()),
        generateBatch({ prompt: createPrompt({ domain, difficulty, type: "MCQ", count: 3, language, starterCode }) }),
      ]);

      allQuestions = [
        ...codingResults.map((q) => ({ ...q, type: "CODING", language, starterCode })).slice(0, 7),
        ...mcqResults.map((q) => ({ ...q, type: "MCQ" })).slice(0, 3),
      ];
    } else {
      const results = await Promise.all(
        [2, 2, 2, 2, 2].map((count) =>
          generateBatch({ prompt: createPrompt({ domain, difficulty, type: "MCQ", count, language, starterCode }) })
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