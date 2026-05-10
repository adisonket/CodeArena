import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";

import connectDB from "./lib/db.js";

import authRoutes from "./routes/auth.js";
import googleRoutes, {
  initGoogleStrategy,
} from "./routes/google.js";

import twoFactorRoutes from "./routes/twoFactor.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profile.js";
import practiceRoutes from "./routes/practice.js";
import compilerRoutes from "./routes/compiler.js";
import aiQuestionRoutes from "./routes/aiQuestions.js";

dotenv.config();

initGoogleStrategy();

connectDB();

const app = express();

// ============================
// CORS
// ============================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ============================
// BODY PARSER
// ============================

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ============================
// SESSION
// ============================

app.use(
  session({
    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      secure: false,
    },
  })
);

// ============================
// PASSPORT
// ============================

app.use(passport.initialize());

app.use(passport.session());

// ============================
// STATIC
// ============================

app.use(
  "/uploads",
  express.static("uploads")
);

// ============================
// RATE LIMITER
// ============================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max:
    process.env.NODE_ENV ===
    "production"
      ? 20
      : 1000,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

// ============================
// ROUTES
// ============================

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/auth/google",
  googleRoutes
);

app.use(
  "/api/2fa",
  authLimiter,
  twoFactorRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/practice",
  practiceRoutes
);

app.use(
  "/api/compiler",
  compilerRoutes
);

app.use(
  "/api/ai",
  aiQuestionRoutes
);

// ============================
// HEALTH CHECK
// ============================

app.get("/", (req, res) => {

  res.json({
    status: "API is running 🚀",
  });
});

app.get("/api/test", (req, res) => {

  res.json({
    message:
      "Frontend + Backend Connected",
  });
});

// ============================
// 404
// ============================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ============================
// ERROR HANDLER
// ============================

app.use(
  (err, req, res, next) => {

    console.error(err.stack);

    res.status(500).json({
      success: false,
      message:
        "Something went wrong.",
    });
  }
);

// ============================
// SERVER
// ============================

const PORT =
  process.env.PORT || 4000;

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );
});