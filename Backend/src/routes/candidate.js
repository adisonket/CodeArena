import express from "express";

import {
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
} from "../controllers/candidate.js";

const router = express.Router();

router.get("/", getAllCandidates);

router.get("/:id", getCandidateById);

router.delete(
  "/:id",
  deleteCandidate
);

export default router;