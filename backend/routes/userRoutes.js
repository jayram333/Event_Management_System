const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get user profile
router.get(
  "/profile",
  authMiddleware,
  getUserProfile
);

// Update user profile
router.put(
  "/profile",
  authMiddleware,
  updateUserProfile
);

// Change user password
router.put(
  "/change-password",
  authMiddleware,
  changeUserPassword
);

module.exports = router;