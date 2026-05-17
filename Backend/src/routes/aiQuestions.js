import express from "express";
import { protect } from "../middleware/auth.js";
import { generatePracticeController } from "../controllers/practiceGenerator.js";

import {
  generateQuestionsController,
} from "../controllers/questionGenerator.js";

const router = express.Router();

router.post(
  "/generate",
  generateQuestionsController
);

router.post('/practice-generate', protect, generatePracticeController);

export default router;