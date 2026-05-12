import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// ── Fix: point dotenv to Backend/.env regardless of where you run from ──
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // goes up: scripts → src → Backend

await mongoose.connect(process.env.MONGO_URI);

const existing = await Admin.findOne({ email: "admin@codearena.com" });
if (existing) {
  console.log("Admin already exists.");
} else {
  await Admin.create({
    email: "mrigankaadhikary01@gmail.com",
    password: "12345678",
    name: "Super Admin",
  });
  console.log("✅ Admin created successfully.");
}

await mongoose.disconnect();