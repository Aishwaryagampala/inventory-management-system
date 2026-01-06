const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { login, logout, session } = require("../controllers/authControllers.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  validate,
  loginSchema,
} = require("../middleware/validationMiddleware.js");

// Rate limiter for login attempts - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/session", session);

module.exports = router;
