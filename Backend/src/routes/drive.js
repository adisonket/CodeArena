import express from "express";

import {
  getAllDrives,
  createDrive,
  getDriveCandidates,
  assignCandidatesToDrive,
} from "../controllers/drive.js";

const router = express.Router();

router.get("/", getAllDrives);

router.post("/", createDrive);




router.get("/:id/candidates", getDriveCandidates);

router.post(
  "/:id/assign-candidates",
  assignCandidatesToDrive
);

export default router;