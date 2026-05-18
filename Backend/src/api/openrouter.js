import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ============================
// NVIDIA CLIENT
// ============================



// ============================
// LANGUAGE DETECTION
// ============================

const detectLanguage = (domain = "") => {
  const text = domain.toLowerCase();

  if (
    text.includes("frontend") ||
    text.includes("react") ||
    text.includes("javascript") ||
    text.includes("js") ||
    text.includes("node")
  ) {
    return "JavaScript";
  }

  if (
    text.includes("typescript") ||
    text.includes("ts")
  ) {
    return "TypeScript";
  }

  if (
    text.includes("python") ||
    text.includes("ml") ||
    text.includes("ai")
  ) {
    return "Python";
  }

  if (
    text.includes("java") &&
    !text.includes("javascript")
  ) {
    return "Java";
  }

  if (
    text.includes("c++") ||
    text.includes("cpp")
  ) {
    return "C++";
  }

  if (
    text.includes("c#") ||
    text.includes(".net")
  ) {
    return "C#";
  }

  if (
    text.includes("php") ||
    text.includes("laravel")
  ) {
    return "PHP";
  }

  if (
    text.includes("golang") ||
    text.includes("go developer")
  ) {
    return "Go";
  }

  if (
    text.includes("backend") ||
    text.includes("full stack") ||
    text.includes("software engineer")
  ) {
    return "JavaScript";
  }

  return "Python";
};

// ============================
// STARTER CODE
// ============================

const getStarterCode = (language) => {
  switch (language) {

    case "Java":
      return `class Solution {
    public static void main(String[] args) {

    }
}`;

    case "JavaScript":
      return `function solution() {

}`;

    case "TypeScript":
      return `function solution(): void {

}`;

    case "C++":
      return `#include <iostream>
using namespace std;

int main() {

    return 0;
}`;

    case "C#":
      return `using System;

class Solution
{
    static void Main()
    {

    }
}`;

    case "PHP":
      return `<?php

function solution() {

}

?>`;

    case "Go":
      return `package main

import "fmt"

func main() {

}`;

    default:
      return `# Write your Python solution here`;
  }
};

// ============================
// REMOVE DUPLICATES
// ============================

const removeDuplicateQuestions = (
  questions = []
) => {

  return questions.filter(
    (question, index, self) => {

      const normalized =
        question.question
          ?.trim()
          .toLowerCase();

      return (
        index ===
        self.findIndex(
          (q) =>
            q.question
              ?.trim()
              ?.toLowerCase() ===
            normalized
        )
      );
    }
  );
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
  aiPrompt,
}) => {

  if (type === "CODING") {

    return `
${aiPrompt || ""}

Generate ${count} unique ${difficulty} coding interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Questions must be different
- Use ${language}

Format:
[
  {
    "question": "",
    "starterCode": "${starterCode}",
    "language": "${language}"
  }
]
`;
  }

  return `
${aiPrompt || ""}

Generate ${count} unique ${difficulty} MCQ interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Every question must have 4 options

Format:
[
  {
    "question": "",
    "options": [],
    "answer": ""
  }
]
`;
};

// ============================
// CALL AI
// ============================

const generateBatch = async ({
  prompt,
}) => {

  const response = await axios.post(
    "https://integrate.api.nvidia.com/v1/chat/completions",

    {
      model: "meta/llama-3.1-8b-instruct",

      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON array.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      max_tokens: 4096,
      temperature: 0.3,
      top_p: 0.8,

      stream: false,

      chat_template_kwargs: {
        enable_thinking: false,
      },
    },

    {
      headers: {
        Authorization:
          `Bearer ${process.env.NVIDIA_API_KEY}`,

        "Content-Type":
          "application/json",
      },
    }
  );

  const raw =
    response.data?.choices?.[0]
      ?.message?.content || "[]";

  try {

    return JSON.parse(raw);

  } catch (error) {

    console.log(
      "INVALID JSON:",
      raw
    );

    return [];
  }
};

// ============================
// GENERATE QUESTIONS
// ============================

export const generateQuestions =
async ({
  domain,
  difficulty,
  type,
  count,
  aiPrompt,
}) => {

  try {

    const language =
      detectLanguage(domain);

    const starterCode =
      getStarterCode(language);

    const batchSize = 2;

    const totalBatches =
      Math.ceil(count / batchSize);

    const requests = [];

    for (
      let i = 0;
      i < totalBatches;
      i++
    ) {

      const remaining =
        count - i * batchSize;

      const currentBatchSize =
        Math.min(
          batchSize,
          remaining
        );

      const prompt =
        createPrompt({
          domain,
          difficulty,
          type,
          count:
            currentBatchSize,
          language,
          starterCode,
          aiPrompt,
        });

      requests.push(
        generateBatch({
          prompt,
        })
      );
    }

    const results =
      await Promise.all(requests);

    const questions =
      results.flat();

    const uniqueQuestions =
      removeDuplicateQuestions(
        questions
      );

    return uniqueQuestions.slice(
      0,
      count
    );

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    throw new Error(
      "Question generation failed"
    );
  }
};