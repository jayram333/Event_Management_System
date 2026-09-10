const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerOrganizer,
  registerUser,
  verifyEmailOtp,
  loginOrganizer,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();


// ===============================
// ORGANIZER
// ===============================

// Organizer registration
router.post("/organizer/register", registerOrganizer);

// Organizer login
router.post("/organizer/login", loginOrganizer);


// ===============================
// USER
// ===============================

// User registration
router.post("/user/register", registerUser);

// User login
router.post("/user/login", loginUser);


// ===============================
// EMAIL VERIFICATION & FORGOT PASSWORD
// ===============================

// Verify email OTP
router.post("/verify-email", verifyEmailOtp);

// Forgot Password Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Protected test route
router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "JWT authentication is working",
    user: req.user,
  });
});

module.exports = router;