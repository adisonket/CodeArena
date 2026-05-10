import express from "express";

import {
  generateQuestionsController,
} from "../controllers/questionGenerator.js";

const router = express.Router();

router.post(
  "/generate",
  generateQuestionsController
);

export default router;