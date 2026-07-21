const express = require("express");

const authController = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const {
  resendVerificationLimiter,
} = require("../middleware/rateLimiter.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/resend-verification",
  resendVerificationLimiter,
  authController.resendVerification,
);

router.get("/me", protect, authController.getCurrentUser);

module.exports = router;
