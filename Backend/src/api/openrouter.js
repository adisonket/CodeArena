import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ============================
// OPENROUTER CLIENT
// ============================

const openrouter = axios.create({
  baseURL: "https://openrouter.ai/api/v1",

  headers: {
    Authorization:
      `Bearer ${process.env.OPENROUTER_API_KEY}`,

    "Content-Type":
      "application/json",
  },
});

// ============================
// LANGUAGE DETECTION
// ============================

const detectLanguage = (domain = "") => {

  const text =
    domain.toLowerCase();

  // Frontend

  if (
    text.includes("frontend") ||
    text.includes("react") ||
    text.includes("javascript") ||
    text.includes("js") ||
    text.includes("node")
  ) {
    return "JavaScript";
  }

  // TypeScript

  if (
    text.includes("typescript") ||
    text.includes("ts")
  ) {
    return "TypeScript";
  }

  // Python

  if (
    text.includes("python") ||
    text.includes("ml") ||
    text.includes("ai")
  ) {
    return "Python";
  }

  // Java

  if (
    text.includes("java") &&
    !text.includes("javascript")
  ) {
    return "Java";
  }

  // C++

  if (
    text.includes("c++") ||
    text.includes("cpp")
  ) {
    return "C++";
  }

  // C#

  if (
    text.includes("c#") ||
    text.includes(".net")
  ) {
    return "C#";
  }

  // PHP

  if (
    text.includes("php") ||
    text.includes("laravel")
  ) {
    return "PHP";
  }

  // Go

  if (
    text.includes("golang") ||
    text.includes("go developer")
  ) {
    return "Go";
  }

  // Fullstack / SWE fallback

  if (
    text.includes("software engineer") ||
    text.includes("full stack") ||
    text.includes("backend")
  ) {
    return "JavaScript";
  }

  // Default

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

const removeDuplicateQuestions =
(questions = []) => {

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
              .toLowerCase() ===
            normalized
        )
      );
    }
  );
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
}) => {

  const language =
    detectLanguage(domain);

  const starterCode =
    getStarterCode(language);

  let prompt = "";

  // ============================
  // CODING QUESTIONS
  // ============================

  if (type === "CODING") {

    prompt = `
Generate ${count} COMPLETELY DIFFERENT and NON-REPEATING ${difficulty} level coding interview questions for ${domain}.

Requirements:
- Every question must test a DIFFERENT concept
- Avoid repeated topics
- Avoid reworded duplicates
- Use real-world interview style questions
- Include algorithmic and practical coding challenges
- Questions must be unique from each other

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- Generate coding questions in ${language}
- Include starterCode
- Include language field

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

  // ============================
  // MCQ QUESTIONS
  // ============================

  else {

    prompt = `
Generate ${count} COMPLETELY DIFFERENT and NON-REPEATING ${difficulty} level MCQ interview questions for ${domain}.

Requirements:
- Every question must test a DIFFERENT concept
- Avoid repeated topics
- Avoid reworded duplicates
- Questions must be industry-relevant

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- Each question must have exactly 4 options

Format:
[
  {
    "question": "",
    "options": [],
    "answer": ""
  }
]
`;
  }

  try {

    const response =
      await openrouter.post(
        "/chat/completions",
        {
          model:
            "openrouter/auto",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.4,
        }
      );

    const rawResult =
      response.data?.choices?.[0]
        ?.message?.content || "[]";

    let parsedQuestions = [];

    try {

      parsedQuestions =
        JSON.parse(rawResult);

    } catch (error) {

      console.log(
        "Invalid JSON:",
        rawResult
      );

      throw new Error(
        "AI returned invalid JSON"
      );
    }

    const uniqueQuestions =
      removeDuplicateQuestions(
        parsedQuestions
      );

    return JSON.stringify(
      uniqueQuestions
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