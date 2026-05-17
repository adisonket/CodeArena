import express from "express";

import {
    generateDrivePrompt,
} from "../controllers/aiPrompt.js";

const router = express.Router();

router.post(
    "/generate-drive-prompt",
    generateDrivePrompt
);

export default router;