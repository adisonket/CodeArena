import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/auth.js";
import {
  getProfile, updateProfile, uploadPhoto, uploadResume,
  deleteResume, updateEducation, uploadEduDoc, deleteEduDoc,
  analyzeResume,  completeSetup,
} from "../controllers/profile.js";

const router = express.Router();

// ── Ensure upload folders exist ───────────────────────────────────────────────
["uploads/photos", "uploads/resumes", "uploads/edu-docs"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Multer storage factory ────────────────────────────────────────────────────
const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (_, __, cb) => cb(null, folder),
    filename: (_, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

const photoUpload = multer({
  storage: makeStorage("uploads/photos"),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

const resumeUpload = multer({
  storage: makeStorage("uploads/resumes"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const allowed = [".pdf", ".docx"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error("Only PDF and DOCX files allowed"));
  },
});

const eduDocUpload = multer({
  storage: makeStorage("uploads/edu-docs"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === ".pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});


// ── KYC upload ────────────────────────────────────────────────────────────────
if (!fs.existsSync("uploads/kyc")) fs.mkdirSync("uploads/kyc", { recursive: true });

const kycUpload = multer({
  storage: makeStorage("uploads/kyc"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error("Only JPG, PNG, or PDF files allowed"));
  },
});


// ── Routes ────────────────────────────────────────────────────────────────────
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.post("/photo", protect, photoUpload.single("photo"), uploadPhoto);

router.post("/resume/analyze", protect, analyzeResume);
router.post("/resume", protect, resumeUpload.single("resume"), uploadResume);
router.delete("/resume", protect, deleteResume);

router.put("/education", protect, updateEducation);
router.post("/education/:eduId/doc", protect, eduDocUpload.single("doc"), uploadEduDoc);
router.delete("/education/:eduId/doc/:docId", protect, deleteEduDoc);
router.post(
  "/complete-setup",
  protect,
  kycUpload.fields([{ name: "aadhaar", maxCount: 1 }, { name: "pan", maxCount: 1 }]),
  completeSetup
);

// ── Multer error handler ──────────────────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;