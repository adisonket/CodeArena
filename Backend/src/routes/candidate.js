import express from "express";

import {
  getAllCandidates,
  getCandidateById,
} from "../controllers/candidate.js";

const router = express.Router();

router.get("/", getAllCandidates);

router.get("/:id", getCandidateById);

export default router;